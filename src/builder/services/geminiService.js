import { GoogleGenAI } from '@google/genai'

const MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `You are an expert educational content designer specialising in pharmacy and clinical decision-making. Create a detailed branching scenario for an OTC patient counselling simulation.

The scenario simulates a realistic pharmacy counter interaction where the learner (a pharmacy student or OTC assistant) must make correct clinical decisions to appropriately advise a patient.

Rules:
- Create 5-8 decision nodes (branching questions), each testing a key clinical decision point
- Each node must have 2-4 choices
- Choices route to other nodes (by integer id >= 0) or to end screens (by -1 for success, -2 for failure)
- Create exactly 2 end screens: id -1 for success (safe correct outcome), id -2 for failure (unsafe/incorrect approach)
- Good clinical decisions eventually lead to the success end screen (-1)
- Poor decisions (missing red flags, contraindicated products, unsafe advice) lead to failure (-2)
- Node IDs are 0-indexed integers starting from 0; the first node (id 0) opens the scenario
- Every next_node value MUST reference a valid node id, -1 (success), or -2 (failure) — no dangling IDs
- Make the scenario clinically realistic: include patient demographics, symptom onset, duration, and relevant history in the question text
- Per-choice feedback should be 1-2 educational sentences explaining WHY the choice was correct or incorrect
- The scenario must flow logically as a tree — avoid loops

IMPORTANT: Respond with ONLY valid JSON matching this exact structure:
{
  "title": "OTC Scenario: [Brief descriptive title]",
  "start_screen": {
    "title": "OTC Patient Consultation",
    "subtitle": "One sentence describing who the patient is and their presenting complaint"
  },
  "nodes": [
    {
      "id": 0,
      "question": "Full patient scenario and clinical question for the learner",
      "choices": [
        {
          "text": "What the learner would say or do",
          "next_node": 1,
          "feedback_title": "Good choice",
          "feedback_body": "This is correct because..."
        }
      ]
    }
  ],
  "end_screens": [
    {
      "id": -1,
      "title": "Excellent Clinical Decision!",
      "subtitle": "You correctly assessed the patient and made a safe, appropriate recommendation.",
      "score": 100
    },
    {
      "id": -2,
      "title": "Review Your Approach",
      "subtitle": "There were gaps in your assessment or recommendation. Review the correct approach below.",
      "score": 0
    }
  ]
}`

function parseJsonResponse(text) {
  // Try direct parse
  try { return JSON.parse(text) } catch {}
  // Strip markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()) } catch {}
  }
  // Remove trailing commas before } or ]
  const cleaned = text.replace(/,(\s*[}\]])/g, '$1')
  try { return JSON.parse(cleaned) } catch {}
  throw new Error('Could not parse Gemini JSON response')
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function generateBranchingScenario(apiKey, extractedText, customInstructions = '') {
  const ai = new GoogleGenAI({ apiKey })

  const userPrompt = `Create a branching scenario based on this source material:\n\n---\n${extractedText}\n---${
    customInstructions ? `\n\nScenario focus / additional context: ${customInstructions}` : ''
  }`

  const MAX_RETRIES = 4
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json',
        },
      })
      const text = response.text
      return parseJsonResponse(text)
    } catch (err) {
      const msg = String(err).toLowerCase()
      const isRateLimit = msg.includes('429') || msg.includes('resource exhausted') || msg.includes('quota')
      if (attempt < MAX_RETRIES - 1) {
        await sleep(isRateLimit ? 15000 : Math.pow(2, attempt) * 1000)
      } else {
        throw err
      }
    }
  }
}

// OTC Games — Demo Module
// A pre-built training module covering Cold & Flu and Hayfever shelves.
// This file exports a content.json-shaped object for use as the default demo module.

export const demoModule = {
  version: '1.0',
  exportedAt: '2026-03-22T00:00:00.000Z',
  module: {
    name: 'Cold & Flu and Hayfever',
    description:
      'An introductory module covering common cold & flu preparations and OTC hayfever products. ' +
      'Practice selecting the right product for the patient, and test your knowledge of active ingredients and counselling points.',
    selectedShelfIds: ['cold-flu-1', 'hayfever'],
  },
  shelves: [
    { id: 'cold-flu-1', label: 'Cold & Flu', shelfNumber: 1, emoji: '🤧', color: '#4A90D9' },
    { id: 'hayfever',   label: 'Hayfever',   shelfNumber: 1, emoji: '🌿', color: '#27AE60' },
  ],
  products: [
    // Cold & Flu Shelf 1 — selected subset
    {
      id: 'strepsils-regular',
      name: 'Strepsils regular',
      brand: 'Strepsils',
      category: 'cold-flu-1',
      activeIngredient: '',
      color: '#FFFFFF',
      bgColor: '#4A90D9',
    },
    {
      id: 'otrivin-adult',
      name: 'Otrivin adult',
      brand: 'Otrivin',
      category: 'cold-flu-1',
      activeIngredient: '',
      color: '#FFFFFF',
      bgColor: '#4A90D9',
    },
    {
      id: 'demazin',
      name: 'Demazin',
      brand: 'Demazin',
      category: 'cold-flu-1',
      activeIngredient: '',
      color: '#FFFFFF',
      bgColor: '#4A90D9',
    },

    // Hayfever Shelf 1 — selected subset
    {
      id: 'claratyne-tablets',
      name: 'Claratyne tablets',
      brand: 'Claratyne',
      category: 'hayfever',
      activeIngredient: '',
      color: '#FFFFFF',
      bgColor: '#27AE60',
    },
    {
      id: 'rhinocort',
      name: 'Rhinocort',
      brand: 'Rhinocort',
      category: 'hayfever',
      activeIngredient: '',
      color: '#FFFFFF',
      bgColor: '#27AE60',
    },
    {
      id: 'nasonex',
      name: 'Nasonex',
      brand: 'Nasonex',
      category: 'hayfever',
      activeIngredient: '',
      color: '#FFFFFF',
      bgColor: '#27AE60',
    },
  ],

  scenarios: [
    {
      id: 'demo-scenario-001',
      shelfId: 'cold-flu-1',
      patient: {
        name: 'Mrs Patel',
        avatarEmoji: '👩',
        description:
          'Mrs Patel, 28 years old, presents with a sore throat that started yesterday. She describes it as raw and scratchy, ' +
          'with some mild difficulty swallowing. She has no fever, no nasal congestion, and is otherwise well. ' +
          'She has no significant medical history and takes no regular medications.',
      },
      bestChoiceProductId: 'strepsils-regular',
      acceptableProductIds: [],
      explanation:
        'Strepsils Regular contains two antibacterials (2,4-dichlorobenzyl alcohol and amylmetacresol) that provide local antiseptic action in the throat, ' +
        'making it the most targeted choice for a mild sore throat with no systemic features. ' +
        'Otrivin Adult is a nasal decongestant (xylometazoline) and has no role in treating sore throat. ' +
        'Demazin contains a sympathomimetic decongestant and antihistamine — appropriate for nasal congestion and runny nose, not isolated sore throat. ' +
        'Counsel Mrs Patel to allow the lozenge to dissolve slowly in the mouth every 2–3 hours as needed (max 12 per day), ' +
        'and to return if symptoms worsen, persist beyond 5 days, or are accompanied by high fever.',
      followUpQuestion: null,
    },
    {
      id: 'demo-scenario-002',
      shelfId: 'hayfever',
      patient: {
        name: 'Mr Barker',
        avatarEmoji: '👨',
        description:
          'Mr Barker, 41 years old, is a seasonal hayfever sufferer. He works as a bus driver and his hayfever symptoms — ' +
          'persistent sneezing, runny nose and itchy eyes — are significantly worse this spring. ' +
          'He has tried an oral antihistamine from the supermarket but it makes him drowsy on the job. ' +
          'He asks if there is something more effective that will not affect his driving.',
      },
      bestChoiceProductId: 'rhinocort',
      acceptableProductIds: ['nasonex'],
      explanation:
        'Mr Barker needs a non-sedating option that effectively controls persistent nasal symptoms. ' +
        'Rhinocort (budesonide nasal spray) and Nasonex (mometasone nasal spray) are both intranasal corticosteroids — the most effective OTC class for ' +
        'persistent allergic rhinitis — and have negligible systemic absorption, making them safe for drivers. ' +
        'Claratyne Tablets (loratadine 10mg) is a non-sedating oral antihistamine that would be a reasonable choice for mild intermittent symptoms, ' +
        'but for persistent moderate-to-severe nasal symptoms an intranasal corticosteroid is preferred. ' +
        'The supermarket product Mr Barker tried was likely a first-generation (sedating) antihistamine such as promethazine or chlorpheniramine — advise him to avoid those while driving. ' +
        'Counsel Mr Barker that intranasal steroids take 1–2 weeks for full effect and should be used regularly throughout the season.',
      followUpQuestion: null,
    },
  ],

  quizQuestions: [
    {
      id: 'demo-quiz-001',
      type: 'mcq',
      shelfId: 'cold-flu-1',
      question:
        'A patient with hypertension asks for an OTC product to relieve nasal congestion. Which product from the Cold & Flu shelf is MOST appropriate?',
      options: [
        'Otrivin Adult (xylometazoline nasal spray)',
        'Demazin (pseudoephedrine + chlorpheniramine)',
        'Strepsils Regular (antiseptic lozenges)',
        'None of the above — refer to the pharmacist',
      ],
      correctIndex: 2,
      explanation:
        'Otrivin Adult (xylometazoline) and Demazin (pseudoephedrine) are both sympathomimetic decongestants that can raise blood pressure and are contraindicated in hypertension. ' +
        'Strepsils Regular has no decongestant or cardiovascular effect and is safe to recommend, but it targets sore throat — not nasal congestion. ' +
        'In practice the best answer is to refer to the pharmacist, who can discuss saline nasal rinses or a steroid nasal spray as safer alternatives for this patient. ' +
        'The key learning point is that pseudoephedrine and xylometazoline are both contraindicated in uncontrolled hypertension.',
    },
    {
      id: 'demo-quiz-002',
      type: 'truefalse',
      shelfId: 'hayfever',
      statement:
        'Intranasal corticosteroids such as Rhinocort and Nasonex are more effective than oral antihistamines for persistent allergic rhinitis.',
      correctAnswer: true,
      explanation:
        'True. Clinical guidelines (ARIA 2020 and Australian Asthma Handbook) recommend intranasal corticosteroids as first-line therapy for persistent or moderate-to-severe allergic rhinitis. ' +
        'They reduce nasal inflammation at the source, controlling all four cardinal symptoms: sneezing, itching, rhinorrhoea and congestion. ' +
        'Oral antihistamines (including non-sedating agents like loratadine/Claratyne) are effective for sneezing and itch but are less effective for congestion. ' +
        'For patients with combined nasal and eye symptoms, an oral antihistamine may be added to an intranasal steroid.',
    },
    {
      id: 'demo-quiz-003',
      type: 'mcq',
      shelfId: 'hayfever',
      question:
        'A mother asks for something to stop her 6-year-old\'s hayfever symptoms during school. Which product is most appropriate?',
      options: [
        'Rhinocort (budesonide nasal spray) — approved from age 6',
        'Nasonex (mometasone nasal spray) — approved from age 3',
        'Claratyne Tablets (loratadine 10mg) — approved from age 12; use Claratyne Childrens syrup for under 12',
        'Demazin (pseudoephedrine) — safe in children over 6',
      ],
      correctIndex: 1,
      explanation:
        'Nasonex (mometasone) is approved for children from 3 years of age for seasonal and perennial allergic rhinitis and is an excellent first-line choice for school-aged children. ' +
        'Rhinocort (budesonide OTC formulation) is approved from age 6 and would also be acceptable. ' +
        'Claratyne Tablets 10mg are approved for adults and children 12 years and over — for a 6-year-old, Claratyne Childrens Syrup (5mg/5mL) or Childrens Tablets (5mg) should be used. ' +
        'Demazin contains pseudoephedrine, which is contraindicated in children under 12 years per current ACCC/TGA labelling restrictions.',
    },
  ],
}

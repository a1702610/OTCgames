import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreFloat } from './ScoreFloat.jsx'

function parseSentence(sentence) {
  return sentence.split('_')
}

function checkAnswer(input, accepted) {
  const normalised = input.trim().toLowerCase()
  return accepted.some((a) => a.trim().toLowerCase() === normalised)
}

export function FillInBlanksPlayer({ question, onAnswer, answered }) {
  const segments = parseSentence(question.sentence || '')
  const blankCount = segments.length - 1
  const [inputs, setInputs] = React.useState(() => Array(blankCount).fill(''))
  const [floatKey, setFloatKey] = React.useState(0)

  function handleSubmit() {
    if (answered) return
    const results = inputs.map((val, i) =>
      checkAnswer(val, question.blanks?.[i]?.answers || [])
    )
    const isAllCorrect = results.every(Boolean)
    const delta = isAllCorrect ? 1 : 0
    if (delta > 0) setFloatKey((k) => k + 1)
    onAnswer?.({ inputs, results, isAllCorrect, delta })
  }

  return (
    <div style={{ position: 'relative' }}>
      {answered && answered.delta > 0 && (
        <ScoreFloat delta={answered.delta} id={`score-${floatKey}`} />
      )}

      {/* Sentence with inline inputs */}
      <div style={{ fontSize: 16, fontWeight: 500, color: '#140F50', lineHeight: 2.2, marginBottom: 20, flexWrap: 'wrap', display: 'flex', alignItems: 'center', gap: '0 4px' }}>
        {segments.map((seg, i) => (
          <React.Fragment key={i}>
            <span>{seg}</span>
            {i < blankCount && (
              <input
                type="text"
                value={inputs[i]}
                onChange={(e) => {
                  if (answered) return
                  const next = [...inputs]
                  next[i] = e.target.value
                  setInputs(next)
                }}
                disabled={!!answered}
                placeholder="…"
                style={{
                  display: 'inline-block',
                  width: 140,
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: answered
                    ? `2px solid ${answered.results?.[i] ? '#27AE60' : '#E74C3C'}`
                    : '2px solid rgba(131,107,255,0.50)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#140F50',
                  background: answered
                    ? (answered.results?.[i] ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.15)')
                    : 'rgba(131,107,255,0.10)',
                  outline: 'none',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Submit button */}
      {!answered && (
        <button
          onClick={handleSubmit}
          disabled={inputs.some((v) => !v.trim())}
          style={{
            background: inputs.some((v) => !v.trim()) ? 'rgba(20,15,80,0.14)' : '#836BFF',
            color: inputs.some((v) => !v.trim()) ? 'rgba(20,15,80,0.35)' : '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            padding: '10px 24px',
            fontWeight: 700,
            fontSize: 14,
            cursor: inputs.some((v) => !v.trim()) ? 'default' : 'pointer',
          }}
        >
          Check Answers
        </button>
      )}

      {/* Result feedback */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: 16, padding: '12px 16px',
              backgroundColor: 'rgba(20,15,80,0.04)',
              border: '1px solid rgba(20,15,80,0.10)',
              borderRadius: 10, fontSize: 13, color: 'rgba(20,15,80,0.70)', lineHeight: 1.6,
              borderLeft: `4px solid ${answered.isAllCorrect ? '#27AE60' : '#E74C3C'}`,
            }}
          >
            <strong style={{ color: answered.isAllCorrect ? '#5dda8a' : '#f87171' }}>
              {answered.isAllCorrect ? '✓ All correct!' : '✗ Not quite.'}
            </strong>
            {!answered.isAllCorrect && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(20,15,80,0.50)' }}>
                {(question.blanks || []).map((blank, i) => (
                  <div key={i}>
                    Blank {i + 1}: accepted — {blank.answers.join(', ')}
                  </div>
                ))}
              </div>
            )}
            {question.explanation && (
              <div style={{ marginTop: 8 }}>{question.explanation}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

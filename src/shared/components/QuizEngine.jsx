import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreFloat } from './ScoreFloat.jsx'

export function QuizEngine({ question, onAnswer, answered }) {
  // question: { type, question/statement, options, correctIndex, correctAnswer, explanation }
  // answered: null | { selectedIndex, isCorrect, delta }
  const [floatKey, setFloatKey] = React.useState(0)
  const [floatDelta, setFloatDelta] = React.useState(null)

  function handleAnswer(index) {
    if (answered) return
    let isCorrect
    if (question.type === 'mcq') {
      isCorrect = index === question.correctIndex
    } else {
      // truefalse: index 0 = true, index 1 = false
      isCorrect = (index === 0) === question.correctAnswer
    }
    const delta = isCorrect ? 1 : 0
    setFloatDelta(delta > 0 ? delta : null)
    setFloatKey((k) => k + 1)
    onAnswer?.({ selectedIndex: index, isCorrect, delta })
  }

  const options = question.type === 'mcq'
    ? question.options
    : ['True', 'False']

  const correctIndex = question.type === 'mcq'
    ? question.correctIndex
    : question.correctAnswer ? 0 : 1

  return (
    <div style={{ position: 'relative' }}>
      {floatDelta !== null && (
        <ScoreFloat delta={floatDelta} id={`score-${floatKey}`} />
      )}

      <p style={{ fontSize: 16, fontWeight: 600, color: '#140F50', marginBottom: 16 }}>
        {question.type === 'mcq' ? question.question : question.statement}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt, i) => {
          let bg = '#F8EFE0'
          let border = '2px solid rgba(20,15,80,0.12)'
          let color = '#140F50'

          if (answered) {
            if (i === correctIndex) {
              bg = '#D5F5E3'; border = '2px solid #27AE60'; color = '#1E8449'
            } else if (i === answered.selectedIndex && !answered.isCorrect) {
              bg = '#FADBD8'; border = '2px solid #E74C3C'; color = '#C0392B'
            }
          }

          return (
            <motion.button
              key={opt}
              whileHover={answered ? {} : { scale: 1.01 }}
              whileTap={answered ? {} : { scale: 0.99 }}
              onClick={() => handleAnswer(i)}
              disabled={!!answered}
              style={{
                background: bg,
                border,
                color,
                borderRadius: 10,
                padding: '12px 16px',
                textAlign: 'left',
                cursor: answered ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.2s, border 0.2s, color 0.2s',
              }}
            >
              {opt}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: 16,
              padding: '12px 16px',
              backgroundColor: 'rgba(20,15,80,0.05)',
              borderRadius: 10,
              fontSize: 13,
              color: '#140F50',
              lineHeight: 1.6,
              borderLeft: `4px solid ${answered.isCorrect ? '#27AE60' : '#E74C3C'}`,
            }}
          >
            <strong>{answered.isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong>
            {' '}{question.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

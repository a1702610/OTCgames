import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreFloat } from './ScoreFloat.jsx'

export function QuizEngine({ question, onAnswer, answered }) {
  const [floatKey, setFloatKey] = React.useState(0)
  const [floatDelta, setFloatDelta] = React.useState(null)

  const { displayOptions, displayCorrectIndex } = React.useMemo(() => {
    if (question.type !== 'mcq') {
      return {
        displayOptions: ['True', 'False'],
        displayCorrectIndex: question.correctAnswer ? 0 : 1,
      }
    }
    const pairs = question.options
      .map((opt, i) => ({ opt, origIdx: i }))
      .filter(({ opt }) => opt.trim() !== '')

    for (let j = pairs.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1))
      ;[pairs[j], pairs[k]] = [pairs[k], pairs[j]]
    }

    return {
      displayOptions: pairs.map((p) => p.opt),
      displayCorrectIndex: pairs.findIndex((p) => p.origIdx === question.correctIndex),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  function handleAnswer(index) {
    if (answered) return
    const isCorrect = index === displayCorrectIndex
    const delta = isCorrect ? 1 : 0
    setFloatDelta(delta > 0 ? delta : null)
    setFloatKey((k) => k + 1)
    onAnswer?.({ selectedIndex: index, isCorrect, delta })
  }

  return (
    <div style={{ position: 'relative' }}>
      {floatDelta !== null && (
        <ScoreFloat delta={floatDelta} id={`score-${floatKey}`} />
      )}

      <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.90)', marginBottom: 16 }}>
        {question.type === 'mcq' ? question.question : question.statement}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {displayOptions.map((opt, i) => {
          let bg = 'rgba(255,255,255,0.055)'
          let border = '1.5px solid rgba(255,255,255,0.09)'
          let color = 'rgba(255,255,255,0.85)'

          if (answered) {
            if (i === displayCorrectIndex) {
              bg = 'rgba(39,174,96,0.15)'; border = '2px solid #27AE60'; color = '#5dda8a'
            } else if (i === answered.selectedIndex && !answered.isCorrect) {
              bg = 'rgba(231,76,60,0.15)'; border = '2px solid #E74C3C'; color = '#f87171'
            }
          }

          return (
            <motion.button
              key={opt}
              whileHover={answered ? {} : { scale: 1.01, background: 'rgba(255,255,255,0.08)' }}
              whileTap={answered ? {} : { scale: 0.99 }}
              onClick={() => handleAnswer(i)}
              disabled={!!answered}
              style={{
                background: bg, border, color, borderRadius: 10,
                padding: '12px 16px', textAlign: 'left',
                cursor: answered ? 'default' : 'pointer',
                fontSize: 14, fontWeight: 500,
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
              marginTop: 16, padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
              borderLeft: `4px solid ${answered.isCorrect ? '#27AE60' : '#E74C3C'}`,
            }}
          >
            <strong style={{ color: answered.isCorrect ? '#5dda8a' : '#f87171' }}>
              {answered.isCorrect ? '✓ Correct!' : '✗ Incorrect.'}
            </strong>
            {question.explanation ? ` ${question.explanation}` : ''}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

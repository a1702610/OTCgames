import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../PlayerContext.jsx'
import { QuizEngine } from '../../shared/components/QuizEngine.jsx'
import { FillInBlanksPlayer } from '../../shared/components/FillInBlanksPlayer.jsx'
import { ShelfModal } from '../../shared/components/ShelfModal.jsx'
import { ProgressBar } from '../../shared/components/ProgressBar.jsx'
import { formatScore } from '../../shared/utils/scoreUtils.js'
import { shuffle } from '../../shared/utils/shuffleUtils.js'

export function Quiz() {
  const { moduleData, addScore } = usePlayer()
  // Exclude drag & drop — they have their own tab
  const allQuestions = (moduleData?.quizQuestions || []).filter((q) => q.type !== 'dragdrop')

  const [restartKey, setRestartKey] = React.useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = React.useMemo(() => shuffle(allQuestions), [restartKey])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState({})
  const [completed, setCompleted] = React.useState(false)
  const [activeRefShelf, setActiveRefShelf] = React.useState(null)

  if (allQuestions.length === 0) {
    return <p style={{ color: 'rgba(20,15,80,0.40)', fontSize: 14 }}>No quiz questions in this module.</p>
  }

  if (completed) {
    const quizScore = Object.values(answers).reduce((sum, a) => {
      if (a?.isCorrect || a?.isAllCorrect) return sum + 1
      return sum
    }, 0)
    const result = formatScore(quizScore, questions.length)
    return (
      <QuizCompletionScreen
        result={result}
        onRestart={() => {
          setCurrentIndex(0)
          setAnswers({})
          setCompleted(false)
          setRestartKey((k) => k + 1)
        }}
      />
    )
  }

  const question = questions[currentIndex]
  const answered = answers[question.id]

  const questionShelf = question.shelfId ? moduleData.shelves.find((s) => s.id === question.shelfId) : null

  function handleAnswer(result) {
    if (result.delta > 0) addScore(result.delta)
    setAnswers((prev) => ({ ...prev, [question.id]: result }))
  }

  function handleNext() {
    const next = currentIndex + 1
    if (next >= questions.length) {
      setCompleted(true)
    } else {
      setCurrentIndex(next)
    }
  }

  return (
    <div>
      <ProgressBar current={currentIndex} total={questions.length} color="#836BFF" height={6} />
      <p style={{ fontSize: 12, color: 'rgba(20,15,80,0.45)', margin: '6px 0 16px', textAlign: 'right' }}>
        Question {currentIndex + 1} of {questions.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Question card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.78)',
              border: '1px solid rgba(131,107,255,0.20)',
              borderRadius: 16, padding: 20,
              backdropFilter: 'blur(20px)',
              marginBottom: 12,
            }}
          >
            {questionShelf && (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: `${questionShelf.color}28`, color: questionShelf.color,
                  border: `1px solid ${questionShelf.color}44`,
                  borderRadius: 20, padding: '2px 10px',
                  fontSize: 11, fontWeight: 600, marginBottom: 12,
                }}
              >
                {questionShelf.emoji} {questionShelf.label}
              </span>
            )}

            {question.type === 'fillinblanks' ? (
              <FillInBlanksPlayer
                question={question}
                onAnswer={answered ? undefined : handleAnswer}
                answered={answered}
              />
            ) : (
              <QuizEngine
                question={question}
                onAnswer={answered ? undefined : handleAnswer}
                answered={answered}
              />
            )}
          </div>

          {/* Next button */}
          {answered && (
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button
                onClick={handleNext}
                style={{
                  background: '#836BFF', color: '#FFFFFF', border: 'none',
                  borderRadius: 10, padding: '10px 24px',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                {currentIndex + 1 >= questions.length ? 'Finish' : 'Next →'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reference shelves — always shown, student can browse any shelf */}
      {moduleData.shelves.length > 0 && (
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(131,107,255,0.15)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(20,15,80,0.40)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
            Reference Shelves
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {moduleData.shelves.map((s) => {
              const count = moduleData.products.filter((p) => p.category === s.id).length
              return (
                <div
                  key={s.id}
                  style={{
                    background: `linear-gradient(135deg, ${s.color}dd 0%, ${s.color}99 100%)`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{s.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{count} products</div>
                  </div>
                  <button
                    onClick={() => setActiveRefShelf(s)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(255,255,255,0.22)',
                      border: '1.5px solid rgba(255,255,255,0.40)',
                      borderRadius: 8, color: '#FFFFFF',
                      fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeRefShelf && (
        <ShelfModal
          shelf={activeRefShelf}
          products={moduleData.products.filter((p) => p.category === activeRefShelf.id)}
          mode="browse"
          onClose={() => setActiveRefShelf(null)}
        />
      )}
    </div>
  )
}

function QuizCompletionScreen({ result, onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: 'center', padding: 32,
        background: 'rgba(255,255,255,0.78)',
        border: '1px solid rgba(131,107,255,0.20)',
        borderRadius: 20,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
      <h2 style={{ color: '#140F50', margin: '0 0 8px' }}>Quiz Complete!</h2>
      <div
        style={{
          display: 'inline-block', background: result.grade.color, color: '#FFFFFF',
          borderRadius: 12, padding: '6px 20px', fontWeight: 700, fontSize: 18, marginBottom: 12,
        }}
      >
        {result.grade.label} ({result.grade.code})
      </div>
      <p style={{ color: 'rgba(20,15,80,0.60)', fontSize: 15, margin: '0 0 20px' }}>
        {result.score} / {result.maxScore} points ({result.percentage}%)
      </p>
      <button
        onClick={onRestart}
        style={{
          background: '#1448FF', color: '#FFFFFF', border: 'none',
          borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </motion.div>
  )
}

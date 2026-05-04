import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../PlayerContext.jsx'
import { DragDropQuestion } from '../../shared/components/DragDropQuestion.jsx'
import { ProgressBar } from '../../shared/components/ProgressBar.jsx'
import { formatScore } from '../../shared/utils/scoreUtils.js'

export function DragDropTab() {
  const { moduleData, addScore } = usePlayer()
  const questions = (moduleData?.quizQuestions || []).filter((q) => q.type === 'dragdrop')

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState({})
  const [completed, setCompleted] = React.useState(false)
  const [restartKey, setRestartKey] = React.useState(0)

  if (questions.length === 0) {
    return <p style={{ color: 'rgba(20,15,80,0.40)', fontSize: 14 }}>No drag &amp; drop questions in this module.</p>
  }

  if (completed) {
    const score = Object.values(answers).reduce((sum, a) => sum + (a?.isAllCorrect ? 1 : 0), 0)
    const result = formatScore(score, questions.length)
    return (
      <CompletionScreen
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
      <ProgressBar current={currentIndex} total={questions.length} color="#E67E22" height={6} />
      <p style={{ fontSize: 12, color: 'rgba(20,15,80,0.45)', margin: '6px 0 16px', textAlign: 'right' }}>
        Question {currentIndex + 1} of {questions.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${question.id}-${restartKey}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ borderRadius: 16, overflow: 'hidden' }}>
            <DragDropQuestion
              question={question}
              products={moduleData.products}
              onSubmit={answered ? undefined : handleAnswer}
              submitted={answered}
            />
          </div>

          {answered && (
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <button
                onClick={handleNext}
                style={{
                  background: '#E67E22', color: '#FFFFFF', border: 'none',
                  borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                {currentIndex + 1 >= questions.length ? 'Finish' : 'Next →'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function CompletionScreen({ result, onRestart }) {
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
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
      <h2 style={{ color: '#140F50', margin: '0 0 8px' }}>Drag &amp; Drop Complete!</h2>
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
          background: '#E67E22', color: '#FFFFFF', border: 'none',
          borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </motion.div>
  )
}

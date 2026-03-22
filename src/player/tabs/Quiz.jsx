import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../PlayerContext.jsx'
import { QuizEngine } from '../../shared/components/QuizEngine.jsx'
import { DragDropQuestion } from '../../shared/components/DragDropQuestion.jsx'
import { FillInBlanksPlayer } from '../../shared/components/FillInBlanksPlayer.jsx'
import { ShelfDisplay } from '../../shared/components/ShelfDisplay.jsx'
import { ProgressBar } from '../../shared/components/ProgressBar.jsx'
import { formatScore } from '../../shared/utils/scoreUtils.js'
import { shuffle } from '../../shared/utils/shuffleUtils.js'

export function Quiz() {
  const { moduleData, addScore, score } = usePlayer()
  const allQuestions = moduleData?.quizQuestions || []

  const [restartKey, setRestartKey] = React.useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = React.useMemo(() => shuffle(allQuestions), [restartKey])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState({}) // { [questionId]: answeredState }
  const [completed, setCompleted] = React.useState(false)

  if (allQuestions.length === 0) {
    return <p style={{ color: 'rgba(20,15,80,0.5)', fontSize: 14 }}>No quiz questions in this module.</p>
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
          setRestartKey(k => k + 1)
        }}
      />
    )
  }

  const question = questions[currentIndex]
  const answered = answers[question.id]

  // Find shelf data
  const shelf = moduleData.shelves.find((s) => s.id === question.shelfId)
  const shelfProducts = moduleData.products.filter((p) => p.category === question.shelfId)

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
      <p style={{ fontSize: 12, color: 'rgba(20,15,80,0.5)', margin: '6px 0 16px', textAlign: 'right' }}>
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
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 12px rgba(20,15,80,0.1)',
              marginBottom: 12,
            }}
          >
            {/* Shelf chip */}
            {shelf && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: `${shelf.color}22`,
                  color: shelf.color,
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {shelf.emoji} {shelf.label}
              </span>
            )}

            {question.type === 'dragdrop' ? (
              <DragDropQuestion
                question={question}
                products={moduleData.products.filter((p) => p.category === question.shelfId)}
                onSubmit={answered ? undefined : handleAnswer}
                submitted={answered}
              />
            ) : question.type === 'fillinblanks' ? (
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

          {/* Shelf reference */}
          {shelf && shelfProducts.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(20,15,80,0.5)', margin: '0 0 8px' }}>
                Shelf reference — click any product to zoom
              </p>
              <ShelfDisplay shelf={shelf} products={shelfProducts} mode="browse" />
            </div>
          )}

          {/* Next button */}
          {answered && (
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={handleNext}
                style={{
                  background: '#836BFF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
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

function QuizCompletionScreen({ result, onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: 'center',
        padding: 32,
        background: '#FFFFFF',
        borderRadius: 20,
        boxShadow: '0 4px 24px rgba(20,15,80,0.12)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
      <h2 style={{ color: '#140F50', margin: '0 0 8px' }}>Quiz Complete!</h2>
      <div
        style={{
          display: 'inline-block',
          background: result.grade.color,
          color: '#FFFFFF',
          borderRadius: 12,
          padding: '6px 20px',
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 12,
        }}
      >
        {result.grade.label} ({result.grade.code})
      </div>
      <p style={{ color: '#555', fontSize: 15, margin: '0 0 20px' }}>
        {result.score} / {result.maxScore} points ({result.percentage}%)
      </p>
      <button
        onClick={onRestart}
        style={{
          background: '#140F50',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </motion.div>
  )
}

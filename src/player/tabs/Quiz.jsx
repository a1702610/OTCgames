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
  const { moduleData, addScore } = usePlayer()
  const allQuestions = moduleData?.quizQuestions || []

  const [restartKey, setRestartKey] = React.useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = React.useMemo(() => shuffle(allQuestions), [restartKey])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState({})
  const [completed, setCompleted] = React.useState(false)

  if (allQuestions.length === 0) {
    return <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>No quiz questions in this module.</p>
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

  const shelf = question.shelfId ? moduleData.shelves.find((s) => s.id === question.shelfId) : null
  const shelfProducts = question.shelfId ? moduleData.products.filter((p) => p.category === question.shelfId) : []

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

  const isDragDrop = question.type === 'dragdrop'

  return (
    <div>
      <ProgressBar current={currentIndex} total={questions.length} color="#836BFF" height={6} />
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '6px 0 16px', textAlign: 'right' }}>
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
              background: isDragDrop ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.045)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: isDragDrop ? 0 : 20,
              backdropFilter: isDragDrop ? undefined : 'blur(20px)',
              marginBottom: 12,
              overflow: isDragDrop ? 'hidden' : undefined,
            }}
          >
            {/* Shelf chip (non-dragdrop only) */}
            {!isDragDrop && shelf && (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: `${shelf.color}28`, color: shelf.color,
                  border: `1px solid ${shelf.color}44`,
                  borderRadius: 20, padding: '2px 10px',
                  fontSize: 11, fontWeight: 600, marginBottom: 12,
                }}
              >
                {shelf.emoji} {shelf.label}
              </span>
            )}

            {isDragDrop ? (
              <DragDropQuestion
                question={question}
                products={moduleData.products}
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

          {/* Shelf reference */}
          {!isDragDrop && shelf && shelfProducts.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.40)', margin: '0 0 8px' }}>
                Shelf reference — click any product to zoom
              </p>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 16, overflowX: 'auto', paddingBottom: 8, alignItems: 'flex-start' }}>
                <ShelfDisplay shelf={shelf} products={shelfProducts} mode="browse" />
              </div>
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
        textAlign: 'center', padding: 32,
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
      <h2 style={{ color: 'rgba(255,255,255,0.90)', margin: '0 0 8px' }}>Quiz Complete!</h2>
      <div
        style={{
          display: 'inline-block', background: result.grade.color, color: '#FFFFFF',
          borderRadius: 12, padding: '6px 20px', fontWeight: 700, fontSize: 18, marginBottom: 12,
        }}
      >
        {result.grade.label} ({result.grade.code})
      </div>
      <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 15, margin: '0 0 20px' }}>
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

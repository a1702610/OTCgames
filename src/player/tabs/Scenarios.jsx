import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../PlayerContext.jsx'
import { ShelfDisplay } from '../../shared/components/ShelfDisplay.jsx'
import { QuizEngine } from '../../shared/components/QuizEngine.jsx'
import { ProgressBar } from '../../shared/components/ProgressBar.jsx'
import { formatScore } from '../../shared/utils/scoreUtils.js'

export function Scenarios({ onNavigateToQuiz }) {
  const { moduleData, addScore } = usePlayer()
  const scenarios = moduleData?.scenarios || []

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [phase, setPhase] = React.useState('presenting') // presenting | awaiting-selection | confirming | feedback | followup | done
  const [pendingProductId, setPendingProductId] = React.useState(null)   // selected but not yet confirmed
  const [selectedProductId, setSelectedProductId] = React.useState(null) // confirmed selection
  const [selectionResult, setSelectionResult] = React.useState(null)
  const [followupAnswered, setFollowupAnswered] = React.useState(null)
  const [completed, setCompleted] = React.useState(false)
  const [scenarioScore, setScenarioScore] = React.useState(0)

  if (scenarios.length === 0) {
    return <p style={{ color: 'rgba(20,15,80,0.5)', fontSize: 14 }}>No patient scenarios in this module.</p>
  }

  const scenarioMaxScore = scenarios.reduce((sum, s) => sum + 1 + (s.followUpQuestion ? 1 : 0), 0)

  if (completed) {
    const result = formatScore(scenarioScore, scenarioMaxScore)
    return (
      <CompletionScreen
        result={result}
        onRestart={() => {
          setCurrentIndex(0)
          setCompleted(false)
          setPhase('presenting')
          setSelectionResult(null)
          setSelectedProductId(null)
          setPendingProductId(null)
          setFollowupAnswered(null)
          setScenarioScore(0)
        }}
        onNavigateToQuiz={onNavigateToQuiz}
      />
    )
  }

  const scenario = scenarios[currentIndex]
  const shelfData = moduleData.shelves.find((s) => s.id === scenario.shelfId)
  const shelfProducts = moduleData.products.filter((p) => p.category === scenario.shelfId)

  function handleProductPending(productId) {
    if (phase !== 'awaiting-selection') return
    // Toggle off if same product tapped again
    setPendingProductId((prev) => (prev === productId ? null : productId))
  }

  function handleConfirm() {
    if (!pendingProductId) return
    const productId = pendingProductId
    setSelectedProductId(productId)
    setPendingProductId(null)

    const bestIds = scenario.bestChoiceProductIds || (scenario.bestChoiceProductId ? [scenario.bestChoiceProductId] : [])
    let tier, delta
    if (bestIds.includes(productId)) {
      tier = 'best'; delta = 1
    } else if (scenario.acceptableProductIds?.includes(productId)) {
      tier = 'acceptable'; delta = 0.5
    } else {
      tier = 'incorrect'; delta = 0
    }
    if (delta > 0) {
      addScore(delta)
      setScenarioScore(prev => prev + delta)
    }
    setSelectionResult({ tier, delta, productId })
    setPhase('feedback')
  }

  function handleNext() {
    if (phase === 'feedback' && scenario.followUpQuestion) {
      setPhase('followup')
      return
    }
    const nextIndex = currentIndex + 1
    if (nextIndex >= scenarios.length) {
      setCompleted(true)
    } else {
      setCurrentIndex(nextIndex)
      setPhase('presenting')
      setSelectedProductId(null)
      setPendingProductId(null)
      setSelectionResult(null)
      setFollowupAnswered(null)
    }
  }

  function handleFollowupAnswer(result) {
    if (result.isCorrect) {
      addScore(1)
      setScenarioScore(prev => prev + 1)
    }
    setFollowupAnswered(result)
  }

  const tierColors = { best: '#27AE60', acceptable: '#E67E22', incorrect: '#E74C3C' }
  const tierLabels = { best: 'Best Choice (+1)', acceptable: 'Acceptable (+0.5)', incorrect: 'Incorrect (0)' }

  // In awaiting-selection mode, pass pendingProductId as the "selected" highlight
  const displaySelectedId = phase === 'awaiting-selection' ? pendingProductId : selectedProductId

  return (
    <div>
      <ProgressBar current={currentIndex} total={scenarios.length} color="#1448FF" height={6} />
      <p style={{ fontSize: 12, color: 'rgba(20,15,80,0.5)', margin: '6px 0 16px', textAlign: 'right' }}>
        Scenario {currentIndex + 1} of {scenarios.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Patient card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              boxShadow: '0 2px 12px rgba(20,15,80,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ fontSize: 40 }}>{scenario.patient.avatarEmoji}</span>
              <div>
                <h3 style={{ margin: 0, color: '#140F50', fontSize: 16 }}>{scenario.patient.name}</h3>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                  {scenario.patient.description}
                </p>
              </div>
            </div>
          </div>

          {/* "Select a product" prompt */}
          {phase === 'presenting' && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <button
                onClick={() => setPhase('awaiting-selection')}
                style={{
                  background: '#1448FF', color: '#FFFFFF', border: 'none',
                  borderRadius: 10, padding: '12px 28px',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >
                Select a product →
              </button>
            </div>
          )}

          {/* Shelf for selection */}
          {(phase === 'awaiting-selection' || phase === 'feedback' || phase === 'followup') && shelfData && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#836BFF', marginBottom: 8 }}>
                {phase === 'awaiting-selection' ? 'Choose the most appropriate product:' : 'Your selection:'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 16, overflowX: 'auto', paddingBottom: 8, alignItems: 'flex-start' }}>
                <ShelfDisplay
                  shelf={shelfData}
                  products={shelfProducts}
                  mode="select"
                  selectedProductId={displaySelectedId}
                  onSelect={phase === 'awaiting-selection' ? handleProductPending : undefined}
                />
              </div>

              {/* Confirm button — shown after a product is tapped */}
              {phase === 'awaiting-selection' && pendingProductId && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 14, textAlign: 'center' }}
                >
                  <p style={{ fontSize: 13, color: 'rgba(20,15,80,0.6)', marginBottom: 8 }}>
                    {shelfProducts.find(p => p.id === pendingProductId)?.name} — confirm your choice?
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button
                      onClick={() => setPendingProductId(null)}
                      style={{
                        background: 'rgba(20,15,80,0.06)', color: '#140F50',
                        border: '1.5px solid rgba(20,15,80,0.15)', borderRadius: 10,
                        padding: '10px 22px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      style={{
                        background: '#1448FF', color: '#FFFFFF', border: 'none',
                        borderRadius: 10, padding: '10px 28px',
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      Confirm →
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Feedback */}
          {(phase === 'feedback' || phase === 'followup') && selectionResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16,
                borderLeft: `5px solid ${tierColors[selectionResult.tier]}`,
                boxShadow: '0 2px 8px rgba(20,15,80,0.08)',
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, color: tierColors[selectionResult.tier], fontSize: 14 }}>
                {tierLabels[selectionResult.tier]}
              </p>
              {selectionResult.tier === 'incorrect' && (() => {
                const bestIds = scenario.bestChoiceProductIds || (scenario.bestChoiceProductId ? [scenario.bestChoiceProductId] : [])
                const bestNames = bestIds.map(id => moduleData.products.find(p => p.id === id)?.name || id).join(', ')
                return (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#555' }}>
                    Best choice{bestIds.length > 1 ? 's' : ''}: <strong>{bestNames}</strong>
                  </p>
                )
              })()}
              <p style={{ margin: '8px 0 0', fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                {scenario.explanation}
              </p>
            </motion.div>
          )}

          {/* Follow-up MCQ */}
          {phase === 'followup' && scenario.followUpQuestion && (
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 2px 8px rgba(20,15,80,0.08)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#836BFF', marginBottom: 8 }}>Follow-up question:</p>
              <QuizEngine
                question={{ ...scenario.followUpQuestion, type: 'mcq' }}
                onAnswer={followupAnswered ? undefined : handleFollowupAnswer}
                answered={followupAnswered}
              />
            </div>
          )}

          {/* Next button */}
          {(phase === 'feedback' || (phase === 'followup' && followupAnswered)) && (
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={handleNext}
                style={{
                  background: '#1448FF', color: '#FFFFFF', border: 'none',
                  borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                {currentIndex + 1 >= scenarios.length && !(phase === 'feedback' && scenario.followUpQuestion) ? 'Finish' : 'Next →'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function CompletionScreen({ result, onRestart, onNavigateToQuiz }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: 'center', padding: 32, background: '#FFFFFF',
        borderRadius: 20, boxShadow: '0 4px 24px rgba(20,15,80,0.12)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
      <h2 style={{ color: '#140F50', margin: '0 0 8px' }}>Scenarios Complete!</h2>
      <div
        style={{
          display: 'inline-block', background: result.grade.color, color: '#FFFFFF',
          borderRadius: 12, padding: '6px 20px', fontWeight: 700, fontSize: 18, marginBottom: 12,
        }}
      >
        {result.grade.label} ({result.grade.code})
      </div>
      <p style={{ color: '#555', fontSize: 15, margin: '0 0 24px' }}>
        {result.score} / {result.maxScore} points ({result.percentage}%)
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onRestart}
          style={{
            background: 'rgba(20,15,80,0.08)', color: '#140F50',
            border: '1.5px solid rgba(20,15,80,0.15)', borderRadius: 10,
            padding: '10px 24px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        {onNavigateToQuiz && (
          <button
            onClick={onNavigateToQuiz}
            style={{
              background: '#1448FF', color: '#FFFFFF', border: 'none',
              borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Move to Quiz →
          </button>
        )}
      </div>
    </motion.div>
  )
}

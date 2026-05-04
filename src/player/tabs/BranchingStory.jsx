import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../PlayerContext.jsx'

export function BranchingStory() {
  const { moduleData, addScore } = usePlayer()
  const scenarios = moduleData?.branchingScenarios || []

  const [scenarioIndex, setScenarioIndex] = React.useState(0)
  const [gameState, setGameState] = React.useState('start') // 'start' | 'playing' | 'feedback' | 'end'
  const [currentNodeId, setCurrentNodeId] = React.useState(0)
  const [pendingChoice, setPendingChoice] = React.useState(null) // { choice, nextNodeId }
  const [path, setPath] = React.useState([]) // visited node ids

  const scenario = scenarios[scenarioIndex]

  function resetScenario() {
    setGameState('start')
    setCurrentNodeId(0)
    setPendingChoice(null)
    setPath([])
  }

  if (scenarios.length === 0) {
    return (
      <p style={{ color: 'rgba(20,15,80,0.40)', fontSize: 14 }}>
        No branching scenarios in this module.
      </p>
    )
  }

  // Scenario picker when multiple scenarios exist
  if (gameState === 'start') {
    return (
      <StartScreen
        scenario={scenario}
        scenarioIndex={scenarioIndex}
        total={scenarios.length}
        onStart={() => setGameState('playing')}
        onPrev={scenarioIndex > 0 ? () => { setScenarioIndex(i => i - 1); resetScenario() } : null}
        onNext={scenarioIndex < scenarios.length - 1 ? () => { setScenarioIndex(i => i + 1); resetScenario() } : null}
      />
    )
  }

  if (gameState === 'end') {
    const endScreen = pendingChoice?.endScreen
    return (
      <EndScreen
        endScreen={endScreen}
        path={path}
        scenario={scenario}
        onRestart={resetScenario}
        onNext={scenarioIndex < scenarios.length - 1 ? () => {
          setScenarioIndex(i => i + 1)
          resetScenario()
        } : null}
      />
    )
  }

  const currentNode = scenario.nodes.find((n) => n.id === currentNodeId)
  if (!currentNode) return <p style={{ color: '#f87171' }}>Error: node {currentNodeId} not found.</p>

  function handleChoiceClick(choice) {
    const nextId = choice.next_node
    const endScreen = nextId < 0 ? scenario.end_screens.find((e) => e.id === nextId) : null
    setPendingChoice({ choice, nextId, endScreen })
    setGameState('feedback')
  }

  function handleProceed() {
    const { nextId, endScreen } = pendingChoice
    if (endScreen) {
      if (endScreen.score > 0) addScore(endScreen.score)
      setGameState('end')
    } else {
      setPath((prev) => [...prev, currentNodeId])
      setCurrentNodeId(nextId)
      setPendingChoice(null)
      setGameState('playing')
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {path.map((id) => (
          <div key={id} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(131,107,255,0.60)' }} />
        ))}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#836BFF' }} />
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'playing' && (
          <motion.div
            key={`node-${currentNodeId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <NodeCard node={currentNode} onChoiceClick={handleChoiceClick} />
          </motion.div>
        )}

        {gameState === 'feedback' && pendingChoice && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <FeedbackCard
              choice={pendingChoice.choice}
              isEnd={!!pendingChoice.endScreen}
              endScreen={pendingChoice.endScreen}
              onProceed={handleProceed}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StartScreen({ scenario, scenarioIndex, total, onStart, onPrev, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.78)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        backdropFilter: 'blur(20px)',
        padding: 32,
        textAlign: 'center',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      {total > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={onPrev}
            disabled={!onPrev}
            style={{
              background: 'rgba(20,15,80,0.80)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, color: onPrev ? 'rgba(20,15,80,0.80)' : 'rgba(20,15,80,0.22)',
              cursor: onPrev ? 'pointer' : 'default', padding: '4px 12px', fontSize: 18,
            }}
          >
            ‹
          </button>
          <span style={{ fontSize: 12, color: 'rgba(20,15,80,0.45)' }}>
            Scenario {scenarioIndex + 1} of {total}
          </span>
          <button
            onClick={onNext}
            disabled={!onNext}
            style={{
              background: 'rgba(20,15,80,0.80)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, color: onNext ? 'rgba(20,15,80,0.80)' : 'rgba(20,15,80,0.22)',
              cursor: onNext ? 'pointer' : 'default', padding: '4px 12px', fontSize: 18,
            }}
          >
            ›
          </button>
        </div>
      )}

      <div style={{ fontSize: 52, marginBottom: 16 }}>🏥</div>
      <h2 style={{ color: '#140F50', margin: '0 0 8px', fontSize: 20 }}>
        {scenario.start_screen?.title || scenario.title}
      </h2>
      <p style={{ color: 'rgba(20,15,80,0.60)', fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
        {scenario.start_screen?.subtitle || ''}
      </p>
      <button
        onClick={onStart}
        style={{
          background: '#1448FF', color: '#FFFFFF', border: 'none',
          borderRadius: 12, padding: '12px 32px',
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
        }}
      >
        Begin Scenario →
      </button>
    </motion.div>
  )
}

function NodeCard({ node, onChoiceClick }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.78)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
    >
      {/* Question */}
      <div style={{ padding: '24px 24px 20px' }}>
        <p style={{
          color: '#140F50', fontSize: 15, lineHeight: 1.7,
          margin: 0, whiteSpace: 'pre-wrap',
        }}>
          {node.question}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(20,15,80,0.07)', margin: '0 24px' }} />

      {/* Choices */}
      <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(20,15,80,0.35)', margin: '0 0 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          What do you do?
        </p>
        {node.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => onChoiceClick(choice)}
            style={{
              background: 'rgba(20,15,80,0.05)',
              border: '1.5px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: '12px 16px',
              color: 'rgba(20,15,80,0.80)',
              fontSize: 14,
              textAlign: 'left',
              cursor: 'pointer',
              lineHeight: 1.5,
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(131,107,255,0.50)'
              e.currentTarget.style.background = 'rgba(131,107,255,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(20,15,80,0.14)'
              e.currentTarget.style.background = 'rgba(20,15,80,0.05)'
            }}
          >
            <span style={{ color: '#836BFF', fontWeight: 700, marginRight: 8 }}>
              {String.fromCharCode(65 + i)}.
            </span>
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  )
}

function FeedbackCard({ choice, isEnd, endScreen, onProceed }) {
  const isSuccess = endScreen?.score > 0
  const accentColor = isEnd ? (isSuccess ? '#27AE60' : '#E74C3C') : '#836BFF'
  const bgColor = isEnd
    ? (isSuccess ? 'rgba(39,174,96,0.10)' : 'rgba(231,76,60,0.10)')
    : 'rgba(131,107,255,0.08)'
  const borderColor = isEnd
    ? (isSuccess ? 'rgba(39,174,96,0.30)' : 'rgba(231,76,60,0.30)')
    : 'rgba(131,107,255,0.25)'

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 20,
        backdropFilter: 'blur(20px)',
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(20,15,80,0.45)', margin: '0 0 4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Your choice
        </p>
        <p style={{ color: 'rgba(20,15,80,0.70)', fontSize: 14, margin: 0, fontStyle: 'italic' }}>
          "{choice.text}"
        </p>
      </div>

      <div style={{ height: 1, background: borderColor, marginBottom: 16 }} />

      <h3 style={{ color: accentColor, margin: '0 0 8px', fontSize: 16 }}>
        {choice.feedback_title || (isEnd ? (endScreen?.title) : 'Feedback')}
      </h3>
      <p style={{ color: 'rgba(20,15,80,0.70)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        {choice.feedback_body}
      </p>

      {isEnd && endScreen?.subtitle && (
        <p style={{ color: 'rgba(20,15,80,0.60)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px', fontStyle: 'italic' }}>
          {endScreen.subtitle}
        </p>
      )}

      <div style={{ textAlign: 'right' }}>
        <button
          onClick={onProceed}
          style={{
            background: accentColor, color: '#FFFFFF', border: 'none',
            borderRadius: 10, padding: '10px 24px',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          {isEnd ? 'See Results' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

function EndScreen({ endScreen, path, scenario, onRestart, onNext }) {
  const isSuccess = (endScreen?.score ?? 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: isSuccess ? 'rgba(39,174,96,0.10)' : 'rgba(231,76,60,0.08)',
        border: `1px solid ${isSuccess ? 'rgba(39,174,96,0.30)' : 'rgba(231,76,60,0.25)'}`,
        borderRadius: 20,
        backdropFilter: 'blur(20px)',
        padding: 32,
        textAlign: 'center',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: 52, marginBottom: 12 }}>
        {isSuccess ? '🎉' : '📚'}
      </div>
      <h2 style={{ color: isSuccess ? '#5dda8a' : '#f87171', margin: '0 0 8px', fontSize: 20 }}>
        {endScreen?.title || (isSuccess ? 'Well done!' : 'Review needed')}
      </h2>
      <p style={{ color: 'rgba(20,15,80,0.65)', fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>
        {endScreen?.subtitle || ''}
      </p>
      <p style={{ color: 'rgba(20,15,80,0.40)', fontSize: 12, margin: '0 0 28px' }}>
        {path.length + 1} decision{path.length !== 0 ? 's' : ''} made
        {endScreen?.score > 0 ? ` · +${endScreen.score} pts` : ''}
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onRestart}
          style={{
            background: 'rgba(131,107,255,0.22)', color: 'rgba(20,15,80,0.80)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
            padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        {onNext && (
          <button
            onClick={onNext}
            style={{
              background: '#1448FF', color: '#FFFFFF', border: 'none',
              borderRadius: 10, padding: '10px 20px',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            Next Scenario →
          </button>
        )}
      </div>
    </motion.div>
  )
}

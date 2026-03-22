import React from 'react'

const PlayerContext = React.createContext(null)

export function PlayerProvider({ children, moduleData, isDemoMode }) {
  const [score, setScore] = React.useState(0)
  const [scoreFloatId, setScoreFloatId] = React.useState(0)
  const [lastDelta, setLastDelta] = React.useState(null)

  const maxScore = React.useMemo(() => {
    if (!moduleData) return 0
    const scenarios = moduleData.scenarios || []
    const quizQuestions = moduleData.quizQuestions || []
    const scenarioMax = scenarios.reduce((sum, s) => sum + 1 + (s.followUpQuestion ? 1 : 0), 0)
    return scenarioMax + quizQuestions.length
  }, [moduleData])

  function addScore(delta) {
    if (delta <= 0) return
    setScore((s) => s + delta)
    setLastDelta(delta)
    setScoreFloatId((k) => k + 1)
    setTimeout(() => setLastDelta(null), 1000)
  }

  const value = React.useMemo(() => ({
    score,
    maxScore,
    lastDelta,
    scoreFloatId,
    addScore,
    moduleData,
    isDemoMode,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [score, maxScore, lastDelta, scoreFloatId, moduleData, isDemoMode])

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = React.useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}

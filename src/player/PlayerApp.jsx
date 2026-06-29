import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { PlayerProvider, usePlayer } from './PlayerContext.jsx'
import { PillTabSwitcher } from '../shared/components/PillTabSwitcher.jsx'
import { ScoreFloat } from '../shared/components/ScoreFloat.jsx'
import { ShelfBrowse } from './tabs/ShelfBrowse.jsx'
import { Scenarios } from './tabs/Scenarios.jsx'
import { Quiz } from './tabs/Quiz.jsx'
import { DragDropTab } from './tabs/DragDropTab.jsx'

const ALL_TABS = [
  { id: 'shelf',     label: '🏪 Shelf Browse' },
  { id: 'scenarios', label: '🧑‍⚕️ Scenarios' },
  { id: 'quiz',      label: '📝 Quiz' },
  { id: 'dragdrop',  label: '🎯 Drag & Drop' },
]

function PlayerInner({ isPreviewMode }) {
  const { score, lastDelta, scoreFloatId, moduleData, isDemoMode } = usePlayer()
  const [activeTab, setActiveTab] = React.useState(null)
  const [quizKey, setQuizKey] = React.useState(0)
  const [scenariosKey, setScenariosKey] = React.useState(0)

  const visibleTabs = React.useMemo(() => {
    if (!moduleData) return []
    const qq = moduleData.quizQuestions || []
    return ALL_TABS.filter((t) => {
      if (t.id === 'shelf')     return true
      if (t.id === 'scenarios') return (moduleData.scenarios?.length ?? 0) > 0
      if (t.id === 'quiz')      return qq.filter((q) => q.type !== 'dragdrop').length > 0
      if (t.id === 'dragdrop')  return qq.filter((q) => q.type === 'dragdrop').length > 0
      return true
    })
  }, [moduleData])

  React.useEffect(() => {
    if (visibleTabs.length > 0 && (!activeTab || !visibleTabs.find((t) => t.id === activeTab))) {
      setActiveTab(visibleTabs[0].id)
    }
  }, [visibleTabs, activeTab])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #140F50 0%, #1448FF 100%)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
          borderBottom: '1px solid rgba(131,107,255,0.15)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
            {moduleData?.module?.name || 'OTC Training'}
          </h1>
          {isDemoMode && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Demo Mode</span>
          )}
          {isPreviewMode && (
            <span style={{ fontSize: 11, color: '#FFD700', fontWeight: 600 }}>⚠️ Preview</span>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <ScoreFloat delta={lastDelta} id={scoreFloatId} />
          <motion.div
            style={{
              background: 'rgba(20,15,80,0.16)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20, padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#FFFFFF', fontWeight: 700, fontSize: 15,
            }}
            animate={{ scale: lastDelta ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Star size={14} fill="gold" color="gold" />
            {score} pts
          </motion.div>
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: -9999 }}>
        {lastDelta ? `+${lastDelta} point${lastDelta !== 1 ? 's' : ''}` : ''}
      </div>

      {/* Tab switcher — hidden when only one tab (e.g. browse-only export) */}
      {visibleTabs.length > 1 && (
        <div style={{ padding: '16px 20px 8px' }}>
          <PillTabSwitcher tabs={visibleTabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}

      {/* Tab content — all mounted simultaneously; only active shown to preserve state */}
      <div style={{ flex: 1, padding: '8px 20px 20px', overflowY: 'auto' }}>
        <div style={{ display: activeTab === 'shelf' ? 'block' : 'none' }}>
          <ShelfBrowse />
        </div>
        <div key={scenariosKey} style={{ display: activeTab === 'scenarios' ? 'block' : 'none' }}>
          <Scenarios onNavigateToQuiz={() => setActiveTab('quiz')} />
        </div>
        <div key={quizKey} style={{ display: activeTab === 'quiz' ? 'block' : 'none' }}>
          <Quiz
            onMoveToDragDrop={visibleTabs.find((t) => t.id === 'dragdrop') ? () => setActiveTab('dragdrop') : null}
          />
        </div>
        <div style={{ display: activeTab === 'dragdrop' ? 'block' : 'none' }}>
          <DragDropTab
            onRestartFromStart={() => {
              setScenariosKey((k) => k + 1)
              setQuizKey((k) => k + 1)
              setActiveTab(visibleTabs[0]?.id ?? 'scenarios')
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: 'rgba(20,15,80,0.96)',
          borderTop: '1px solid rgba(131,107,255,0.10)',
          padding: '10px 20px', textAlign: 'center',
          color: 'rgba(255,255,255,0.50)', fontSize: 12,
        }}
      >
        OTC Training — Pharmacy Practice
      </div>
    </div>
  )
}

export function PlayerApp({ moduleData, isDemoMode, isPreviewMode }) {
  return (
    <PlayerProvider moduleData={moduleData} isDemoMode={isDemoMode}>
      <PlayerInner isPreviewMode={isPreviewMode} />
    </PlayerProvider>
  )
}

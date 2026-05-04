import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { PlayerProvider, usePlayer } from './PlayerContext.jsx'
import { PillTabSwitcher } from '../shared/components/PillTabSwitcher.jsx'
import { ScoreFloat } from '../shared/components/ScoreFloat.jsx'
import { ShelfBrowse } from './tabs/ShelfBrowse.jsx'
import { Scenarios } from './tabs/Scenarios.jsx'
import { Quiz } from './tabs/Quiz.jsx'
import { BranchingStory } from './tabs/BranchingStory.jsx'

const TABS = [
  { id: 'shelf', label: '🏪 Shelf Browse' },
  { id: 'scenarios', label: '🧑‍⚕️ Scenarios' },
  { id: 'quiz', label: '📝 Quiz' },
  { id: 'story', label: '🌿 Story' },
]

function PlayerInner({ isPreviewMode }) {
  const { score, lastDelta, scoreFloatId, moduleData, isDemoMode } = usePlayer()
  const [activeTab, setActiveTab] = React.useState('shelf')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0c0a38' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #140F50 0%, #1448FF 100%)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid rgba(131,107,255,0.15)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
            {moduleData?.module?.name || 'OTC Training'}
          </h1>
          {isDemoMode && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
              Demo Mode
            </span>
          )}
          {isPreviewMode && (
            <span style={{ fontSize: 11, color: '#FFD700', fontWeight: 600 }}>
              ⚠️ Preview
            </span>
          )}
        </div>

        {/* Score pill */}
        <div style={{ position: 'relative' }}>
          <ScoreFloat delta={lastDelta} id={scoreFloatId} />
          <motion.div
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 15,
            }}
            animate={{ scale: lastDelta ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Star size={14} fill="gold" color="gold" />
            {score} pts
          </motion.div>
        </div>
      </div>

      {/* Live score announcement for screen readers */}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: -9999 }}>
        {lastDelta ? `+${lastDelta} point${lastDelta !== 1 ? 's' : ''}` : ''}
      </div>

      {/* Pill tab switcher */}
      <div style={{ padding: '16px 20px 8px' }}>
        <PillTabSwitcher tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, padding: '8px 20px 20px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'shelf' && <ShelfBrowse />}
            {activeTab === 'scenarios' && <Scenarios onNavigateToQuiz={() => setActiveTab('quiz')} />}
            {activeTab === 'quiz' && <Quiz />}
            {activeTab === 'story' && <BranchingStory />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div
        style={{
          background: 'rgba(12,10,56,0.92)',
          borderTop: '1px solid rgba(131,107,255,0.10)',
          padding: '10px 20px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.35)',
          fontSize: 12,
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

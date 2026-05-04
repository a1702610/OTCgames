import React from 'react'
import { useBuilder } from '../BuilderContext.jsx'
import { PlayerApp } from '../../player/PlayerApp.jsx'
import { shelves as allShelves, products as allProducts } from '../../data/products.js'

function buildModuleDataFromContext(state) {
  const { moduleName, description, selectedShelfIds, scenarios, quizQuestions, branchingScenarios } = state
  const selectedShelves = allShelves.filter((s) => selectedShelfIds.includes(s.id))
  const selectedProducts = allProducts.filter((p) => selectedShelfIds.includes(p.category))
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    module: { name: moduleName, description, selectedShelfIds },
    shelves: selectedShelves,
    products: selectedProducts,
    scenarios,
    quizQuestions,
    branchingScenarios: branchingScenarios || [],
  }
}

export function Step3_Preview() {
  const { state, dispatch } = useBuilder()
  const moduleData = buildModuleDataFromContext(state)

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Preview banner */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 300,
          background: 'rgba(131,107,255,0.18)',
          borderBottom: '1px solid rgba(131,107,255,0.30)',
          backdropFilter: 'blur(20px)',
          color: '#c4b5fd',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        <span>⚠️ PREVIEW MODE — this is not the student view</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
            style={{ background: 'rgba(131,107,255,0.22)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '4px 14px', cursor: 'pointer', fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontSize: 13 }}
          >
            ← Back to Authoring
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 4 })}
            style={{ background: '#1448FF', border: 'none', borderRadius: 6, padding: '4px 14px', cursor: 'pointer', fontWeight: 700, color: '#FFFFFF', fontSize: 13 }}
          >
            Export →
          </button>
        </div>
      </div>
      {/* Player rendered inside builder */}
      <PlayerApp moduleData={moduleData} isDemoMode={false} isPreviewMode={true} />
    </div>
  )
}

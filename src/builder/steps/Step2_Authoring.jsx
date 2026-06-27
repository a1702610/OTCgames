import React from 'react'
import { useBuilder } from '../BuilderContext.jsx'
import { shelves as allShelves, getProductsByShelf, products as allProducts } from '../../data/products.js'
import { ScenarioEditor } from './authoring/ScenarioEditor.jsx'
import { QuizEditor } from './authoring/QuizEditor.jsx'
import { DragDropEditor } from './authoring/DragDropEditor.jsx'
import { ProductModal } from '../../shared/components/ProductModal.jsx'
import { ShelfModal } from '../../shared/components/ShelfModal.jsx'

export function Step2_Authoring() {
  const { state, dispatch, generateId } = useBuilder()
  const { selectedShelfIds, scenarios, quizQuestions, orphanedProductIds } = state

  const activeShelvesData = allShelves.filter((s) => selectedShelfIds.includes(s.id))
  const [activeShelfId, setActiveShelfId] = React.useState(activeShelvesData[0]?.id || null)
  const [activePanel, setActivePanel] = React.useState('scenarios')
  const [sidebarModalProduct, setSidebarModalProduct] = React.useState(null)
  const [shelfViewOpen, setShelfViewOpen] = React.useState(null)

  const hasOrphans = orphanedProductIds.size > 0

  const activeShelfProducts = activeShelfId ? getProductsByShelf(activeShelfId) : []
  const allSelectedProducts = allProducts.filter((p) => selectedShelfIds.includes(p.category))
  const dragDropQuestions = quizQuestions.filter((q) => q.type === 'dragdrop')

function addScenario() {
    const scenario = {
      id: generateId(),
      shelfId: activeShelfId,
      patient: { name: '', avatarEmoji: '👤', description: '' },
      bestChoiceProductId: null,
      acceptableProductIds: [],
      explanation: '',
      followUpQuestion: null,
    }
    dispatch({ type: 'ADD_SCENARIO', scenario })
  }

  const shelfScenarios = scenarios.filter((s) => s.shelfId === activeShelfId)
  const shelfQuizCount = quizQuestions.filter((q) => q.shelfId === activeShelfId && q.type !== 'dragdrop').length

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(20,15,80,0.96)',
        borderBottom: '1px solid rgba(131,107,255,0.15)',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16,
        backdropFilter: 'blur(20px)',
      }}>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
          style={{ background: 'rgba(131,107,255,0.22)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 14 }}
        >
          ← Setup
        </button>
        <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: 18, fontWeight: 700 }}>Question Authoring</h2>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
          style={{ marginLeft: 'auto', background: '#1448FF', border: 'none', borderRadius: 8, padding: '8px 18px', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
        >
          Preview →
        </button>
      </div>

      {/* Orphan warning */}
      {hasOrphans && (
        <div style={{ background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.30)', padding: '10px 24px', fontSize: 13, color: '#f87171' }}>
          ⚠️ {orphanedProductIds.size} question{orphanedProductIds.size > 1 ? 's reference' : ' references'} products that no longer exist. Please update or delete them before exporting.
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Shelf + product sidebar */}
        <div
          style={{
            width: 240,
            background: 'rgba(20,15,80,0.60)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Shelf list */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0, padding: '14px 14px 6px' }}>
              Choose a Shelf
            </p>
            {activeShelvesData.map((shelf) => {
              const scCount = scenarios.filter((s) => s.shelfId === shelf.id).length
              const qCount = quizQuestions.filter((q) => q.shelfId === shelf.id).length
              const isActive = shelf.id === activeShelfId
              const shelfProds = getProductsByShelf(shelf.id)
              return (
                <div
                  key={shelf.id}
                  style={{
                    display: 'flex', alignItems: 'center',
                    borderLeft: `3px solid ${isActive ? shelf.color : 'transparent'}`,
                    background: isActive ? `${shelf.color}18` : 'transparent',
                  }}
                >
                  <button
                    onClick={() => setActiveShelfId(shelf.id)}
                    style={{
                      flex: 1, textAlign: 'left',
                      padding: '12px 8px 12px 13px',
                      border: 'none', background: 'transparent', cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 14, display: 'block', color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)' }}>{shelf.emoji} {shelf.label}{shelf.shelfNumber > 1 ? ` ${shelf.shelfNumber}` : ''}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>
                      {scCount} scenario{scCount !== 1 ? 's' : ''} · {qCount} question{qCount !== 1 ? 's' : ''}
                    </span>
                  </button>
                  {shelfProds.length > 0 && (
                    <button
                      onClick={() => setShelfViewOpen(shelf)}
                      style={{
                        padding: '4px 8px', marginRight: 8,
                        background: 'rgba(255,255,255,0.10)',
                        border: '1px solid rgba(255,255,255,0.20)',
                        borderRadius: 6, color: 'rgba(255,255,255,0.70)',
                        fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      View Shelf
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Panel switcher — always visible */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'rgba(20,15,80,0.07)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            {[
              { id: 'scenarios', label: `🧑‍⚕️ Scenarios (${shelfScenarios.length})` },
              { id: 'quiz', label: `📝 Quiz (${shelfQuizCount})` },
              { id: 'dragdrop', label: `🎯 Drag & Drop (${dragDropQuestions.length})` },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                style={{
                  padding: '7px 18px', borderRadius: 7, border: 'none',
                  background: activePanel === id ? '#1448FF' : 'transparent',
                  color: activePanel === id ? '#FFFFFF' : 'rgba(20,15,80,0.45)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {!activeShelfId ? (
            <p style={{ color: 'rgba(20,15,80,0.35)' }}>Select a shelf to start authoring.</p>
          ) : (
            <>

              {/* Scenarios panel */}
              {activePanel === 'scenarios' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                    {shelfScenarios.map((scenario) => (
                      <ScenarioEditor
                        key={scenario.id}
                        scenario={scenario}
                        onUpdate={(updates) => dispatch({ type: 'UPDATE_SCENARIO', id: scenario.id, updates })}
                        onDelete={() => {
                          if (window.confirm('Delete this scenario?')) {
                            dispatch({ type: 'DELETE_SCENARIO', id: scenario.id })
                          }
                        }}
                      />
                    ))}
                  </div>
                  {shelfScenarios.length === 0 && (
                    <p style={{ color: 'rgba(20,15,80,0.35)', fontSize: 13 }}>No scenarios yet for this shelf.</p>
                  )}
                  <button
                    onClick={addScenario}
                    style={{
                      padding: '8px 18px', borderRadius: 8,
                      background: 'rgba(20,72,255,0.10)', border: '1.5px dashed rgba(20,72,255,0.35)',
                      color: '#7da5ff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    + Add Scenario
                  </button>
                </div>
              )}

              {/* Quiz panel */}
              {activePanel === 'quiz' && (
                <QuizEditor shelfId={activeShelfId} />
              )}

              {/* Drag & Drop panel */}
              {activePanel === 'dragdrop' && (
                <div>
                  <p style={{ fontSize: 13, color: 'rgba(20,15,80,0.45)', margin: '0 0 12px' }}>
                    Drag & Drop questions use products from <strong style={{ color: 'rgba(20,15,80,0.70)' }}>all selected shelves</strong>.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                    {dragDropQuestions.map((q) => (
                      <DragDropEditor
                        key={q.id}
                        question={q}
                        allProducts={allSelectedProducts}
                        onUpdate={(updates) => dispatch({ type: 'UPDATE_QUIZ_QUESTION', id: q.id, updates })}
                        onDelete={() => {
                          if (window.confirm('Delete this Drag & Drop question?')) {
                            dispatch({ type: 'DELETE_QUIZ_QUESTION', id: q.id })
                          }
                        }}
                      />
                    ))}
                  </div>
                  {dragDropQuestions.length === 0 && (
                    <p style={{ color: 'rgba(20,15,80,0.35)', fontSize: 13, margin: '0 0 12px' }}>No Drag & Drop questions yet.</p>
                  )}
                  <button
                    onClick={() => {
                      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
                      dispatch({
                        type: 'ADD_QUIZ_QUESTION',
                        question: { id, type: 'dragdrop', shelfId: null, instruction: '', categories: [], productAssignments: [], explanation: '' },
                      })
                    }}
                    style={{
                      padding: '8px 18px', borderRadius: 8,
                      background: 'rgba(230,126,34,0.10)', border: '1.5px dashed rgba(230,126,34,0.35)',
                      color: '#E67E22', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    + Add Drag & Drop Question
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sidebar product zoom modal */}
      <ProductModal product={sidebarModalProduct} onClose={() => setSidebarModalProduct(null)} />

      {/* Shelf view modal */}
      {shelfViewOpen && (
        <ShelfModal
          shelf={shelfViewOpen}
          products={getProductsByShelf(shelfViewOpen.id)}
          mode="browse"
          onClose={() => setShelfViewOpen(null)}
        />
      )}
    </div>
  )
}

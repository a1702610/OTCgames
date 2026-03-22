import React from 'react'
import { useBuilder } from '../BuilderContext.jsx'
import { shelves as allShelves, getProductsByShelf } from '../../data/products.js'
import { ScenarioEditor } from './authoring/ScenarioEditor.jsx'
import { QuizEditor } from './authoring/QuizEditor.jsx'
import { ProductModal } from '../../shared/components/ProductModal.jsx'
import { ImageWithFallback } from '../../shared/utils/imageUtils.jsx'

export function Step2_Authoring() {
  const { state, dispatch, generateId } = useBuilder()
  const { selectedShelfIds, scenarios, quizQuestions, orphanedProductIds } = state

  const activeShelvesData = allShelves.filter((s) => selectedShelfIds.includes(s.id))
  const [activeShelfId, setActiveShelfId] = React.useState(activeShelvesData[0]?.id || null)
  const [activePanel, setActivePanel] = React.useState('scenarios') // 'scenarios' | 'quiz'
  const [sidebarModalProduct, setSidebarModalProduct] = React.useState(null)

  const hasOrphans = orphanedProductIds.size > 0

  const activeShelfProducts = activeShelfId ? getProductsByShelf(activeShelfId) : []

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
  const shelfQuizCount = quizQuestions.filter((q) => q.shelfId === activeShelfId).length

  return (
    <div style={{ minHeight: '100vh', background: '#F8EFE0', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#140F50', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#FFFFFF', cursor: 'pointer', fontSize: 14 }}
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
        <div style={{ background: '#FFF3CD', border: '1px solid #F39C12', padding: '10px 24px', fontSize: 13, color: '#856404' }}>
          ⚠️ {orphanedProductIds.size} question{orphanedProductIds.size > 1 ? 's reference' : ' references'} products that no longer exist in the current library. Please update or delete them before exporting.
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Shelf + product sidebar */}
        <div
          style={{
            width: 220,
            background: '#FFFFFF',
            borderRight: '1.5px solid rgba(20,15,80,0.1)',
            overflowY: 'auto',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Shelf list */}
          <div>
            {activeShelvesData.map((shelf) => {
              const scCount = scenarios.filter((s) => s.shelfId === shelf.id).length
              const qCount = quizQuestions.filter((q) => q.shelfId === shelf.id).length
              const isActive = shelf.id === activeShelfId
              return (
                <button
                  key={shelf.id}
                  onClick={() => setActiveShelfId(shelf.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    border: 'none',
                    borderLeft: `3px solid ${isActive ? shelf.color : 'transparent'}`,
                    background: isActive ? `${shelf.color}12` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 14, display: 'block' }}>{shelf.emoji} {shelf.label}{shelf.shelfNumber > 1 ? ` ${shelf.shelfNumber}` : ''}</span>
                  <span style={{ fontSize: 11, color: 'rgba(20,15,80,0.5)' }}>
                    {scCount} scenario{scCount !== 1 ? 's' : ''} · {qCount} question{qCount !== 1 ? 's' : ''}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Product image browser for the active shelf */}
          {activeShelfProducts.length > 0 && (
            <div style={{ borderTop: '1.5px solid rgba(20,15,80,0.08)', paddingTop: 8 }}>
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(20,15,80,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                margin: '0 0 6px',
                padding: '0 12px',
              }}>
                Products ({activeShelfProducts.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '0 8px 12px' }}>
                {activeShelfProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSidebarModalProduct(product)}
                    title={product.name}
                    aria-label={`View ${product.name}`}
                    style={{
                      width: 58,
                      height: 58,
                      border: 'none',
                      borderRadius: 8,
                      padding: 4,
                      background: product.bgColor || '#1448FF',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    <ImageWithFallback
                      productId={product.id}
                      side="front"
                      alt={product.name}
                      bgColor={product.bgColor}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {!activeShelfId ? (
            <p style={{ color: 'rgba(20,15,80,0.4)' }}>Select a shelf to start authoring.</p>
          ) : (
            <>
              {/* Panel switcher */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#FFFFFF', borderRadius: 10, padding: 4, width: 'fit-content', border: '1.5px solid rgba(20,15,80,0.1)' }}>
                {['scenarios', 'quiz'].map((panel) => (
                  <button
                    key={panel}
                    onClick={() => setActivePanel(panel)}
                    style={{
                      padding: '7px 18px',
                      borderRadius: 7,
                      border: 'none',
                      background: activePanel === panel ? '#1448FF' : 'transparent',
                      color: activePanel === panel ? '#FFFFFF' : 'rgba(20,15,80,0.6)',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {panel === 'scenarios' ? `🧑‍⚕️ Scenarios (${shelfScenarios.length})` : `📝 Quiz (${shelfQuizCount})`}
                  </button>
                ))}
              </div>

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
                    <p style={{ color: 'rgba(20,15,80,0.4)', fontSize: 13 }}>No scenarios yet for this shelf.</p>
                  )}
                  <button
                    onClick={addScenario}
                    style={{
                      padding: '8px 18px', borderRadius: 8,
                      background: 'rgba(20,72,255,0.08)', border: '1.5px dashed rgba(20,72,255,0.3)',
                      color: '#1448FF', fontWeight: 600, fontSize: 13, cursor: 'pointer',
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
            </>
          )}
        </div>
      </div>

      {/* Sidebar product zoom modal */}
      <ProductModal product={sidebarModalProduct} onClose={() => setSidebarModalProduct(null)} />
    </div>
  )
}

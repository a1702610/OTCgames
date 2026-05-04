import React from 'react'
import { useBuilder } from '../BuilderContext.jsx'
import { shelves as allShelves, getProductsByShelf, products as allProducts } from '../../data/products.js'
import { ScenarioEditor } from './authoring/ScenarioEditor.jsx'
import { QuizEditor } from './authoring/QuizEditor.jsx'
import { DragDropEditor } from './authoring/DragDropEditor.jsx'
import { BranchingScenarioEditor } from './authoring/BranchingScenarioEditor.jsx'
import { ProductModal } from '../../shared/components/ProductModal.jsx'
import { ImageWithFallback } from '../../shared/utils/imageUtils.jsx'

export function Step2_Authoring() {
  const { state, dispatch, generateId } = useBuilder()
  const { selectedShelfIds, scenarios, quizQuestions, branchingScenarios, orphanedProductIds } = state

  const activeShelvesData = allShelves.filter((s) => selectedShelfIds.includes(s.id))
  const [activeShelfId, setActiveShelfId] = React.useState(activeShelvesData[0]?.id || null)
  const [activePanel, setActivePanel] = React.useState('scenarios')
  const [sidebarModalProduct, setSidebarModalProduct] = React.useState(null)

  const hasOrphans = orphanedProductIds.size > 0

  const activeShelfProducts = activeShelfId ? getProductsByShelf(activeShelfId) : []
  const allSelectedProducts = allProducts.filter((p) => selectedShelfIds.includes(p.category))
  const dragDropQuestions = state.quizQuestions.filter((q) => q.type === 'dragdrop')

  function addBranchingScenario() {
    const scenario = {
      id: generateId(),
      title: '',
      start_screen: { title: 'OTC Patient Consultation', subtitle: '' },
      nodes: [],
      end_screens: [
        { id: -1, title: 'Excellent Clinical Decision!', subtitle: 'You correctly assessed the patient and made a safe, appropriate recommendation.', score: 100 },
        { id: -2, title: 'Review Your Approach', subtitle: 'There were gaps in your assessment or recommendation. Review the correct approach below.', score: 0 },
      ],
    }
    dispatch({ type: 'ADD_BRANCHING_SCENARIO', scenario })
  }

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
    <div style={{ height: '100vh', overflow: 'hidden', background: '#0c0a38', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(12,10,56,0.92)',
        borderBottom: '1px solid rgba(131,107,255,0.15)',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16,
        backdropFilter: 'blur(20px)',
      }}>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.80)', cursor: 'pointer', fontSize: 14 }}
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
            background: 'rgba(12,10,56,0.60)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Shelf list */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0, padding: '14px 14px 6px' }}>
              Choose a Shelf
            </p>
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
                    background: isActive ? `${shelf.color}18` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 14, display: 'block', color: isActive ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.65)' }}>{shelf.emoji} {shelf.label}{shelf.shelfNumber > 1 ? ` ${shelf.shelfNumber}` : ''}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    {scCount} scenario{scCount !== 1 ? 's' : ''} · {qCount} question{qCount !== 1 ? 's' : ''}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Product image browser for the active shelf */}
          {activeShelfProducts.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 4, flex: 1, overflowY: 'auto' }}>
              <p style={{
                fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase', letterSpacing: '0.09em',
                margin: 0, padding: '10px 14px 6px',
              }}>
                Products ({activeShelfProducts.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 6px 12px' }}>
                {activeShelfProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSidebarModalProduct(product)}
                    title={`View ${product.name}`}
                    aria-label={`View ${product.name}`}
                    style={{
                      width: '100%', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                      padding: 0, background: product.bgColor || '#1448FF',
                      cursor: 'pointer', overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}
                  >
                    <ImageWithFallback
                      productId={product.id}
                      side="front"
                      alt={product.name}
                      bgColor={product.bgColor}
                      style={{ width: '100%', height: 150 }}
                    />
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: product.color || '#FFFFFF',
                      padding: '4px 8px 6px', textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {product.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Panel switcher — always visible */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            {[
              { id: 'scenarios', label: `🧑‍⚕️ Scenarios (${shelfScenarios.length})` },
              { id: 'quiz', label: `📝 Quiz (${shelfQuizCount})` },
              { id: 'dragdrop', label: `🎯 Drag & Drop (${dragDropQuestions.length})` },
              { id: 'branching', label: `🌿 Branching Stories (${branchingScenarios.length})` },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                style={{
                  padding: '7px 18px', borderRadius: 7, border: 'none',
                  background: activePanel === id ? '#1448FF' : 'transparent',
                  color: activePanel === id ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Branching Stories panel — module-level, no shelf needed */}
          {activePanel === 'branching' && (
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 14px' }}>
                Branching scenarios are module-wide choose-your-own-path clinical simulations. Use AI to generate one from a PDF, or build manually.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                {branchingScenarios.map((bs) => (
                  <BranchingScenarioEditor
                    key={bs.id}
                    scenario={bs}
                    onUpdate={(updates) => dispatch({ type: 'UPDATE_BRANCHING_SCENARIO', id: bs.id, updates })}
                    onDelete={() => {
                      if (window.confirm('Delete this branching scenario?')) {
                        dispatch({ type: 'DELETE_BRANCHING_SCENARIO', id: bs.id })
                      }
                    }}
                  />
                ))}
              </div>
              {branchingScenarios.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 12px' }}>No branching scenarios yet.</p>
              )}
              <button
                onClick={addBranchingScenario}
                style={{
                  padding: '8px 18px', borderRadius: 8,
                  background: 'rgba(131,107,255,0.10)', border: '1.5px dashed rgba(131,107,255,0.35)',
                  color: '#a89eff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                + Add Branching Scenario
              </button>
            </div>
          )}

          {activePanel !== 'branching' && !activeShelfId ? (
            <p style={{ color: 'rgba(255,255,255,0.35)' }}>Select a shelf to start authoring.</p>
          ) : activePanel !== 'branching' && (
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
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No scenarios yet for this shelf.</p>
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
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 12px' }}>
                    Drag & Drop questions use products from <strong style={{ color: 'rgba(255,255,255,0.70)' }}>all selected shelves</strong>.
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
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 12px' }}>No Drag & Drop questions yet.</p>
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
    </div>
  )
}

import React from 'react'
import { Trash2 } from 'lucide-react'
import { getProductsByShelf } from '../../../data/products.js'
import { ImageWithFallback } from '../../../shared/utils/imageUtils.jsx'
import { ProductModal } from '../../../shared/components/ProductModal.jsx'

const AVATAR_OPTIONS = ['👨', '👩', '👴', '👵', '👦', '👧', '🧑', '👨‍⚕️', '👩‍⚕️']

export function ScenarioEditor({ scenario, onUpdate, onDelete }) {
  const shelfProducts = getProductsByShelf(scenario.shelfId)
  const [expanded, setExpanded] = React.useState(true)
  const [modalProduct, setModalProduct] = React.useState(null)
  const showFollowUp = !!scenario.followUpQuestion

  function updatePatient(field, value) {
    onUpdate({ patient: { ...scenario.patient, [field]: value } })
  }

  function toggleProductTier(productId, tier) {
    if (tier === 'best') {
      onUpdate({ bestChoiceProductId: productId === scenario.bestChoiceProductId ? null : productId })
    } else if (tier === 'acceptable') {
      const current = scenario.acceptableProductIds || []
      const isAlready = current.includes(productId)
      onUpdate({ acceptableProductIds: isAlready ? current.filter((id) => id !== productId) : [...current, productId] })
    }
  }

  function toggleFollowUp() {
    if (showFollowUp) {
      onUpdate({ followUpQuestion: null })
    } else {
      onUpdate({
        followUpQuestion: { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
      })
    }
  }

  function updateFollowUp(field, value) {
    onUpdate({ followUpQuestion: { ...scenario.followUpQuestion, [field]: value } })
  }

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1.5px solid rgba(20,15,80,0.1)', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(20,72,255,0.04)', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: '#140F50' }}>
          {scenario.patient?.avatarEmoji || '👤'} {scenario.patient?.name || 'Unnamed Scenario'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C' }}
            aria-label="Delete scenario"
          >
            <Trash2 size={15} />
          </button>
          <span style={{ fontSize: 18, color: '#140F50' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: 16 }}>
          {/* Avatar picker */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(20,15,80,0.6)', margin: '0 0 6px' }}>Patient Avatar</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => updatePatient('avatarEmoji', emoji)}
                  style={{
                    width: 36, height: 36, fontSize: 20,
                    border: `2px solid ${scenario.patient?.avatarEmoji === emoji ? '#1448FF' : 'transparent'}`,
                    borderRadius: 8, background: scenario.patient?.avatarEmoji === emoji ? 'rgba(20,72,255,0.08)' : 'rgba(20,15,80,0.04)',
                    cursor: 'pointer',
                  }}
                  aria-label={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Patient name */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(20,15,80,0.6)', display: 'block', marginBottom: 4 }}>Patient Name</label>
            <input
              type="text"
              value={scenario.patient?.name || ''}
              onChange={(e) => updatePatient('name', e.target.value)}
              placeholder="e.g. Mrs Chen"
              style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>

          {/* Patient description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(20,15,80,0.6)', display: 'block', marginBottom: 4 }}>Presenting Complaint</label>
            <textarea
              value={scenario.patient?.description || ''}
              onChange={(e) => updatePatient('description', e.target.value)}
              placeholder="Describe the patient's symptoms and relevant history…"
              rows={3}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Product selection + tier */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(20,15,80,0.6)', margin: '0 0 8px' }}>
              Product Tiers — click image to zoom
            </p>
            {shelfProducts.map((product) => {
              const isBest = scenario.bestChoiceProductId === product.id
              const isAcceptable = scenario.acceptableProductIds?.includes(product.id)
              return (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 5,
                    padding: '5px 6px',
                    borderRadius: 8,
                    background: isBest
                      ? 'rgba(39,174,96,0.06)'
                      : isAcceptable
                      ? 'rgba(230,126,34,0.06)'
                      : 'rgba(20,15,80,0.02)',
                    border: `1px solid ${isBest ? 'rgba(39,174,96,0.2)' : isAcceptable ? 'rgba(230,126,34,0.2)' : 'transparent'}`,
                  }}
                >
                  {/* Thumbnail — click to zoom */}
                  <button
                    onClick={() => setModalProduct(product)}
                    title={`View ${product.name}`}
                    aria-label={`View ${product.name}`}
                    style={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      border: 'none',
                      borderRadius: 7,
                      padding: 3,
                      background: product.bgColor || '#1448FF',
                      cursor: 'zoom-in',
                      overflow: 'hidden',
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

                  {/* Name + tier buttons grouped so buttons stay close to the name */}
                  <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    <span style={{ fontSize: 12, color: '#140F50', wordBreak: 'break-word' }}>
                      {product.name}
                    </span>
                    <button
                      onClick={() => toggleProductTier(product.id, 'best')}
                      style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                        border: `1.5px solid ${isBest ? '#27AE60' : 'rgba(20,15,80,0.15)'}`,
                        background: isBest ? 'rgba(39,174,96,0.12)' : '#FFFFFF',
                        color: isBest ? '#27AE60' : 'rgba(20,15,80,0.5)',
                        cursor: 'pointer', fontWeight: isBest ? 700 : 400,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}
                    >
                      ★ Best
                    </button>
                    <button
                      onClick={() => toggleProductTier(product.id, 'acceptable')}
                      style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                        border: `1.5px solid ${isAcceptable ? '#E67E22' : 'rgba(20,15,80,0.15)'}`,
                        background: isAcceptable ? 'rgba(230,126,34,0.12)' : '#FFFFFF',
                        color: isAcceptable ? '#E67E22' : 'rgba(20,15,80,0.5)',
                        cursor: 'pointer', fontWeight: isAcceptable ? 700 : 400,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}
                    >
                      ✓ OK
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(20,15,80,0.6)', display: 'block', marginBottom: 4 }}>Explanation</label>
            <textarea
              value={scenario.explanation || ''}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              placeholder="Explain the correct product choice and reasoning…"
              rows={3}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Follow-up MCQ toggle */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#140F50', fontWeight: 600 }}>
              <input type="checkbox" checked={showFollowUp} onChange={toggleFollowUp} />
              Add follow-up MCQ question
            </label>

            {showFollowUp && scenario.followUpQuestion && (
              <div style={{ marginTop: 12, padding: 12, background: 'rgba(131,107,255,0.06)', borderRadius: 10, border: '1.5px solid rgba(131,107,255,0.2)' }}>
                <textarea
                  value={scenario.followUpQuestion.question || ''}
                  onChange={(e) => updateFollowUp('question', e.target.value)}
                  placeholder="Follow-up question…"
                  rows={2}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }}
                />
                {(scenario.followUpQuestion.options || ['','','','']).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                    <input
                      type="radio"
                      name={`fu-correct-${scenario.id}`}
                      checked={scenario.followUpQuestion.correctIndex === i}
                      onChange={() => updateFollowUp('correctIndex', i)}
                      aria-label={`Mark option ${i + 1} as correct`}
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const opts = [...(scenario.followUpQuestion.options || ['','','',''])]
                        opts[i] = e.target.value
                        updateFollowUp('options', opts)
                      }}
                      placeholder={`Option ${i + 1}`}
                      style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 12 }}
                    />
                  </div>
                ))}
                <textarea
                  value={scenario.followUpQuestion.explanation || ''}
                  onChange={(e) => updateFollowUp('explanation', e.target.value)}
                  placeholder="Follow-up explanation…"
                  rows={2}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product zoom modal */}
      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </div>
  )
}

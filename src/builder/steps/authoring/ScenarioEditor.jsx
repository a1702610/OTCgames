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
      const current = scenario.bestChoiceProductIds || (scenario.bestChoiceProductId ? [scenario.bestChoiceProductId] : [])
      const isAlready = current.includes(productId)
      onUpdate({ bestChoiceProductIds: isAlready ? current.filter((id) => id !== productId) : [...current, productId], bestChoiceProductId: null })
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
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(20,15,80,0.6)', margin: '0 0 8px' }}>Patient Avatar</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => updatePatient('avatarEmoji', emoji)}
                  style={{
                    width: 48, height: 48, fontSize: 26,
                    border: `2px solid ${scenario.patient?.avatarEmoji === emoji ? '#1448FF' : 'transparent'}`,
                    borderRadius: 10, background: scenario.patient?.avatarEmoji === emoji ? 'rgba(20,72,255,0.08)' : 'rgba(20,15,80,0.04)',
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
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(20,15,80,0.6)', display: 'block', marginBottom: 6 }}>Patient Name</label>
            <input
              type="text"
              value={scenario.patient?.name || ''}
              onChange={(e) => updatePatient('name', e.target.value)}
              placeholder="e.g. Mrs Chen"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 15, boxSizing: 'border-box' }}
            />
          </div>

          {/* Patient description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(20,15,80,0.6)', display: 'block', marginBottom: 6 }}>Presenting Complaint</label>
            <textarea
              value={scenario.patient?.description || ''}
              onChange={(e) => updatePatient('description', e.target.value)}
              placeholder="Describe the patient's symptoms and relevant history…"
              rows={4}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Product selection + tier */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(20,15,80,0.6)', margin: '0 0 10px' }}>
              Product Tiers — click image to zoom
            </p>
            {shelfProducts.map((product) => {
              const bestIds = scenario.bestChoiceProductIds || (scenario.bestChoiceProductId ? [scenario.bestChoiceProductId] : [])
              const isBest = bestIds.includes(product.id)
              const isAcceptable = scenario.acceptableProductIds?.includes(product.id)
              return (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 8,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: isBest
                      ? 'rgba(39,174,96,0.06)'
                      : isAcceptable
                      ? 'rgba(230,126,34,0.06)'
                      : 'rgba(20,15,80,0.02)',
                    border: `1.5px solid ${isBest ? 'rgba(39,174,96,0.25)' : isAcceptable ? 'rgba(230,126,34,0.25)' : 'rgba(20,15,80,0.06)'}`,
                  }}
                >
                  {/* Thumbnail — click to zoom */}
                  <button
                    onClick={() => setModalProduct(product)}
                    title={`View ${product.name}`}
                    aria-label={`View ${product.name}`}
                    style={{
                      flexShrink: 0, width: 64, height: 64,
                      border: 'none', borderRadius: 9, padding: 4,
                      background: product.bgColor || '#1448FF',
                      cursor: 'zoom-in', overflow: 'hidden',
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

                  {/* Name + tier buttons */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#140F50', wordBreak: 'break-word' }}>
                      {product.name}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => toggleProductTier(product.id, 'best')}
                        style={{
                          fontSize: 12, padding: '4px 12px', borderRadius: 10,
                          border: `1.5px solid ${isBest ? '#27AE60' : 'rgba(20,15,80,0.15)'}`,
                          background: isBest ? 'rgba(39,174,96,0.12)' : '#FFFFFF',
                          color: isBest ? '#27AE60' : 'rgba(20,15,80,0.5)',
                          cursor: 'pointer', fontWeight: isBest ? 700 : 400,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ★ Best
                      </button>
                      <button
                        onClick={() => toggleProductTier(product.id, 'acceptable')}
                        style={{
                          fontSize: 12, padding: '4px 12px', borderRadius: 10,
                          border: `1.5px solid ${isAcceptable ? '#E67E22' : 'rgba(20,15,80,0.15)'}`,
                          background: isAcceptable ? 'rgba(230,126,34,0.12)' : '#FFFFFF',
                          color: isAcceptable ? '#E67E22' : 'rgba(20,15,80,0.5)',
                          cursor: 'pointer', fontWeight: isAcceptable ? 700 : 400,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ✓ OK
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(20,15,80,0.6)', display: 'block', marginBottom: 6 }}>Explanation</label>
            <textarea
              value={scenario.explanation || ''}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              placeholder="Explain the correct product choice and reasoning…"
              rows={4}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box' }}
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

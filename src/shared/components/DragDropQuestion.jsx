import React from 'react'
import { motion } from 'framer-motion'
import { ImageWithFallback } from '../utils/imageUtils.jsx'
import { ScoreFloat } from './ScoreFloat.jsx'
import { ProductModal } from './ProductModal.jsx'

export function DragDropQuestion({ question, products, onSubmit, submitted }) {
  const draggableProducts = question.productAssignments
    .map((a) => products.find((p) => p.id === a.productId))
    .filter(Boolean)

  const [placements, setPlacements] = React.useState(() => {
    const init = {}
    question.productAssignments.forEach((a) => { init[a.productId] = 'unplaced' })
    return init
  })

  const [draggingId, setDraggingId] = React.useState(null)
  const [dragOverZone, setDragOverZone] = React.useState(null)
  const [floatKey, setFloatKey] = React.useState(0)
  const [floatDelta, setFloatDelta] = React.useState(null)
  const [zoomProduct, setZoomProduct] = React.useState(null)

  function handleDrop(zoneId) {
    if (!draggingId || submitted) return
    setPlacements((prev) => ({ ...prev, [draggingId]: zoneId }))
    setDraggingId(null)
    setDragOverZone(null)
  }

  function handleSubmit() {
    if (submitted) return
    const result = {}
    let allCorrect = true
    question.productAssignments.forEach((a) => {
      const placed = placements[a.productId]
      const correct = a.categoryId === null ? placed === 'unplaced' : placed === a.categoryId
      if (!correct) allCorrect = false
      result[a.productId] = { correct, placed }
    })
    const delta = allCorrect ? 1 : 0
    setFloatDelta(delta > 0 ? delta : null)
    setFloatKey((k) => k + 1)
    onSubmit?.({ placements: result, isAllCorrect: allCorrect, delta })
  }

  const nonDistractors = question.productAssignments.filter((a) => a.categoryId !== null)
  const allNonDistractorsPlaced = nonDistractors.every((a) => placements[a.productId] !== 'unplaced')
  const unplacedProducts = draggableProducts.filter((p) => placements[p.id] === 'unplaced')

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(180deg, #1a1560 0%, #0e0b3d 100%)', minHeight: 480, padding: 24 }}>
      {floatDelta !== null && <ScoreFloat delta={floatDelta} id={`dd-score-${floatKey}`} />}

      <p style={{ fontWeight: 700, fontSize: 16, color: '#FFFFFF', marginBottom: 18, marginTop: 4 }}>
        {question.instruction || 'Drag each product to the correct shelf'}
      </p>

      {/* Unplaced tray */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOverZone('unplaced') }}
        onDrop={() => handleDrop('unplaced')}
        onDragLeave={() => setDragOverZone(null)}
        style={{
          background: dragOverZone === 'unplaced' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
          border: `2px dashed ${dragOverZone === 'unplaced' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 24,
          minHeight: 130,
          transition: 'background 0.15s, border 0.15s',
        }}
      >
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Products — drag to a shelf below
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {unplacedProducts.map((p) => (
            <DragCard
              key={p.id}
              product={p}
              dragging={draggingId === p.id}
              submitted={submitted}
              result={submitted?.placements?.[p.id]}
              onDragStart={() => !submitted && setDraggingId(p.id)}
              onDragEnd={() => setDraggingId(null)}
              onZoom={() => setZoomProduct(p)}
            />
          ))}
          {unplacedProducts.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>All products placed</p>
          )}
        </div>
      </div>

      {/* Shelf drop zones */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {question.categories.map((cat) => {
          const placedHere = draggableProducts.filter((p) => placements[p.id] === cat.id)
          const isOver = dragOverZone === cat.id
          return (
            <div
              key={cat.id}
              style={{ flex: '1 1 200px', minWidth: 180 }}
              onDragOver={(e) => { e.preventDefault(); setDragOverZone(cat.id) }}
              onDrop={() => handleDrop(cat.id)}
              onDragLeave={() => setDragOverZone(null)}
            >
              <div style={{
                background: `linear-gradient(135deg, ${cat.color}dd, ${cat.color}99)`,
                borderRadius: '12px 12px 0 0',
                padding: '10px 16px',
                fontWeight: 700, fontSize: 15, color: '#FFFFFF',
              }}>
                {cat.label || '(unnamed)'}
              </div>
              <div style={{
                background: isOver ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `2px solid ${isOver ? cat.color : cat.color + '55'}`,
                borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                padding: '14px 12px 4px',
                minHeight: 140,
                transition: 'background 0.15s',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 10 }}>
                  {placedHere.map((p) => (
                    <DragCard
                      key={p.id}
                      product={p}
                      dragging={draggingId === p.id}
                      submitted={submitted}
                      result={submitted?.placements?.[p.id]}
                      onDragStart={() => !submitted && setDraggingId(p.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onZoom={() => setZoomProduct(p)}
                    />
                  ))}
                </div>
                {/* Wood plank */}
                <div style={{
                  height: 13, margin: '4px 0 2px',
                  background: 'linear-gradient(180deg, #e8d8a8 0%, #c9ab5a 45%, #8b6914 100%)',
                  borderRadius: 3,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit + feedback */}
      <div style={{ marginTop: 22 }}>
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={!allNonDistractorsPlaced}
            style={{
              padding: '12px 36px',
              background: allNonDistractorsPlaced ? '#1448FF' : 'rgba(255,255,255,0.15)',
              color: allNonDistractorsPlaced ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
              cursor: allNonDistractorsPlaced ? 'pointer' : 'not-allowed',
            }}
          >
            Submit
          </button>
        )}

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px 18px', background: 'rgba(255,255,255,0.08)',
              borderRadius: 12, fontSize: 14, color: '#FFFFFF', lineHeight: 1.6,
              borderLeft: `4px solid ${submitted.isAllCorrect ? '#27AE60' : '#E74C3C'}`,
            }}
          >
            <strong>{submitted.isAllCorrect ? '✓ All correct!' : '✗ Some incorrect.'}</strong>
            {question.explanation ? ` ${question.explanation}` : ''}
          </motion.div>
        )}
      </div>

      {/* Zoom modal */}
      <ProductModal product={zoomProduct} onClose={() => setZoomProduct(null)} />
    </div>
  )
}

function DragCard({ product, dragging, submitted, result, onDragStart, onDragEnd, onZoom }) {
  let borderColor = 'rgba(255,255,255,0.2)'
  if (submitted) borderColor = result?.correct ? '#27AE60' : '#E74C3C'

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        draggable={!submitted}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{
          width: 100,
          background: product.bgColor || '#1448FF',
          border: `2.5px solid ${borderColor}`,
          borderRadius: 14,
          padding: 10,
          cursor: submitted ? 'default' : 'grab',
          opacity: dragging ? 0.4 : 1,
          userSelect: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
          transition: 'opacity 0.15s',
        }}
      >
        <ImageWithFallback
          productId={product.id}
          side="front"
          alt={product.name}
          bgColor={product.bgColor}
          style={{ width: 76, height: 76, borderRadius: 10 }}
        />
        <span style={{
          fontSize: 11, color: product.color || '#FFFFFF', fontWeight: 700,
          textAlign: 'center', lineHeight: 1.2,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          width: '100%',
        }}>
          {product.name}
        </span>
      </div>

      {/* Zoom button */}
      <button
        onClick={(e) => { e.stopPropagation(); onZoom() }}
        aria-label={`View ${product.name}`}
        style={{
          position: 'absolute', top: 4, right: 4,
          width: 22, height: 22, borderRadius: '50%',
          border: 'none', background: 'rgba(0,0,0,0.5)',
          color: '#FFFFFF', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, backdropFilter: 'blur(2px)',
        }}
      >
        🔍
      </button>
    </div>
  )
}

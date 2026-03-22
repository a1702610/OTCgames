import React from 'react'
import { motion } from 'framer-motion'
import { ImageWithFallback } from '../utils/imageUtils.jsx'
import { ScoreFloat } from './ScoreFloat.jsx'

export function DragDropQuestion({ question, products, onSubmit, submitted }) {
  // question.categories: [{ id, label, color }]
  // question.productAssignments: [{ productId, categoryId: string|null }]
  // submitted: null | { placements, isAllCorrect, delta }

  const draggableProducts = question.productAssignments
    .map((a) => products.find((p) => p.id === a.productId))
    .filter(Boolean)

  // placements: { [productId]: categoryId | 'unplaced' }
  const [placements, setPlacements] = React.useState(() => {
    const init = {}
    question.productAssignments.forEach((a) => {
      init[a.productId] = 'unplaced'
    })
    return init
  })

  const [draggingId, setDraggingId] = React.useState(null)
  const [dragOverZone, setDragOverZone] = React.useState(null)
  const [floatKey, setFloatKey] = React.useState(0)
  const [floatDelta, setFloatDelta] = React.useState(null)

  // Keyboard fallback: dropdown per product
  function handleDropdownChange(productId, value) {
    if (submitted) return
    setPlacements((prev) => ({ ...prev, [productId]: value }))
  }

  function handleDrop(categoryId) {
    if (!draggingId || submitted) return
    setPlacements((prev) => ({ ...prev, [draggingId]: categoryId }))
    setDraggingId(null)
    setDragOverZone(null)
  }

  function handleSubmit() {
    if (submitted) return
    // Evaluate: distractor (categoryId === null) products are correct if left unplaced
    const correctMap = {}
    question.productAssignments.forEach((a) => {
      correctMap[a.productId] = a.categoryId // null = distractor
    })
    let allCorrect = true
    const result = {}
    question.productAssignments.forEach((a) => {
      const placed = placements[a.productId]
      const correct = a.categoryId === null
        ? placed === 'unplaced'
        : placed === a.categoryId
      if (!correct) allCorrect = false
      result[a.productId] = { correct, placed }
    })
    const delta = allCorrect ? 1 : 0
    setFloatDelta(delta > 0 ? delta : null)
    setFloatKey((k) => k + 1)
    onSubmit?.({ placements: result, isAllCorrect: allCorrect, delta })
  }

  // Determine if all non-distractor products are placed
  const nonDistractors = question.productAssignments.filter((a) => a.categoryId !== null)
  const allPlaced = nonDistractors.every((a) => placements[a.productId] !== 'unplaced')

  const unplacedProducts = draggableProducts.filter((p) => placements[p.id] === 'unplaced')

  return (
    <div style={{ position: 'relative' }}>
      {floatDelta !== null && (
        <ScoreFloat delta={floatDelta} id={`dd-score-${floatKey}`} />
      )}

      <p style={{ fontWeight: 600, fontSize: 15, color: '#140F50', marginBottom: 12 }}>
        {question.instruction}
      </p>

      {/* Unplaced products shelf */}
      <div
        style={{
          background: 'rgba(20,72,255,0.05)',
          border: '2px dashed rgba(20,72,255,0.2)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
          minHeight: 80,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOverZone('unplaced') }}
        onDrop={() => handleDrop('unplaced')}
        onDragLeave={() => setDragOverZone(null)}
      >
        <p style={{ fontSize: 12, color: 'rgba(20,15,80,0.5)', marginBottom: 8 }}>
          Unplaced products — drag to a category below
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {unplacedProducts.map((p) => (
            <DraggableProduct
              key={p.id}
              product={p}
              draggingId={draggingId}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              submitted={submitted}
              result={submitted?.placements?.[p.id]}
              dropdownValue={placements[p.id]}
              onDropdownChange={(v) => handleDropdownChange(p.id, v)}
              categories={question.categories}
            />
          ))}
          {unplacedProducts.length === 0 && (
            <p style={{ color: 'rgba(20,15,80,0.3)', fontSize: 12, margin: 0 }}>All products placed</p>
          )}
        </div>
      </div>

      {/* Category drop zones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {question.categories.map((cat) => {
          const placedHere = draggableProducts.filter((p) => placements[p.id] === cat.id)
          return (
            <div
              key={cat.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverZone(cat.id) }}
              onDrop={() => handleDrop(cat.id)}
              onDragLeave={() => setDragOverZone(null)}
              style={{
                border: `2px solid ${dragOverZone === cat.id ? cat.color : cat.color + '55'}`,
                borderRadius: 10,
                padding: 12,
                background: dragOverZone === cat.id ? `${cat.color}18` : `${cat.color}08`,
                transition: 'background 0.15s, border 0.15s',
                minHeight: 70,
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: cat.color, margin: '0 0 8px' }}>
                {cat.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {placedHere.map((p) => (
                  <DraggableProduct
                    key={p.id}
                    product={p}
                    draggingId={draggingId}
                    onDragStart={setDraggingId}
                    onDragEnd={() => setDraggingId(null)}
                    submitted={submitted}
                    result={submitted?.placements?.[p.id]}
                    dropdownValue={placements[p.id]}
                    onDropdownChange={(v) => handleDropdownChange(p.id, v)}
                    categories={question.categories}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allPlaced}
          style={{
            marginTop: 16,
            padding: '10px 28px',
            backgroundColor: allPlaced ? '#1448FF' : 'rgba(20,15,80,0.15)',
            color: allPlaced ? '#FFFFFF' : 'rgba(20,15,80,0.4)',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: allPlaced ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Submit
        </button>
      )}

      {/* Explanation */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 16,
            padding: '12px 16px',
            backgroundColor: 'rgba(20,15,80,0.05)',
            borderRadius: 10,
            fontSize: 13,
            color: '#140F50',
            lineHeight: 1.6,
            borderLeft: `4px solid ${submitted.isAllCorrect ? '#27AE60' : '#E74C3C'}`,
          }}
        >
          <strong>{submitted.isAllCorrect ? '✓ All correct!' : '✗ Some incorrect.'}</strong>
          {' '}{question.explanation}
        </motion.div>
      )}
    </div>
  )
}

// Internal draggable product chip
function DraggableProduct({ product, draggingId, onDragStart, onDragEnd, submitted, result, dropdownValue, onDropdownChange, categories }) {
  let border = '1.5px solid rgba(20,15,80,0.15)'
  if (submitted) {
    border = result?.correct ? '2px solid #27AE60' : '2px solid #E74C3C'
  }

  return (
    <div
      draggable={!submitted}
      onDragStart={() => onDragStart(product.id)}
      onDragEnd={onDragEnd}
      style={{
        background: product.bgColor,
        border,
        borderRadius: 8,
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: submitted ? 'default' : 'grab',
        opacity: draggingId === product.id ? 0.4 : 1,
        userSelect: 'none',
      }}
      aria-label={`${product.name} — drag to category`}
    >
      <ImageWithFallback
        productId={product.id}
        side="front"
        alt={product.name}
        bgColor={product.bgColor}
        style={{ width: 28, height: 28, borderRadius: 4, flexShrink: 0 }}
      />
      <span style={{ fontSize: 11, color: product.color, fontWeight: 600, maxWidth: 80, lineHeight: 1.2 }}>
        {product.name}
      </span>

      {/* Keyboard accessible dropdown */}
      {!submitted && (
        <select
          value={dropdownValue}
          onChange={(e) => onDropdownChange(e.target.value)}
          aria-label={`Category for ${product.name}`}
          style={{ fontSize: 10, border: 'none', background: 'transparent', cursor: 'pointer', maxWidth: 80 }}
        >
          <option value="unplaced">— unplaced —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      )}
    </div>
  )
}

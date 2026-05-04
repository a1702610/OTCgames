import React from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from './ProductCard.jsx'
import { ProductModal } from './ProductModal.jsx'

const PRODUCTS_PER_ROW = 4

function chunk(arr, size) {
  const result = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

/** Group products by their row number. Falls back to chunk-by-4 if no row data. */
function groupByRow(products) {
  const hasRows = products.some((p) => p.row != null)
  if (!hasRows) return chunk(products, PRODUCTS_PER_ROW)

  const rowMap = new Map()
  for (const p of products) {
    const key = p.row ?? 0
    if (!rowMap.has(key)) rowMap.set(key, [])
    rowMap.get(key).push(p)
  }
  return [...rowMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, prods]) => prods)
}

export function ShelfDisplay({ shelf, products, mode = 'browse', selectedProductId, onSelect, dragState, onDragStart, onDragEnd }) {
  // mode: 'browse' | 'select' | 'dragdrop'
  const [modalProduct, setModalProduct] = React.useState(null)

  function handleProductClick(product) {
    if (mode === 'browse') {
      setModalProduct(product)
    } else if (mode === 'select') {
      onSelect?.(product.id)
    }
  }

  const rows = groupByRow(products)

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      {/* Shelf header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${shelf.color}dd 0%, ${shelf.color}99 100%)`,
          borderRadius: '14px 14px 0 0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 22 }}>{shelf.emoji}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {shelf.label}{shelf.shelfNumber > 1 && ` (${shelf.shelfNumber})`}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(20,15,80,0.70)' }}>{products.length} products</div>
        </div>
      </div>

      {/* Shelf unit — dark pharmacy look */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1a1560 0%, #0e0b3d 100%)',
          borderRadius: '0 0 12px 12px',
          padding: '10px 8px 4px',
          minHeight: 80,
          border: `2px solid ${shelf.color}44`,
          borderTop: 'none',
        }}
      >
        {products.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '8px 0', textAlign: 'center' }}>
            Empty shelf.
          </p>
        ) : (
          rows.map((rowProducts, rowIndex) => (
            <div key={rowIndex}>
              {/* Product row */}
              <div style={{ display: 'flex', gap: 6, padding: '6px 4px 0', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                {rowProducts.map((product) => {
                  const isDragging = dragState?.draggingId === product.id
                  const isSelected = mode === 'select' && selectedProductId === product.id

                  if (mode === 'dragdrop') {
                    return (
                      <motion.div
                        key={product.id}
                        draggable
                        onDragStart={() => onDragStart?.(product.id)}
                        onDragEnd={() => onDragEnd?.()}
                        style={{ opacity: isDragging ? 0.4 : 1, cursor: 'grab', flexShrink: 0 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <ProductCard product={product} size="md" />
                      </motion.div>
                    )
                  }

                  return (
                    <div key={product.id} style={{ flexShrink: 0 }}>
                      <ProductCard
                        product={product}
                        isSelected={isSelected}
                        onClick={() => handleProductClick(product)}
                        onZoom={mode !== 'browse' ? (p) => setModalProduct(p) : undefined}
                        size="md"
                      />
                    </div>
                  )
                })}
              </div>

              {/* Shelf plank */}
              <div
                style={{
                  height: 12,
                  margin: '5px 0 2px',
                  background: 'linear-gradient(180deg, #e8d8a8 0%, #c9ab5a 45%, #8b6914 100%)',
                  borderRadius: 3,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Modal — available in all modes */}
      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </div>
  )
}

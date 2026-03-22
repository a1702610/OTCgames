import React from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from './ProductCard.jsx'
import { ProductModal } from './ProductModal.jsx'

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

  return (
    <div>
      {/* Shelf header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${shelf.color}dd 0%, ${shelf.color}99 100%)`,
          borderRadius: '12px 12px 0 0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>{shelf.emoji}</span>
        <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 15 }}>
          {shelf.label}
          {shelf.shelfNumber > 1 && ` (${shelf.shelfNumber})`}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
          {products.length} products
        </span>
      </div>

      {/* Shelf surface */}
      <div
        style={{
          background: 'rgba(20,72,255,0.06)',
          border: `2px solid ${shelf.color}33`,
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: 16,
          minHeight: 80,
        }}
      >
        {products.length === 0 ? (
          <p style={{ color: 'rgba(20,15,80,0.4)', fontSize: 13, margin: 0 }}>No products on this shelf.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {products.map((product) => {
              const isDragging = dragState?.draggingId === product.id
              const isSelected = mode === 'select' && selectedProductId === product.id

              if (mode === 'dragdrop') {
                return (
                  <motion.div
                    key={product.id}
                    draggable
                    onDragStart={() => onDragStart?.(product.id)}
                    onDragEnd={() => onDragEnd?.()}
                    style={{
                      opacity: isDragging ? 0.4 : 1,
                      cursor: 'grab',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ProductCard product={product} size="sm" />
                  </motion.div>
                )
              }

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={isSelected}
                  onClick={() => handleProductClick(product)}
                  size="md"
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {mode === 'browse' && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}
    </div>
  )
}

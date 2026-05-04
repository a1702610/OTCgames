import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ShelfDisplay } from './ShelfDisplay.jsx'

// Supports two modes:
// Single-shelf: pass `shelf` + `products`
// Multi-shelf:  pass `shelves` (array) + `allProducts`
export function ShelfModal({ shelf, shelves, products, allProducts, mode = 'browse', onClose, onSelect, selectedProductId, onConfirm }) {
  const isMulti = !shelf && Array.isArray(shelves) && shelves.length > 0
  const isOpen = isMulti || !!shelf

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="shelf-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(8,6,32,0.82)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            zIndex: 200, backdropFilter: 'blur(12px)',
            overflowY: 'auto', padding: '40px 20px 40px',
          }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255,255,255,0.97)',
              border: '1px solid rgba(131,107,255,0.25)',
              borderRadius: 22, padding: 24,
              maxWidth: 720, width: '100%',
              position: 'relative',
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(20,15,80,0.08)', border: 'none', borderRadius: '50%',
                width: 34, height: 34, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#140F50',
              }}
            >
              <X size={18} />
            </button>

            {isMulti ? (
              <>
                <h2 style={{ margin: '0 0 4px', fontSize: 19, color: '#140F50', fontWeight: 700 }}>
                  All Products
                </h2>
                <p style={{ margin: '0 0 20px', fontSize: 12, color: 'rgba(20,15,80,0.45)' }}>
                  {mode === 'select' ? 'Click a product to select it' : 'Click a product to zoom'}
                </p>
                {shelves.map((s) => {
                  const sProducts = (allProducts || []).filter((p) => p.category === s.id)
                  if (sProducts.length === 0) return null
                  return (
                    <div key={s.id} style={{ marginBottom: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 20 }}>{s.emoji}</span>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: s.color }}>{s.label}</h3>
                        <span style={{ fontSize: 11, color: 'rgba(20,15,80,0.40)' }}>{sProducts.length} products</span>
                      </div>
                      <ShelfDisplay
                        shelf={s}
                        products={sProducts}
                        mode={mode}
                        selectedProductId={selectedProductId}
                        onSelect={onSelect}
                      />
                    </div>
                  )
                })}
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 4px', fontSize: 19, color: '#140F50', fontWeight: 700 }}>
                  {shelf.emoji} {shelf.label}
                </h2>
                <p style={{ margin: '0 0 20px', fontSize: 12, color: 'rgba(20,15,80,0.45)' }}>
                  {products.length} product{products.length !== 1 ? 's' : ''}
                  {mode === 'select' ? ' — click a product to select it' : ' — click a product to zoom'}
                </p>
                <ShelfDisplay
                  shelf={shelf}
                  products={products}
                  mode={mode}
                  selectedProductId={selectedProductId}
                  onSelect={onSelect}
                />
              </>
            )}

            {mode === 'select' && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={onConfirm}
                  disabled={!selectedProductId}
                  style={{
                    background: selectedProductId ? '#1448FF' : 'rgba(20,72,255,0.12)',
                    color: selectedProductId ? '#FFFFFF' : 'rgba(20,15,80,0.28)',
                    border: 'none', borderRadius: 12, padding: '13px 40px',
                    fontWeight: 700, fontSize: 15,
                    cursor: selectedProductId ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {selectedProductId ? 'Confirm Selection →' : 'Select a product first'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

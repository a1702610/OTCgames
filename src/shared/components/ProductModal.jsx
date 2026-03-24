import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { ImageWithFallback } from '../utils/imageUtils.jsx'

const SIDES_ALL = ['front', 'back', 'side']

export function ProductModal({ product, onClose }) {
  const [sideIndex, setSideIndex] = React.useState(0)

  // Reset state when product changes
  React.useEffect(() => {
    setSideIndex(0)
  }, [product?.id])

  const availableSides = product?.sides?.length > 0 ? product.sides : SIDES_ALL

  // Close on Escape key
  React.useEffect(() => {
    if (!product) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product, onClose])

  const side = availableSides[sideIndex]

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(10,8,40,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            backdropFilter: 'blur(8px)',
            padding: 20,
          }}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 28,
              maxWidth: 560,
              width: '100%',
              position: 'relative',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute', top: 14, right: 14, zIndex: 2,
                background: 'rgba(20,15,80,0.08)', border: 'none',
                borderRadius: 20, width: 36, height: 36,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>

            {/* Full-size image */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageWithFallback
                productId={product.id}
                side={side}
                alt={`${product.name} ${side}`}
                bgColor={product.bgColor}
                style={{ width: '100%', height: '60vh', borderRadius: 12 }}
              />
            </div>

            {/* Side navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 16 }}>
              {availableSides.length > 1 && (
                <button
                  onClick={() => setSideIndex((i) => (i - 1 + availableSides.length) % availableSides.length)}
                  aria-label="Previous image"
                  style={{ background: 'rgba(20,15,80,0.06)', border: 'none', borderRadius: 50, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronLeft size={22} />
                </button>
              )}
              {availableSides.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setSideIndex(i)}
                  aria-label={s}
                  style={{
                    width: 10, height: 10, borderRadius: 5,
                    background: i === sideIndex ? '#1448FF' : '#BDC3C7',
                    border: 'none', cursor: availableSides.length > 1 ? 'pointer' : 'default', padding: 0,
                    transition: 'background 0.2s',
                  }}
                />
              ))}
              {availableSides.length > 1 && (
                <button
                  onClick={() => setSideIndex((i) => (i + 1) % availableSides.length)}
                  aria-label="Next image"
                  style={{ background: 'rgba(20,15,80,0.06)', border: 'none', borderRadius: 50, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Product info */}
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20, color: '#140F50', fontWeight: 700 }}>{product.name}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#836BFF', fontWeight: 600 }}>{product.brand}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

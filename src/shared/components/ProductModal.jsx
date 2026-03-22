import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { ImageWithFallback } from '../utils/imageUtils.jsx'

const SIDES = ['front', 'back', 'side']

export function ProductModal({ product, onClose }) {
  const [sideIndex, setSideIndex] = React.useState(0)
  const [zoomed, setZoomed] = React.useState(false)

  // Reset state when product changes
  React.useEffect(() => {
    setSideIndex(0)
    setZoomed(false)
  }, [product?.id])

  const side = SIDES[sideIndex]

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={zoomed ? () => setZoomed(false) : onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(20,15,80,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            backdropFilter: 'blur(6px)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              maxWidth: zoomed ? '90vw' : 400,
              width: '90vw',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(20,15,80,0.08)', border: 'none',
                borderRadius: 20, width: 32, height: 32,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>

            {/* Image */}
            <div
              style={{ position: 'relative', cursor: 'zoom-in' }}
              onClick={() => setZoomed(!zoomed)}
            >
              <ImageWithFallback
                productId={product.id}
                side={side}
                alt={`${product.name} ${side}`}
                bgColor={product.bgColor}
                style={{ width: '100%', height: zoomed ? '70vh' : 200 }}
              />
              <ZoomIn
                size={18}
                style={{ position: 'absolute', bottom: 8, right: 8, opacity: 0.5 }}
              />
            </div>

            {/* Side navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={() => setSideIndex((i) => (i - 1 + 3) % 3)}
                aria-label="Previous image"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ChevronLeft size={22} />
              </button>
              {SIDES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setSideIndex(i)}
                  aria-label={s}
                  style={{
                    width: 8, height: 8, borderRadius: 4,
                    background: i === sideIndex ? '#1448FF' : '#BDC3C7',
                    border: 'none', cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
              <button
                onClick={() => setSideIndex((i) => (i + 1) % 3)}
                aria-label="Next image"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Product info */}
            <div style={{ marginTop: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#140F50' }}>{product.name}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#836BFF', fontWeight: 600 }}>{product.brand}</p>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                <strong>Active ingredient:</strong> {product.activeIngredient}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

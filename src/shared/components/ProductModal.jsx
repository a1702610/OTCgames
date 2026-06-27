import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { ImageWithFallback, getImageUrl } from '../utils/imageUtils.jsx'

const SIDES_ALL = ['front', 'back', 'side']
const ZOOM = 2
const PANEL = 400   // px — zoom panel size

export function ProductModal({ product, onClose }) {
  const [sideIndex, setSideIndex] = React.useState(0)
  const [hover, setHover] = React.useState(null)           // { cx, cy, rect }
  const [naturalSize, setNaturalSize] = React.useState(null) // { w, h }
  const imgContainerRef = React.useRef(null)
  const modalCardRef = React.useRef(null)

  React.useEffect(() => {
    setSideIndex(0)
    setHover(null)
    setNaturalSize(null)
  }, [product?.id])

  React.useEffect(() => {
    setHover(null)
    setNaturalSize(null)
  }, [sideIndex])

  const availableSides = product?.sides?.length > 0 ? product.sides : SIDES_ALL

  React.useEffect(() => {
    if (!product) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product, onClose])

  const side = availableSides[sideIndex]
  const imageUrl = product ? getImageUrl(product.id, side) : null

  function handleMouseMove(e) {
    if (!imageUrl || !naturalSize) return
    const rect = imgContainerRef.current.getBoundingClientRect()
    setHover({ cx: e.clientX - rect.left, cy: e.clientY - rect.top, rect })
  }

  // Calculate where the image actually sits inside the container (objectFit: contain)
  function getRenderedImageRect(containerW, containerH, natW, natH) {
    const containerAspect = containerW / containerH
    const imageAspect = natW / natH
    let rW, rH, offX, offY
    if (imageAspect > containerAspect) {
      rW = containerW
      rH = containerW / imageAspect
      offX = 0
      offY = (containerH - rH) / 2
    } else {
      rH = containerH
      rW = containerH * imageAspect
      offX = (containerW - rW) / 2
      offY = 0
    }
    return { rW, rH, offX, offY }
  }

  // Compute lens + panel geometry
  let lensRect = null
  let panelStyle = null

  if (hover && imageUrl && naturalSize && imgContainerRef.current && modalCardRef.current) {
    const { cx, cy, rect } = hover
    const { rW, rH, offX, offY } = getRenderedImageRect(rect.width, rect.height, naturalSize.w, naturalSize.h)

    const lensW = PANEL / ZOOM
    const lensH = PANEL / ZOOM

    // Cursor position relative to the actual image content (not container)
    const imgX = cx - offX
    const imgY = cy - offY

    // Clamp lens so it stays within the rendered image bounds
    const lensX = Math.max(0, Math.min(imgX - lensW / 2, rW - lensW))
    const lensY = Math.max(0, Math.min(imgY - lensH / 2, rH - lensH))

    // Lens rect position in container coordinates (for the overlay rectangle)
    lensRect = { left: offX + lensX, top: offY + lensY, width: lensW, height: lensH }

    // Zoom panel
    const cardRect = modalCardRef.current.getBoundingClientRect()
    const spaceRight = window.innerWidth - cardRect.right
    const panelLeft = spaceRight >= PANEL + 24
      ? cardRect.right + 16
      : cardRect.left - PANEL - 16
    const panelTop = Math.max(16, Math.min(
      cardRect.top + (cardRect.height - PANEL) / 2,
      window.innerHeight - PANEL - 16
    ))

    panelStyle = {
      position: 'fixed',
      left: panelLeft,
      top: panelTop,
      width: PANEL,
      height: PANEL,
      borderRadius: 16,
      border: '2px solid #836BFF',
      // background-size matches the rendered image size * zoom
      backgroundImage: `url("${imageUrl}")`,
      backgroundSize: `${rW * ZOOM}px ${rH * ZOOM}px`,
      backgroundPosition: `${-(lensX * ZOOM)}px ${-(lensY * ZOOM)}px`,
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#f8f8fc',
      boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(131,107,255,0.3)',
      pointerEvents: 'none',
      zIndex: 9999,
    }
  }

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
            backgroundColor: 'rgba(8,6,32,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
            backdropFilter: 'blur(12px)',
            padding: 20,
          }}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          <motion.div
            ref={modalCardRef}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255,255,255,0.97)',
              border: '1px solid rgba(131,107,255,0.25)',
              borderRadius: 24,
              padding: 28,
              maxWidth: 560,
              width: '100%',
              position: 'relative',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute', top: 14, right: 14, zIndex: 2,
                background: 'rgba(131,107,255,0.22)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20, width: 36, height: 36,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(20,15,80,0.70)',
              }}
            >
              <X size={20} />
            </button>

            {/* Image + lens overlay */}
            <div
              ref={imgContainerRef}
              style={{
                flex: 1, minHeight: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                cursor: imageUrl && naturalSize ? 'crosshair' : 'default',
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHover(null)}
            >
              <ImageWithFallback
                productId={product.id}
                side={side}
                alt={`${product.name} ${side}`}
                bgColor={product.bgColor}
                style={{ width: '100%', height: '60vh', borderRadius: 12 }}
                onLoad={(e) => setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
              />
              {/* Lens rectangle on top of the image */}
              {lensRect && (
                <div style={{
                  position: 'absolute',
                  left: lensRect.left,
                  top: lensRect.top,
                  width: lensRect.width,
                  height: lensRect.height,
                  border: '2px solid #836BFF',
                  background: 'rgba(131,107,255,0.10)',
                  borderRadius: 4,
                  pointerEvents: 'none',
                  boxSizing: 'border-box',
                }} />
              )}
            </div>

            <p style={{
              margin: '8px 0 0', textAlign: 'center',
              fontSize: 11,
              color: hover ? '#836BFF' : 'rgba(131,107,255,0.50)',
              fontWeight: hover ? 600 : 500,
              transition: 'color 0.2s',
            }}>
              {hover ? 'Zoom active — move slowly to read' : imageUrl ? 'Hover over the image to zoom' : ''}
            </p>

            {/* Side navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 12 }}>
              {availableSides.length > 1 && (
                <button
                  onClick={() => setSideIndex((i) => (i - 1 + availableSides.length) % availableSides.length)}
                  aria-label="Previous image"
                  style={{ background: 'rgba(131,107,255,0.22)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 50, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(20,15,80,0.80)' }}
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
                    background: i === sideIndex ? '#836BFF' : 'rgba(20,15,80,0.22)',
                    border: 'none', cursor: availableSides.length > 1 ? 'pointer' : 'default', padding: 0,
                    transition: 'background 0.2s',
                  }}
                />
              ))}
              {availableSides.length > 1 && (
                <button
                  onClick={() => setSideIndex((i) => (i + 1) % availableSides.length)}
                  aria-label="Next image"
                  style={{ background: 'rgba(131,107,255,0.22)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 50, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(20,15,80,0.80)' }}
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

          {/* Zoom panel — fixed beside the modal */}
          {panelStyle && <div style={panelStyle} />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

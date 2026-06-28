import React from 'react'
import { getProductById } from '../../data/products.js'

// Build-time base (GitHub Pages workflow sets VITE_IMAGE_BASE_URL).
// setImageBase() overrides this at runtime when content.json supplies imageBaseUrl.
const BUILD_TIME_BASE = import.meta.env.VITE_IMAGE_BASE_URL || '.'
let _runtimeBase = null

export function setImageBase(url) {
  _runtimeBase = url
}

export function getImageUrl(productId, side = 'front') {
  const product = getProductById(productId)
  if (!product?.imageFolderPath) return null
  // sides stores filenames like 'front.jpg' or 'front.png'; fall back to .jpg for old data
  const sideFile = product.sides?.find(s => s === side || s.startsWith(side + '.')) || `${side}.jpg`
  const filename = sideFile.includes('.') ? sideFile : `${sideFile}.jpg`
  const encoded = product.imageFolderPath
    .split('/')
    .map(encodeURIComponent)
    .join('/')
  const base = _runtimeBase || BUILD_TIME_BASE
  return `${base}/${encoded}/${filename}`
}

// Component that renders a product image with a styled fallback placeholder
export function ImageWithFallback({ productId, side = 'front', alt, bgColor = '#1448FF', style = {}, onLoad }) {
  const [failed, setFailed] = React.useState(false)
  const src = getImageUrl(productId, side)

  // Reset failed state when src changes so navigating back to a real image works
  React.useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div
        style={{
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          ...style,
        }}
        aria-label={alt || `${productId} placeholder`}
        role="img"
      >
        <span style={{ fontSize: '2rem', opacity: 0.5 }}>📦</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt || productId}
      onError={() => setFailed(true)}
      onLoad={onLoad}
      style={{ objectFit: 'contain', borderRadius: 8, ...style }}
    />
  )
}

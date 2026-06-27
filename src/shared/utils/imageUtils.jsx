import React from 'react'
import { getProductById } from '../../data/products.js'

// Resolves image URL for a product using the imageFolderPath stored in products.js.
// Folder names with spaces/special chars are URL-encoded per segment.
export function getImageUrl(productId, side = 'front') {
  const product = getProductById(productId)
  if (!product?.imageFolderPath) return null
  const encoded = product.imageFolderPath
    .split('/')
    .map(encodeURIComponent)
    .join('/')
  return `./${encoded}/${side}.jpg`
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

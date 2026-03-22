import React from 'react'

// Resolves image URL for a product. Missing images are handled by ImageWithFallback's onError.
export function getImageUrl(productId, side = 'front') {
  return `./images/${productId}_${side}.jpg`
}

// Component that renders a product image with a styled fallback placeholder
export function ImageWithFallback({ productId, side = 'front', alt, bgColor = '#1448FF', style = {} }) {
  const [failed, setFailed] = React.useState(false)
  const src = getImageUrl(productId, side)

  // Reset failed state when src changes so navigating back to a real image works
  React.useEffect(() => {
    setFailed(false)
  }, [src])

  if (failed) {
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
      style={{ objectFit: 'contain', borderRadius: 8, ...style }}
    />
  )
}

import { motion } from 'framer-motion'
import { ImageWithFallback } from '../utils/imageUtils.jsx'

export function ProductCard({ product, onClick, isSelected, isDisabled, size = 'md', onZoom }) {
  const dim = size === 'sm' ? 80 : size === 'lg' ? 140 : 110

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <motion.button
        whileHover={isDisabled ? {} : { scale: 1.04, y: -2 }}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        onClick={isDisabled ? undefined : onClick}
        aria-pressed={isSelected}
        aria-label={product.name}
        style={{
          width: dim,
          background: product.bgColor || '#1448FF',
          border: isSelected ? '3px solid #1448FF' : '3px solid transparent',
          borderRadius: 12,
          padding: 8,
          cursor: isDisabled ? 'default' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          boxShadow: isSelected
            ? `0 0 0 4px rgba(20,72,255,0.3), 0 4px 20px rgba(20,72,255,0.25)`
            : `0 4px 16px rgba(0,0,0,0.15)`,
          opacity: isDisabled ? 0.45 : 1,
          transition: 'box-shadow 0.2s, opacity 0.2s',
          outline: 'none',
        }}
      >
        <ImageWithFallback
          productId={product.id}
          side="front"
          alt={product.name}
          bgColor={product.bgColor}
          style={{ width: dim - 16, height: dim - 16 }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: product.color || '#FFFFFF',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: dim - 16,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </span>
      </motion.button>

      {/* Zoom button — sibling of card button to avoid invalid nested button HTML */}
      {onZoom && (
        <button
          onClick={(e) => { e.stopPropagation(); onZoom(product) }}
          aria-label={`View ${product.name} details`}
          title="View details"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.45)',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            backdropFilter: 'blur(2px)',
            lineHeight: 1,
          }}
        >
          🔍
        </button>
      )}
    </div>
  )
}

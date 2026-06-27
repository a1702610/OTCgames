import React from 'react'
import { usePlayer } from '../PlayerContext.jsx'
import { ProductModal } from '../../shared/components/ProductModal.jsx'
import { ImageWithFallback } from '../../shared/utils/imageUtils.jsx'

export function ShelfBrowse() {
  const { moduleData } = usePlayer()
  const [activeGroupLabel, setActiveGroupLabel] = React.useState(null)
  const [activeProduct, setActiveProduct] = React.useState(null)

  const shelves = moduleData?.shelves ?? []
  const products = moduleData?.products ?? []

  // Group shelves by label — preserves the order they appear in the products.js shelf list
  const shelfGroups = React.useMemo(() => {
    const seen = new Map()
    shelves.forEach((shelf) => {
      if (!seen.has(shelf.label)) {
        seen.set(shelf.label, { label: shelf.label, emoji: shelf.emoji, color: shelf.color, shelves: [] })
      }
      seen.get(shelf.label).shelves.push(shelf)
    })
    return [...seen.values()]
  }, [shelves])

  React.useEffect(() => {
    if (shelfGroups.length > 0 && !activeGroupLabel) {
      setActiveGroupLabel(shelfGroups[0].label)
    }
  }, [shelfGroups, activeGroupLabel])

  if (!moduleData) return null

  const activeGroup = shelfGroups.find((g) => g.label === activeGroupLabel) || null

  return (
    <>
      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 160px)', minHeight: 400 }}>
        {/* Left: vertical accordion tabs */}
        <div
          style={{
            width: 76,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            overflowY: 'auto',
            paddingRight: 6,
          }}
        >
          {shelfGroups.map((group) => {
            const isActive = activeGroupLabel === group.label
            return (
              <button
                key={group.label}
                onClick={() => setActiveGroupLabel(group.label)}
                style={{
                  background: isActive
                    ? `linear-gradient(160deg, ${group.color}ee 0%, ${group.color}bb 100%)`
                    : 'rgba(255,255,255,0.78)',
                  border: `2px solid ${isActive ? group.color : 'rgba(20,15,80,0.10)'}`,
                  borderRadius: 12,
                  padding: '14px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 90,
                  width: '100%',
                  transition: 'all 0.18s',
                  boxShadow: isActive ? `0 2px 12px ${group.color}44` : 'none',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{group.emoji}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : 'rgba(20,15,80,0.55)',
                    writingMode: 'vertical-lr',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    lineHeight: 1.25,
                    letterSpacing: '0.02em',
                  }}
                >
                  {group.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right: product content for active group */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingLeft: 16,
          }}
        >
          {activeGroup && (
            <GroupContent
              group={activeGroup}
              products={products}
              onProductClick={setActiveProduct}
            />
          )}
        </div>
      </div>

      {activeProduct && (
        <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />
      )}
    </>
  )
}

function GroupContent({ group, products, onProductClick }) {
  return (
    <div>
      {group.shelves.map((shelf, shelfIdx) => {
        const shelfProducts = products.filter((p) => p.category === shelf.id)
        if (shelfProducts.length === 0) return null

        // Organise by row
        const byRow = {}
        shelfProducts.forEach((p) => {
          const row = p.row ?? 1
          if (!byRow[row]) byRow[row] = []
          byRow[row].push(p)
        })
        const rows = Object.entries(byRow).sort(([a], [b]) => Number(a) - Number(b))

        return (
          <div key={shelf.id} style={{ marginBottom: 28 }}>
            {group.shelves.length > 1 && (
              <p style={{
                margin: '0 0 10px',
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(20,15,80,0.40)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {shelf.label}{shelf.shelfNumber > 1 ? ` ${shelf.shelfNumber}` : ''}
              </p>
            )}

            {rows.map(([row, rowProducts], rowIdx) => (
              <div key={row}>
                {rowIdx > 0 && (
                  <div style={{
                    height: 3,
                    background: 'linear-gradient(90deg, #C9A227 0%, #F0C848 50%, #C9A227 100%)',
                    borderRadius: 2,
                    margin: '14px 0',
                  }} />
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {rowProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      color={group.color}
                      onClick={() => onProductClick(product)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {shelfIdx < group.shelves.length - 1 && (
              <div style={{ height: 1, background: 'rgba(20,15,80,0.08)', margin: '24px 0 0' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ProductCard({ product, color, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 108,
        background: hovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.88)',
        border: `1.5px solid ${hovered ? color : 'rgba(20,15,80,0.10)'}`,
        borderRadius: 12,
        padding: '10px 8px 8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.15s',
        boxShadow: hovered ? `0 4px 16px ${color}28` : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <ImageWithFallback
        productId={product.id}
        side="front"
        bgColor={color}
        style={{ width: 76, height: 76, borderRadius: 8, flexShrink: 0 }}
      />
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: '#140F50',
        textAlign: 'center',
        lineHeight: 1.3,
        wordBreak: 'break-word',
        width: '100%',
      }}>
        {product.name}
      </span>
    </button>
  )
}

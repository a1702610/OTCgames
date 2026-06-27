import React from 'react'
import { usePlayer } from '../PlayerContext.jsx'
import { ProductModal } from '../../shared/components/ProductModal.jsx'
import { ProductCard } from '../../shared/components/ProductCard.jsx'

export function ShelfBrowse() {
  const { moduleData } = usePlayer()
  const [activeGroupLabel, setActiveGroupLabel] = React.useState(null)
  const [activeProduct, setActiveProduct] = React.useState(null)

  const shelves = moduleData?.shelves ?? []
  const products = moduleData?.products ?? []

  // Group shelves by label — preserves order from products.js
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

        {/* Left: vertical scrollable tabs */}
        <div style={{ width: 100, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
          {shelfGroups.map((group) => {
            const isActive = activeGroupLabel === group.label
            return (
              <button
                key={group.label}
                onClick={() => setActiveGroupLabel(group.label)}
                style={{
                  background: isActive
                    ? `linear-gradient(160deg, ${group.color}ee 0%, ${group.color}bb 100%)`
                    : 'rgba(255,255,255,0.88)',
                  border: `2px solid ${isActive ? group.color : 'rgba(20,15,80,0.10)'}`,
                  borderRadius: 12,
                  padding: '16px 4px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 110,
                  width: '100%',
                  flexShrink: 0,
                  transition: 'all 0.18s',
                  boxShadow: isActive ? `0 2px 14px ${group.color}44` : 'none',
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>{group.emoji}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isActive ? '#FFFFFF' : 'rgba(20,15,80,0.65)',
                    writingMode: 'vertical-lr',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    lineHeight: 1.3,
                    letterSpacing: '0.01em',
                  }}
                >
                  {group.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Purple divider */}
        <div style={{
          width: 3,
          flexShrink: 0,
          background: 'linear-gradient(180deg, #836BFF 0%, #1448FF 100%)',
          borderRadius: 3,
          margin: '0 12px',
          opacity: 0.7,
        }} />

        {/* Right: shelf cards for the active group */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      {group.shelves.map((shelf) => {
        const shelfProducts = products.filter((p) => p.category === shelf.id)
        if (shelfProducts.length === 0) return null
        return (
          <ShelfCard
            key={shelf.id}
            shelf={shelf}
            group={group}
            products={shelfProducts}
            onProductClick={onProductClick}
          />
        )
      })}
    </div>
  )
}

function ShelfCard({ shelf, group, products, onProductClick }) {
  const byRow = {}
  products.forEach((p) => {
    const row = p.row ?? 1
    if (!byRow[row]) byRow[row] = []
    byRow[row].push(p)
  })
  const rows = Object.entries(byRow).sort(([a], [b]) => Number(a) - Number(b))

  const displayName = shelf.label + (shelf.shelfNumber > 1 ? ` ${shelf.shelfNumber}` : '')

  return (
    <div
      style={{
        background: 'rgba(20,15,80,0.96)',
        border: `2px solid ${group.color}55`,
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      {/* Shelf header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${group.color}dd 0%, ${group.color}99 100%)`,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span style={{ fontSize: 28 }}>{group.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 16, lineHeight: 1.2 }}>
            {displayName}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Products by row */}
      <div style={{ padding: '18px 18px 20px' }}>
        {rows.map(([row, rowProducts], idx) => (
          <div key={row}>
            {idx > 0 && (
              <div
                style={{
                  height: 3,
                  background: 'linear-gradient(90deg, #C9A227 0%, #F0C848 50%, #C9A227 100%)',
                  borderRadius: 2,
                  margin: '16px 0',
                }}
              />
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {rowProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product)}
                  size="md"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


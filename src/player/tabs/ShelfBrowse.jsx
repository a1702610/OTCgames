import React from 'react'
import { usePlayer } from '../PlayerContext.jsx'
import { ShelfModal } from '../../shared/components/ShelfModal.jsx'

export function ShelfBrowse() {
  const { moduleData } = usePlayer()
  const [activeShelf, setActiveShelf] = React.useState(null)

  if (!moduleData) return <p>No module loaded.</p>

  const { shelves, products } = moduleData

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, paddingBottom: 16 }}>
        {shelves.map((shelf) => {
          const shelfProducts = products.filter((p) => p.category === shelf.id)
          return (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              productCount={shelfProducts.length}
              onView={() => setActiveShelf(shelf)}
            />
          )
        })}
      </div>

      {activeShelf && (
        <ShelfModal
          shelf={activeShelf}
          products={products.filter((p) => p.category === activeShelf.id)}
          mode="browse"
          onClose={() => setActiveShelf(null)}
        />
      )}
    </>
  )
}

function ShelfCard({ shelf, productCount, onView }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.78)',
        border: '1px solid rgba(131,107,255,0.20)',
        borderRadius: 16,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${shelf.color}dd 0%, ${shelf.color}99 100%)`,
          padding: '16px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <span style={{ fontSize: 28 }}>{shelf.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 15, lineHeight: 1.2 }}>
            {shelf.label}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            {productCount} product{productCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 18px' }}>
        <button
          onClick={onView}
          style={{
            width: '100%', padding: '10px',
            background: `${shelf.color}18`,
            border: `1.5px solid ${shelf.color}55`,
            borderRadius: 10, color: shelf.color,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = `${shelf.color}28` }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${shelf.color}18` }}
        >
          Browse Shelf →
        </button>
      </div>
    </div>
  )
}

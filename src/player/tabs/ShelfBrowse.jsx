import React from 'react'
import { shelves as ALL_SHELVES, products as ALL_PRODUCTS } from '../../data/products.js'
import { ProductModal } from '../../shared/components/ProductModal.jsx'
import { ProductCard } from '../../shared/components/ProductCard.jsx'

const BASE = import.meta.env.BASE_URL

// Ordered grid of screens — 5 per row
// shelfId: null = non-clickable (no product data yet)
const SCREENS = [
  { file: 'Adelaide University.png',  label: 'Adelaide University',  shelfId: null },
  { file: 'Cold and Flu 1.png',       label: 'Cold & Flu 1',         shelfId: 'cold-and-flu-1' },
  { file: 'Cold and Flu 2.png',       label: 'Cold & Flu 2',         shelfId: 'cold-and-flu-2' },
  { file: 'ENT.png',                  label: 'Ear, Nose & Throat',   shelfId: 'ent' },
  { file: 'Eyes.png',                 label: 'Eyes',                 shelfId: 'eyes' },
  { file: 'Gastrointestinal.png',     label: 'Gastrointestinal 1',   shelfId: 'gastrointestinal-1' },
  { file: 'Gastrointestinal 2.png',   label: 'Gastrointestinal 2',   shelfId: 'gastrointestinal-2' },
  { file: 'Gastrointestinal 3.png',   label: 'Gastrointestinal 3',   shelfId: 'gastrointestinal-3' },
  { file: 'Hayfever.png',             label: 'Hayfever',             shelfId: 'hayfever' },
  { file: 'Pain Management.png',      label: 'Pain Management 1',    shelfId: 'pain-management-1' },
  { file: 'Pain Management 2.png',    label: 'Pain Management 2',    shelfId: 'pain-management-2' },
  { file: 'Skin 1.png',               label: 'Skin 1',               shelfId: 'skin-1' },
  { file: 'Skin 2.png',               label: 'Skin 2',               shelfId: 'skin-2' },
  { file: 'Skin 3.png',               label: 'Skin 3',               shelfId: null },
  { file: 'Smoking Cessation.png',    label: 'Smoking Cessation',    shelfId: 'smoking-cessation' },
  { file: 'Urinary.png',              label: 'Urinary',              shelfId: null },
  { file: 'S3 - Fridge.png',          label: 'S3 — Fridge',          shelfId: 'fridge' },
  { file: 'S3 - b.png',               label: 'S3 — B',               shelfId: 's3-a' },
  { file: 'S3 - c.png',               label: 'S3 — C',               shelfId: 's3-b' },
  { file: 'S3 - d.png',               label: 'S3 — D',               shelfId: 's3-c' },
  { file: 'S3 - e.png',               label: 'S3 — E',               shelfId: 's3-d' },
]

function screenshotUrl(file) {
  return `${BASE}shelf-screenshots/${encodeURIComponent(file)}`
}

export function ShelfBrowse() {
  const [activeScreen, setActiveScreen] = React.useState(null)
  const [activeProduct, setActiveProduct] = React.useState(null)

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
          padding: '4px 0 16px',
        }}
      >
        {SCREENS.map((screen) => {
          const clickable = screen.shelfId !== null
          return (
            <div
              key={screen.file}
              onClick={clickable ? () => setActiveScreen(screen) : undefined}
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                cursor: clickable ? 'pointer' : 'default',
                border: '2px solid rgba(131,107,255,0.15)',
                background: 'rgba(20,15,80,0.06)',
                transition: 'transform 0.14s, border-color 0.14s, box-shadow 0.14s',
              }}
              onMouseEnter={(e) => {
                if (!clickable) return
                e.currentTarget.style.transform = 'scale(1.03)'
                e.currentTarget.style.borderColor = 'rgba(131,107,255,0.70)'
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(131,107,255,0.30)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.borderColor = 'rgba(131,107,255,0.15)'
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <img
                src={screenshotUrl(screen.file)}
                alt={screen.label}
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                loading="lazy"
              />
              <div
                style={{
                  padding: '5px 4px 6px',
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: clickable ? 'rgba(20,15,80,0.80)' : 'rgba(20,15,80,0.35)',
                  lineHeight: 1.3,
                  background: 'rgba(255,255,255,0.88)',
                }}
              >
                {screen.label}
                {clickable && (
                  <span style={{ display: 'block', fontSize: 9, color: 'rgba(131,107,255,0.70)', fontWeight: 500 }}>
                    tap to browse
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {activeScreen && (
        <ShelfModal
          screen={activeScreen}
          onClose={() => setActiveScreen(null)}
          onProductClick={setActiveProduct}
        />
      )}

      {activeProduct && (
        <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />
      )}
    </>
  )
}

function ShelfModal({ screen, onClose, onProductClick }) {
  // shelf may be null if products haven't been added yet (e.g. S3-e)
  const shelf = ALL_SHELVES.find((s) => s.id === screen.shelfId) ?? null
  const shelfProducts = ALL_PRODUCTS.filter((p) => p.category === screen.shelfId)

  const byRow = {}
  shelfProducts.forEach((p) => {
    const row = p.row ?? 1
    if (!byRow[row]) byRow[row] = []
    byRow[row].push(p)
  })
  const rows = Object.entries(byRow).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,8,40,0.82)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(20,15,80,0.97)',
          borderRadius: 20,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 860,
          border: `2px solid ${shelf?.color ?? '#836BFF'}55`,
          boxShadow: '0 24px 80px rgba(0,0,0,0.70)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${shelf?.color ?? '#836BFF'}dd 0%, ${shelf?.color ?? '#836BFF'}99 100%)`,
            padding: '18px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 30 }}>{shelf?.emoji ?? '📦'}</span>
            <div>
              <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: 20 }}>
                {shelf?.shelfName ?? screen.label}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', marginTop: 2 }}>
                {shelfProducts.length} product{shelfProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.30)', border: 'none',
              borderRadius: '50%', width: 36, height: 36,
              cursor: 'pointer', color: '#FFFFFF', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Products by row */}
        <div style={{ padding: '20px 20px 24px' }}>
          {rows.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              Products for this shelf are coming soon.
            </p>
          ) : (
            rows.map(([row, rowProducts], idx) => (
              <div key={row}>
                {idx > 0 && (
                  <div
                    style={{
                      height: 3,
                      background: 'linear-gradient(90deg, #C9A227 0%, #F0C848 50%, #C9A227 100%)',
                      borderRadius: 2,
                      margin: '18px 0',
                    }}
                  />
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {rowProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => onProductClick(product)}
                      size="xl"
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { usePlayer } from '../PlayerContext.jsx'
import { ShelfDisplay } from '../../shared/components/ShelfDisplay.jsx'

export function ShelfBrowse() {
  const { moduleData } = usePlayer()

  if (!moduleData) return <p>No module loaded.</p>

  const { shelves, products } = moduleData

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 16, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
      {shelves.map((shelf) => {
        const shelfProducts = products.filter((p) => p.category === shelf.id)
        return (
          <ShelfDisplay
            key={shelf.id}
            shelf={shelf}
            products={shelfProducts}
            mode="browse"
          />
        )
      })}
    </div>
  )
}

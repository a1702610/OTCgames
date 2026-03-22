import React from 'react'
import { motion } from 'framer-motion'
import { shelves } from '../../data/products.js'
import { useBuilder } from '../BuilderContext.jsx'

// Group shelves by category label
const shelfGroups = shelves.reduce((acc, shelf) => {
  const key = shelf.label
  if (!acc[key]) acc[key] = []
  acc[key].push(shelf)
  return acc
}, {})

export function Step1_Setup() {
  const { state, dispatch } = useBuilder()
  const { moduleName, description, selectedShelfIds } = state
  const [nameError, setNameError] = React.useState(false)

  function handleNext() {
    if (!moduleName.trim()) { setNameError(true); return }
    if (selectedShelfIds.length === 0) return
    dispatch({ type: 'SET_STEP', step: 2 })
  }

  function handleBack() {
    dispatch({ type: 'SET_STEP', step: 0 })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8EFE0' }}>
      {/* Header */}
      <div style={{ background: '#140F50', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={handleBack}
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#FFFFFF', cursor: 'pointer', fontSize: 14 }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: 18, fontWeight: 700 }}>Module Setup</h2>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Step 1 of 4</span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        {/* Module name */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 700, color: '#140F50', marginBottom: 8, fontSize: 14 }}>
            Module Name <span style={{ color: '#E74C3C' }}>*</span>
          </label>
          <input
            type="text"
            value={moduleName}
            onChange={(e) => { dispatch({ type: 'SET_MODULE_NAME', value: e.target.value }); setNameError(false) }}
            placeholder="e.g. Cold & Flu Management"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 15,
              border: `2px solid ${nameError ? '#E74C3C' : 'rgba(20,15,80,0.15)'}`,
              borderRadius: 10,
              outline: 'none',
              background: '#FFFFFF',
              color: '#140F50',
              boxSizing: 'border-box',
            }}
          />
          {nameError && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#E74C3C' }}>Module name is required</p>}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontWeight: 700, color: '#140F50', marginBottom: 8, fontSize: 14 }}>
            Description <span style={{ color: 'rgba(20,15,80,0.4)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', value: e.target.value })}
            placeholder="Brief description of this module's learning objectives"
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 14,
              border: '2px solid rgba(20,15,80,0.15)',
              borderRadius: 10,
              outline: 'none',
              background: '#FFFFFF',
              color: '#140F50',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Shelf selection */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <label style={{ fontWeight: 700, color: '#140F50', fontSize: 14 }}>
              Select Shelves <span style={{ color: '#E74C3C' }}>*</span>
            </label>
            <span style={{ fontSize: 13, color: selectedShelfIds.length > 0 ? '#1448FF' : 'rgba(20,15,80,0.4)', fontWeight: 600 }}>
              {selectedShelfIds.length} selected
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(shelfGroups).map(([groupLabel, groupShelves]) => (
              <div key={groupLabel}>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: 'rgba(20,15,80,0.6)', fontWeight: 600 }}>
                  {groupShelves[0].emoji} {groupLabel}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {groupShelves.map((shelf) => {
                    const isSelected = selectedShelfIds.includes(shelf.id)
                    return (
                      <motion.button
                        key={shelf.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => dispatch({ type: 'TOGGLE_SHELF', shelfId: shelf.id })}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 20,
                          border: `2px solid ${isSelected ? shelf.color : 'rgba(20,15,80,0.15)'}`,
                          background: isSelected ? `${shelf.color}18` : '#FFFFFF',
                          color: isSelected ? shelf.color : 'rgba(20,15,80,0.6)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        {shelf.label}{shelf.shelfNumber > 1 ? ` ${shelf.shelfNumber}` : ''}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!moduleName.trim() || selectedShelfIds.length === 0}
          style={{
            width: '100%',
            padding: '14px',
            background: (!moduleName.trim() || selectedShelfIds.length === 0) ? 'rgba(20,15,80,0.15)' : '#1448FF',
            color: (!moduleName.trim() || selectedShelfIds.length === 0) ? 'rgba(20,15,80,0.4)' : '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            cursor: (!moduleName.trim() || selectedShelfIds.length === 0) ? 'not-allowed' : 'pointer',
          }}
        >
          Next: Question Authoring →
        </motion.button>
      </div>
    </div>
  )
}

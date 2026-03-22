import React from 'react'
import { motion } from 'framer-motion'
import { Upload, Plus, BookOpen } from 'lucide-react'
import { useBuilder } from '../BuilderContext.jsx'

export function Step0_Home() {
  const { state, dispatch, clearDraft, importFromFile } = useBuilder()
  const { draftExists, moduleName } = state
  const [importing, setImporting] = React.useState(false)
  const [error, setError] = React.useState(null)
  const fileInputRef = React.useRef(null)

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setError(null)
    try {
      await importFromFile(file)
      // importFromFile dispatches LOAD_FROM_IMPORT which sets step=2
    } catch (err) {
      setError(`Import failed: ${err.message}`)
    } finally {
      setImporting(false)
    }
  }

  function handleStartNew() {
    if (draftExists) {
      if (!window.confirm('Start a new module? Your current draft will be cleared.')) return
    }
    clearDraft()
    dispatch({ type: 'SET_STEP', step: 1 })
  }

  function handleResumeDraft() {
    dispatch({ type: 'SET_STEP', step: 1 })
  }

  const cardStyle = {
    background: '#FFFFFF',
    border: '2px solid rgba(20,15,80,0.12)',
    borderRadius: 16,
    padding: 24,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8EFE0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏗️</div>
        <h1 style={{ margin: 0, color: '#140F50', fontSize: 28, fontWeight: 800 }}>
          OTC Module Builder
        </h1>
      </motion.div>

      {/* Cards */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Resume Draft */}
        {draftExists && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={handleResumeDraft}
              onKeyDown={(e) => e.key === 'Enter' && handleResumeDraft()}
              style={{ ...cardStyle, borderColor: '#1448FF', background: 'rgba(20,72,255,0.04)' }}
            >
              <BookOpen size={28} color="#1448FF" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#140F50', fontSize: 16 }}>
                  Resume Draft
                </p>
                {moduleName && (
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(20,15,80,0.6)' }}>
                    {moduleName}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Import */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: draftExists ? 0.2 : 0.1 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".otcgame,.zip"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            style={cardStyle}
          >
            <Upload size={28} color="#836BFF" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#140F50', fontSize: 16 }}>
                {importing ? 'Importing…' : 'Import Existing Module'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(20,15,80,0.6)' }}>
                Open a .OTCgame file to continue editing
              </p>
            </div>
          </div>
        </motion.div>

        {/* Start New */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: draftExists ? 0.3 : 0.2 }}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={handleStartNew}
            onKeyDown={(e) => e.key === 'Enter' && handleStartNew()}
            style={cardStyle}
          >
            <Plus size={28} color="#27AE60" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#140F50', fontSize: 16 }}>
                Start New Module
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(20,15,80,0.6)' }}>
                {draftExists ? 'Clears current draft and starts fresh' : 'Build a new training module'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: 16, color: '#E74C3C', fontSize: 13, textAlign: 'center' }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

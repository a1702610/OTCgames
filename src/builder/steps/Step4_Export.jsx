import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Download, AlertTriangle } from 'lucide-react'
import { useBuilder } from '../BuilderContext.jsx'
import { shelves as allShelves, products as allProducts } from '../../data/products.js'

function buildContentJson(state) {
  const { moduleName, description, selectedShelfIds, scenarios, quizQuestions } = state
  const selectedShelves = allShelves.filter((s) => selectedShelfIds.includes(s.id))
  const selectedProducts = allProducts.filter((p) => selectedShelfIds.includes(p.category))
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    module: { name: moduleName, description, selectedShelfIds },
    shelves: selectedShelves,
    products: selectedProducts,
    scenarios,
    quizQuestions,
  }
}

function validateModule(state) {
  const errors = []
  const { scenarios, quizQuestions, orphanedProductIds, moduleName, selectedShelfIds } = state

  if (!moduleName.trim()) errors.push('Module name is required')
  if (selectedShelfIds.length === 0) errors.push('At least one shelf must be selected')
  if (orphanedProductIds.size > 0) errors.push(`${orphanedProductIds.size} question(s) reference removed products`)

  scenarios.forEach((s, i) => {
    const label = `Scenario ${i + 1}${s.patient?.name ? ` (${s.patient.name})` : ''}`
    if (!s.bestChoiceProductId) errors.push(`${label}: no best choice product selected`)
    if (!s.patient?.description?.trim()) errors.push(`${label}: patient description is empty`)
    if (!s.explanation?.trim()) errors.push(`${label}: explanation is empty`)
    if (s.followUpQuestion) {
      if (s.followUpQuestion.options?.some((o) => !o.trim())) errors.push(`${label}: follow-up MCQ has empty options`)
    }
  })

  quizQuestions.forEach((q, i) => {
    const label = `Quiz question ${i + 1} (${q.type})`
    if (q.type === 'mcq') {
      if (!q.question?.trim()) errors.push(`${label}: question text empty`)
      if (q.options?.some((o) => !o.trim())) errors.push(`${label}: has empty options`)
    } else if (q.type === 'truefalse') {
      if (!q.statement?.trim()) errors.push(`${label}: statement is empty`)
    } else if (q.type === 'dragdrop') {
      if (q.categories?.length < 2) errors.push(`${label}: needs at least 2 categories`)
      const nonDistractors = q.productAssignments?.filter((a) => a.categoryId !== null) || []
      if (nonDistractors.length === 0) errors.push(`${label}: no products assigned to categories`)
    }
    if (!q.explanation?.trim()) errors.push(`${label}: explanation is empty`)
  })

  return errors
}

export function Step4_Export() {
  const { state, dispatch } = useBuilder()
  const [exporting, setExporting] = React.useState(false)
  const [success, setSuccess] = React.useState(null) // { imagesIncluded, imagesNotFound }
  const [exportError, setExportError] = React.useState(null)

  const isFileProtocol = window.location.protocol === 'file:'
  const validationErrors = validateModule(state)
  const canExport = validationErrors.length === 0 && !isFileProtocol

  async function handleExport() {
    if (!canExport) return
    setExporting(true)
    setExportError(null)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // 1. Add content.json
      const contentJson = buildContentJson(state)
      zip.file('content.json', JSON.stringify(contentJson, null, 2))

      // 2. Fetch Player assets via Vite manifest
      const manifestResp = await fetch('/.vite/manifest.json')
      if (!manifestResp.ok) throw new Error('Could not load Vite manifest — run npm run build first, then npm run preview')
      const manifest = await manifestResp.json()

      // Find the player entry (index.html) in the manifest
      const playerEntry = manifest['index.html']
      if (!playerEntry) throw new Error('Player entry not found in manifest')

      // Recursively collect all JS/CSS assets from the manifest entry graph
      function collectAssets(manifest, key, visited = new Set()) {
        if (visited.has(key)) return []
        visited.add(key)
        const entry = manifest[key]
        if (!entry) return []
        const files = [entry.file, ...(entry.css || [])]
        for (const importKey of (entry.imports || [])) {
          files.push(...collectAssets(manifest, importKey, visited))
        }
        return files.filter(Boolean)
      }
      const assetPaths = collectAssets(manifest, 'index.html')

      // 3. Fetch index.html
      const indexResp = await fetch('/index.html')
      if (!indexResp.ok) throw new Error('Could not fetch index.html')
      zip.file('index.html', await indexResp.text())

      // 4. Fetch each asset
      const assetsFolder = zip.folder('assets')
      await Promise.all(
        assetPaths.map(async (assetPath) => {
          const resp = await fetch(`/${assetPath}`)
          if (!resp.ok) return
          const blob = await resp.blob()
          assetsFolder.file(assetPath.replace('assets/', ''), blob)
        })
      )

      // 5. Fetch product images
      const allProductIds = contentJson.products.map((p) => p.id)
      const sides = ['front', 'back', 'side']
      const imagesFolder = zip.folder('images')
      let imagesIncluded = 0
      let imagesNotFound = 0

      await Promise.all(
        allProductIds.flatMap((productId) =>
          sides.map(async (side) => {
            const path = `./images/${productId}_${side}.jpg`
            try {
              const resp = await fetch(path)
              if (resp.ok) {
                const blob = await resp.blob()
                imagesFolder.file(`${productId}_${side}.jpg`, blob)
                imagesIncluded++
              } else {
                imagesNotFound++
              }
            } catch {
              imagesNotFound++
            }
          })
        )
      )

      // 6. Generate and download
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${state.moduleName.replace(/[^a-z0-9]/gi, '_')}.OTCgame`
      a.click()
      URL.revokeObjectURL(url)

      setSuccess({ imagesIncluded, imagesNotFound })
    } catch (err) {
      setExportError(err.message)
    } finally {
      setExporting(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8EFE0', padding: 32 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: '#FFFFFF', borderRadius: 20, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <h2 style={{ color: '#140F50', margin: '8px 0' }}>Module Exported!</h2>
            <p style={{ color: '#555', fontSize: 14 }}>
              {success.imagesIncluded} product image{success.imagesIncluded !== 1 ? 's' : ''} included
              {success.imagesNotFound > 0 ? `, ${success.imagesNotFound} not found (will show placeholder)` : ''}
            </p>
          </div>

          <div style={{ background: '#F8EFE0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 12px', color: '#140F50', fontSize: 15 }}>Deployment Steps</h3>
            {[
              'Rename the .OTCgame file to .zip',
              'Unzip the file',
              'Drag the unzipped folder to Netlify (netlify.com/drop)',
              'Copy the Netlify URL',
              'Embed in Canvas LMS as an iframe using the URL',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ background: '#1448FF', color: '#FFFFFF', borderRadius: 12, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#140F50', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setSuccess(null)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: '2px solid rgba(20,15,80,0.2)', background: 'transparent', color: '#140F50', fontWeight: 600, cursor: 'pointer' }}
            >
              Export Again
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#140F50', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
            >
              ← Back to Authoring
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8EFE0' }}>
      {/* Header */}
      <div style={{ background: '#140F50', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#FFFFFF', cursor: 'pointer', fontSize: 14 }}
        >
          ← Preview
        </button>
        <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: 18, fontWeight: 700 }}>Export Module</h2>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
        {/* File protocol warning */}
        {isFileProtocol && (
          <div style={{ background: '#FADBD8', border: '1px solid #E74C3C', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ margin: 0, color: '#C0392B', fontWeight: 700, fontSize: 14 }}>⚠️ Cannot export from file:// protocol</p>
            <p style={{ margin: '6px 0 0', color: '#C0392B', fontSize: 13 }}>
              Run <code>npm run build</code> then <code>npm run preview</code> and open the Builder at <code>http://localhost:4174</code>
            </p>
          </div>
        )}

        {/* Validation checklist */}
        <div style={{ background: '#FFFFFF', borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', color: '#140F50', fontSize: 16 }}>
            {validationErrors.length === 0 ? '✅ Ready to Export' : `⚠️ ${validationErrors.length} issue${validationErrors.length > 1 ? 's' : ''} to fix`}
          </h3>
          {validationErrors.length > 0 && (
            <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
              {validationErrors.map((err, i) => (
                <li key={i} style={{ color: '#E74C3C', fontSize: 13, marginBottom: 6 }}>{err}</li>
              ))}
            </ul>
          )}
          {validationErrors.length === 0 && (
            <p style={{ margin: 0, color: '#27AE60', fontSize: 13 }}>
              All validation checks passed. Your module is ready to export.
            </p>
          )}
        </div>

        {/* Export button */}
        <motion.button
          whileHover={canExport && !exporting ? { scale: 1.02 } : {}}
          whileTap={canExport && !exporting ? { scale: 0.98 } : {}}
          onClick={handleExport}
          disabled={!canExport || exporting}
          style={{
            width: '100%',
            padding: '16px',
            background: canExport && !exporting ? '#1448FF' : 'rgba(20,15,80,0.15)',
            color: canExport && !exporting ? '#FFFFFF' : 'rgba(20,15,80,0.4)',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            cursor: canExport && !exporting ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Download size={18} />
          {exporting ? 'Building bundle…' : 'Export .OTCgame'}
        </motion.button>

        {exportError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: 12, color: '#E74C3C', fontSize: 13, textAlign: 'center' }}
          >
            {exportError}
          </motion.p>
        )}
      </div>
    </div>
  )
}

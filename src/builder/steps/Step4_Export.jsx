import React from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
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
  const isBrowseOnly = scenarios.length === 0 && quizQuestions.length === 0
  if (!isBrowseOnly && selectedShelfIds.length === 0) errors.push('At least one shelf must be selected')
  if (orphanedProductIds.size > 0) errors.push(`${orphanedProductIds.size} question(s) reference removed products`)

  scenarios.forEach((s, i) => {
    const label = `Scenario ${i + 1}${s.patient?.name ? ` (${s.patient.name})` : ''}`
    const hasBest = s.bestChoiceProductIds?.length > 0 || !!s.bestChoiceProductId
    if (!hasBest) errors.push(`${label}: no best choice product selected`)
    if (!s.patient?.description?.trim()) errors.push(`${label}: patient description is empty`)
    if (s.followUpQuestion) {
      const filledOpts = s.followUpQuestion.options?.filter((o) => o.trim()) || []
      if (filledOpts.length < 2) errors.push(`${label}: follow-up MCQ needs at least 2 options`)
    }
  })

  quizQuestions.forEach((q, i) => {
    const label = `Quiz question ${i + 1} (${q.type})`
    if (q.type === 'mcq') {
      if (!q.question?.trim()) errors.push(`${label}: question text empty`)
      const filledOpts = q.options?.filter((o) => o.trim()) || []
      if (filledOpts.length < 2) errors.push(`${label}: needs at least 2 filled options`)
    } else if (q.type === 'truefalse') {
      if (!q.statement?.trim()) errors.push(`${label}: statement is empty`)
    } else if (q.type === 'dragdrop') {
      if (q.categories?.length < 2) errors.push(`${label}: needs at least 2 categories`)
      const nonDistractors = q.productAssignments?.filter((a) => a.categoryId !== null) || []
      if (nonDistractors.length === 0) errors.push(`${label}: no products assigned to categories`)
    }
  })

  return errors
}

const IMAGE_CDN_BASE = import.meta.env.VITE_IMAGE_BASE_URL || null

const EXPORT_STEPS = [
  { id: 'build',    label: 'Building app…'                                    },
  { id: 'bundle',   label: 'Bundling module…'                                 },
  { id: 'images',   label: IMAGE_CDN_BASE ? 'Linking images…' : 'Packaging images…' },
  { id: 'download', label: 'Preparing download…'                              },
]

export function Step4_Export() {
  const { state, dispatch } = useBuilder()
  const [exportStep, setExportStep] = React.useState(null)
  const [success, setSuccess] = React.useState(null)
  const [exportError, setExportError] = React.useState(null)

  const isFileProtocol = window.location.protocol === 'file:'
  const validationErrors = validateModule(state)
  const canExport = validationErrors.length === 0 && !isFileProtocol
  const isExporting = exportStep !== null

  async function handleExport() {
    if (!canExport || isExporting) return
    setExportError(null)

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      setExportStep('build')
      if (import.meta.env.DEV) {
        const buildResp = await fetch('/api/build', { method: 'POST' })
        if (!buildResp.ok) {
          const data = await buildResp.json().catch(() => ({}))
          throw new Error(`Build failed: ${data.error || buildResp.status}`)
        }
      }

      setExportStep('bundle')
      const contentJson = buildContentJson(state)
      zip.file('content.json', JSON.stringify(contentJson, null, 2))

      let manifest
      try {
        const manifestResp = await fetch(import.meta.env.BASE_URL + 'vite-manifest.json')
        if (!manifestResp.ok) throw new Error(`HTTP ${manifestResp.status}`)
        manifest = await manifestResp.json()
      } catch {
        throw new Error('Could not load Vite manifest after build — please try again.')
      }

      const playerEntry = manifest['index.html']
      if (!playerEntry) throw new Error('Player entry not found in manifest')

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

      const indexUrl = import.meta.env.DEV ? '/dist-index.html' : (import.meta.env.BASE_URL + 'index.html')
      const indexResp = await fetch(indexUrl)
      if (!indexResp.ok) throw new Error('Could not fetch built index.html')
      let indexHtml = await indexResp.text()
      // Rewrite absolute base-prefixed paths → relative so the zip works on any host.
      // e.g. src="/OTCgames/assets/foo.js" → src="assets/foo.js"
      const base = import.meta.env.BASE_URL
      if (base && base !== '/') {
        indexHtml = indexHtml.split(`="${base}`).join(`="`)
      }
      zip.file('index.html', indexHtml)

      const assetsFolder = zip.folder('assets')
      await Promise.all(
        assetPaths.map(async (assetPath) => {
          const resp = await fetch(import.meta.env.BASE_URL + assetPath)
          if (!resp.ok) return
          assetsFolder.file(assetPath.replace('assets/', ''), await resp.blob())
        })
      )

      setExportStep('images')
      let imagesIncluded = 0
      let imagesNotFound = 0

      if (IMAGE_CDN_BASE) {
        // CDN mode: store the image base URL in content.json — no bundling needed.
        // Keeps the zip tiny (~3 MB) regardless of how many shelves are selected.
        contentJson.imageBaseUrl = IMAGE_CDN_BASE
        imagesIncluded = contentJson.products.filter((p) => p.imageFolderPath).length
        zip.file('content.json', JSON.stringify(contentJson, null, 2))
      } else {
        // Local dev mode: bundle images into the zip directly.
        await Promise.all(
          contentJson.products.flatMap((product) => {
            if (!product.imageFolderPath) return []
            const sidesToFetch = product.sides?.length > 0 ? product.sides : ['front', 'back', 'side']
            return sidesToFetch.map(async (side) => {
              const encoded = product.imageFolderPath.split('/').map(encodeURIComponent).join('/')
              try {
                const resp = await fetch(`./${encoded}/${side}.jpg`)
                if (resp.ok) {
                  zip.file(`${product.imageFolderPath}/${side}.jpg`, await resp.blob())
                  imagesIncluded++
                } else {
                  imagesNotFound++
                }
              } catch {
                imagesNotFound++
              }
            })
          })
        )
      }

      setExportStep('download')
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${state.moduleName.replace(/[^a-z0-9]/gi, '_')}.zip`
      a.click()
      URL.revokeObjectURL(url)

      setSuccess({ imagesIncluded, imagesNotFound })
    } catch (err) {
      setExportError(err.message)
    } finally {
      setExportStep(null)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'transparent', padding: 32 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <h2 style={{ color: '#140F50', margin: '8px 0' }}>Module Exported!</h2>
            <p style={{ color: 'rgba(20,15,80,0.60)', fontSize: 14 }}>
              {IMAGE_CDN_BASE
                ? `${success.imagesIncluded} product image${success.imagesIncluded !== 1 ? 's' : ''} linked via CDN`
                : `${success.imagesIncluded} product image${success.imagesIncluded !== 1 ? 's' : ''} included${success.imagesNotFound > 0 ? `, ${success.imagesNotFound} not found` : ''}`
              }
            </p>
          </div>

          <div style={{ background: 'rgba(20,15,80,0.60)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 12px', color: 'rgba(255,255,255,0.90)', fontSize: 15 }}>Deployment Steps</h3>
            {[
              'Unzip the downloaded .zip file',
              'Drag the unzipped folder to Netlify (netlify.com/drop)',
              'Copy the Netlify URL',
              'Embed in Canvas LMS as an iframe using the URL',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ background: '#1448FF', color: '#FFFFFF', borderRadius: 12, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setSuccess(null)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(20,15,80,0.80)', color: 'rgba(255,255,255,0.80)', fontWeight: 600, cursor: 'pointer' }}
            >
              Export Again
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#1448FF', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
            >
              ← Back to Authoring
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <div style={{
        background: 'rgba(20,15,80,0.96)',
        borderBottom: '1px solid rgba(131,107,255,0.15)',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16,
        backdropFilter: 'blur(20px)',
      }}>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
          style={{ background: 'rgba(131,107,255,0.22)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 14 }}
        >
          ← Preview
        </button>
        <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: 18, fontWeight: 700 }}>Export Module</h2>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
        {isFileProtocol && (
          <div style={{ background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.30)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ margin: 0, color: '#f87171', fontWeight: 700, fontSize: 14 }}>⚠️ Cannot export from a file opened directly</p>
            <p style={{ margin: '6px 0 0', color: '#f87171', fontSize: 13 }}>
              Open the Builder via <code style={{ background: 'rgba(131,107,255,0.22)', padding: '1px 5px', borderRadius: 4 }}>start.bat</code> instead of opening the file directly.
            </p>
          </div>
        )}

        {/* Validation checklist */}
        <div style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 24, backdropFilter: 'blur(20px)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#140F50', fontSize: 16 }}>
            {validationErrors.length === 0 ? '✅ Ready to Export' : `⚠️ ${validationErrors.length} issue${validationErrors.length > 1 ? 's' : ''} to fix`}
          </h3>
          {validationErrors.length > 0 && (
            <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
              {validationErrors.map((err, i) => (
                <li key={i} style={{ color: '#f87171', fontSize: 13, marginBottom: 6 }}>{err}</li>
              ))}
            </ul>
          )}
          {validationErrors.length === 0 && (
            <p style={{ margin: 0, color: '#5dda8a', fontSize: 13 }}>All checks passed. Ready to export.</p>
          )}
        </div>

        {/* Progress steps */}
        {isExporting && (
          <div style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, marginBottom: 24, backdropFilter: 'blur(20px)' }}>
            {EXPORT_STEPS.map((step, i) => {
              const stepIds = EXPORT_STEPS.map((s) => s.id)
              const currentIdx = stepIds.indexOf(exportStep)
              const thisIdx = i
              const done = thisIdx < currentIdx
              const active = thisIdx === currentIdx
              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < EXPORT_STEPS.length - 1 ? 12 : 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: done ? '#27AE60' : active ? '#1448FF' : 'rgba(20,15,80,0.80)',
                    border: `1px solid ${done ? '#27AE60' : active ? '#1448FF' : 'rgba(20,15,80,0.14)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: done || active ? '#FFFFFF' : 'rgba(20,15,80,0.22)',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 14, color: active ? '#140F50' : done ? '#5dda8a' : 'rgba(20,15,80,0.28)', fontWeight: active ? 700 : 400 }}>
                    {step.label}
                    {active && <span style={{ marginLeft: 8, display: 'inline-block', animation: 'pulse 1s infinite' }}>…</span>}
                  </span>
                </div>
              )
            })}
            {exportStep === 'build' && (
              <p style={{ margin: '14px 0 0', fontSize: 12, color: 'rgba(20,15,80,0.35)' }}>
                First export takes ~15 seconds to build. Subsequent exports are faster.
              </p>
            )}
          </div>
        )}

        {/* Export button */}
        <motion.button
          whileHover={canExport && !isExporting ? { scale: 1.02 } : {}}
          whileTap={canExport && !isExporting ? { scale: 0.98 } : {}}
          onClick={handleExport}
          disabled={!canExport || isExporting}
          style={{
            width: '100%', padding: '16px',
            background: canExport && !isExporting ? '#1448FF' : 'rgba(20,72,255,0.20)',
            color: canExport && !isExporting ? '#FFFFFF' : 'rgba(255,255,255,0.28)',
            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16,
            cursor: canExport && !isExporting ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Download size={18} />
          {isExporting ? 'Exporting…' : 'Export .OTCgame'}
        </motion.button>

        {exportError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: 12, color: '#f87171', fontSize: 13, textAlign: 'center' }}
          >
            ⚠️ {exportError}
          </motion.p>
        )}
      </div>
    </div>
  )
}

/**
 * sync-library.mjs
 *
 * Reads public/medications/ and regenerates src/data/products.js.
 * That's it. No source folder. No copying. No deleting.
 *
 * Usage:
 *   npm run sync          ← just run this after editing public/medications/
 *   node scripts/sync-library.mjs --dry-run   ← preview without writing
 *
 * Folder structures supported:
 *   {Category}/{Row N}/{Product}/        ← single-shelf category with rows
 *   {Category}/{Shelf}/{Row N}/{Product}/← multi-shelf category with rows
 *   {Category}/{Shelf}/{Product}/        ← no rows
 *   {Category}/{Product}/               ← flat
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT      = path.resolve(__dirname, '..')
const MEDS_DIR  = path.join(ROOT, 'public', 'medications')
const OUT_DATA  = path.join(ROOT, 'src', 'data', 'products.js')

// ── Shelf/category metadata ──────────────────────────────────────────────────
const CATEGORY_META = {
  'Cold and Flu':      { emoji: '🤧', color: '#4A90D9' },
  'ENT':               { emoji: '👂', color: '#9B59B6' },
  'Eyes':              { emoji: '👁️',  color: '#1ABC9C' },
  'Gastrointestinal':  { emoji: '🧴', color: '#E67E22' },
  'Hayfever':          { emoji: '🌿', color: '#27AE60' },
  'Pain Management':   { emoji: '💊', color: '#E74C3C' },
  'S3 shelves':        { emoji: '🔒', color: '#2C3E50' },
  'Skin':              { emoji: '🧴', color: '#F39C12' },
  'Smoking Cessation': { emoji: '🚭', color: '#8E44AD' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toKebab(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Strip leading sort prefix (e.g. "1 " or "02 ") — controls order without
// polluting the display name. e.g. "1 Nurofen" → "Nurofen"
function stripOrderPrefix(name) {
  return name.replace(/^\d+\s+/, '')
}

function listDirs(p) {
  if (!fs.existsSync(p)) return []
  return fs.readdirSync(p, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
}

function hasImages(p) {
  if (!fs.existsSync(p)) return false
  return fs.readdirSync(p).some(f => /\.(jpg|jpeg|png)$/i.test(f))
}

// Detect which sides exist for a product (files are already named front.jpg etc.)
function detectSides(prodPath) {
  if (!fs.existsSync(prodPath)) return []
  const files = fs.readdirSync(prodPath).filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  const sides = []
  for (const s of ['front', 'back', 'side']) {
    if (files.some(f => f.toLowerCase() === `${s}.jpg`)) sides.push(s)
  }
  const viewFiles = files
    .filter(f => /^view_\d+\.(jpg|jpeg|png)$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0])
      const nb = parseInt(b.match(/\d+/)[0])
      return na - nb
    })
  viewFiles.forEach(f => sides.push(f.replace(/\.[^.]+$/, '')))
  return sides
}

function parseRowNumber(name) {
  let m = name.match(/^row\s*(\d+)$/i)
  if (m) return parseInt(m[1], 10)
  m = name.match(/^(\d+)(?:st|nd|rd|th)\s*row$/i)
  if (m) return parseInt(m[1], 10)
  return null
}

function isRowFolder(name) { return parseRowNumber(name) !== null }

function sortedByRowNumber(names) {
  return [...names].sort((a, b) => {
    const ra = parseRowNumber(a)
    const rb = parseRowNumber(b)
    if (ra !== null && rb !== null) return ra - rb
    return a.localeCompare(b)
  })
}

// ── Product builder ──────────────────────────────────────────────────────────

function addProduct({ prodName, prodPath, shelfId, relFolderBase, row, meta, seenIds, productsArray }) {
  const sides = detectSides(prodPath)
  if (sides.length === 0) {
    console.warn(`  [warn] No images in: ${relFolderBase}/${prodName}`)
    return
  }

  const displayName = stripOrderPrefix(prodName)
  const baseId = toKebab(displayName)
  let id = baseId
  if (seenIds.has(id)) id = `${baseId}-${shelfId}`
  if (seenIds.has(id)) id = `${baseId}-${shelfId}-r${row ?? 0}`
  seenIds.add(id)

  productsArray.push({
    id,
    name:            displayName,
    brand:           '',
    category:        shelfId,
    imageFolderPath: `medications/${relFolderBase}/${prodName}`,
    sides,
    row:             row ?? null,
    bgColor:         meta.color,
    color:           '#FFFFFF',
  })
}

// ── Main ─────────────────────────────────────────────────────────────────────

function run() {
  const dryRun = process.argv.includes('--dry-run')

  if (!fs.existsSync(MEDS_DIR)) {
    console.error(`public/medications not found: ${MEDS_DIR}`)
    process.exit(1)
  }

  console.log(`Reading : ${MEDS_DIR}`)
  if (dryRun) console.log('DRY RUN — products.js will not be written\n')

  const shelvesArray  = []
  const productsArray = []
  const seenIds       = new Set()

  for (const catName of listDirs(MEDS_DIR).sort()) {
    const catPath = path.join(MEDS_DIR, catName)
    const meta    = CATEGORY_META[catName] || { emoji: '💊', color: '#95A5A6' }
    const catId   = toKebab(catName)

    const firstLevel = listDirs(catPath)
    if (firstLevel.length === 0) continue

    const firstLevelRowCount = firstLevel.filter(d => isRowFolder(d)).length
    const firstLevelAreRows  = firstLevelRowCount > 0 && firstLevelRowCount >= firstLevel.length * 0.7

    if (firstLevelAreRows) {
      // Category → Row → Product
      const shelfId = catId
      shelvesArray.push({ id: shelfId, categoryId: catId, label: catName, shelfName: catName, shelfNumber: 1, emoji: meta.emoji, color: meta.color })
      console.log(`  [shelf] ${catName}`)

      for (const rowName of sortedByRowNumber(firstLevel.filter(isRowFolder))) {
        const rowPath = path.join(catPath, rowName)
        for (const prodName of listDirs(rowPath).sort()) {
          addProduct({ prodName, prodPath: path.join(rowPath, prodName), shelfId, relFolderBase: `${catName}/${rowName}`, row: parseRowNumber(rowName), meta, seenIds, productsArray })
        }
      }

    } else {
      const firstShelfPath  = path.join(catPath, firstLevel[0])
      const secondLevel     = listDirs(firstShelfPath)
      const anyShelfHasRows = firstLevel.some(s => listDirs(path.join(catPath, s)).some(isRowFolder))
      const secondLevelAreRows = anyShelfHasRows || secondLevel.filter(isRowFolder).length >= secondLevel.length * 0.7
      const firstLevelHasImages = firstLevel.some(d => hasImages(path.join(catPath, d)))

      if (firstLevelHasImages) {
        // Flat: Category → Product
        const shelfId = catId
        shelvesArray.push({ id: shelfId, categoryId: catId, label: catName, shelfName: catName, shelfNumber: 1, emoji: meta.emoji, color: meta.color })
        console.log(`  [shelf] ${catName} (flat)`)
        for (const prodName of firstLevel.sort()) {
          if (!hasImages(path.join(catPath, prodName))) continue
          addProduct({ prodName, prodPath: path.join(catPath, prodName), shelfId, relFolderBase: catName, row: null, meta, seenIds, productsArray })
        }

      } else {
        // Category → Shelf → (Row →) Product
        const shelfFolders = firstLevel.sort()
        for (let si = 0; si < shelfFolders.length; si++) {
          const shelfName = shelfFolders[si]
          const shelfPath = path.join(catPath, shelfName)
          const shelfId   = toKebab(shelfName)

          shelvesArray.push({ id: shelfId, categoryId: catId, label: catName, shelfName, shelfNumber: si + 1, emoji: meta.emoji, color: meta.color })

          const rowDirs    = listDirs(shelfPath).filter(isRowFolder)
          const nonRowDirs = listDirs(shelfPath).filter(d => !isRowFolder(d))

          if (rowDirs.length > 0) {
            console.log(`  [shelf] ${catName} / ${shelfName}`)
            for (const rowName of sortedByRowNumber(rowDirs)) {
              const rowPath = path.join(shelfPath, rowName)
              for (const prodName of listDirs(rowPath).sort()) {
                addProduct({ prodName, prodPath: path.join(rowPath, prodName), shelfId, relFolderBase: `${catName}/${shelfName}/${rowName}`, row: parseRowNumber(rowName), meta, seenIds, productsArray })
              }
            }
            for (const prodName of nonRowDirs) {
              if (!hasImages(path.join(shelfPath, prodName))) continue
              addProduct({ prodName, prodPath: path.join(shelfPath, prodName), shelfId, relFolderBase: `${catName}/${shelfName}`, row: null, meta, seenIds, productsArray })
            }
          } else {
            console.log(`  [shelf] ${catName} / ${shelfName} (no rows)`)
            for (const prodName of listDirs(shelfPath).sort()) {
              if (!hasImages(path.join(shelfPath, prodName))) continue
              addProduct({ prodName, prodPath: path.join(shelfPath, prodName), shelfId, relFolderBase: `${catName}/${shelfName}`, row: null, meta, seenIds, productsArray })
            }
          }
        }
      }
    }
  }

  const js = `// AUTO-GENERATED by scripts/sync-library.mjs — do not edit by hand.
// Run: npm run sync  to regenerate after editing public/medications/.

export const shelves = ${JSON.stringify(shelvesArray, null, 2)}

export const products = ${JSON.stringify(productsArray, null, 2)}

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getShelfById(id) {
  return shelves.find((s) => s.id === id)
}

export function getProductsByShelf(shelfId) {
  return products.filter((p) => p.category === shelfId)
}

export function getProductById(id) {
  return products.find((p) => p.id === id)
}

export function getAllProductIds() {
  return new Set(products.map((p) => p.id))
}
`

  if (dryRun) {
    console.log('\n[dry-run] Would write products.js')
  } else {
    fs.writeFileSync(OUT_DATA, js, 'utf8')
  }

  console.log(`\n✓ ${productsArray.length} products across ${shelvesArray.length} shelves`)
  console.log(dryRun ? '(dry-run — products.js not written)' : `✓ products.js written to ${OUT_DATA}`)
}

run()

/**
 * sync-library.mjs
 *
 * Syncs medication images from a source folder into public/medications/,
 * then regenerates src/data/products.js.
 *
 * Usage:
 *   node scripts/sync-library.mjs                        # uses DEFAULT_SOURCE
 *   node scripts/sync-library.mjs "A:/Medication Images" # custom source
 *   node scripts/sync-library.mjs --dry-run              # preview only, no file writes
 *
 * Source folder structures supported:
 *
 *   {Category}/{Row N}/{Product}/{images}          ← single-shelf category with rows
 *   {Category}/{Shelf}/{Row N}/{Product}/{images}  ← multi-shelf category with rows
 *   {Category}/{Shelf}/{Product}/{images}          ← legacy (no rows) — still works
 *   {Category}/{Product}/{images}                  ← legacy flat — still works
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT       = path.resolve(__dirname, '..')
const OUT_IMAGES = path.join(ROOT, 'public', 'medications')
const OUT_DATA   = path.join(ROOT, 'src', 'data', 'products.js')

const DEFAULT_SOURCE = 'A:/Medication Images'

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

function listDirs(p) {
  if (!fs.existsSync(p)) return []
  return fs.readdirSync(p, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
}

function listImages(p) {
  if (!fs.existsSync(p)) return []
  return fs.readdirSync(p).filter(f => /\.(jpg|jpeg|png)$/i.test(f))
}

/** Parse a row folder name to its integer row number, or null if not a row folder.
 *  Handles: "Row 1", "Row 2", "1st Row", "2nd row", "3rd Row", "4th row" etc.
 */
function parseRowNumber(name) {
  let m = name.match(/^row\s*(\d+)$/i)
  if (m) return parseInt(m[1], 10)
  m = name.match(/^(\d+)(?:st|nd|rd|th)\s*row$/i)
  if (m) return parseInt(m[1], 10)
  return null
}

function isRowFolder(name) {
  return parseRowNumber(name) !== null
}

function sortedByRowNumber(names) {
  return [...names].sort((a, b) => {
    const ra = parseRowNumber(a)
    const rb = parseRowNumber(b)
    if (ra !== null && rb !== null) return ra - rb
    return a.localeCompare(b)
  })
}

/** Decide which file maps to front/back/side/view_N.
 *  Classified files (containing FRONT/BACK/SIDE) get named accordingly.
 *  All remaining plain files are numbered view_1, view_2, … so none are lost.
 */
function classifyImages(imageFiles) {
  const map = {}
  const plains = []
  for (const f of imageFiles) {
    const upper = f.toUpperCase()
    if (upper.includes(' FRONT')) { map.front = f; continue }
    if (upper.includes(' BACK'))  { map.back  = f; continue }
    if (upper.includes(' SIDE'))  { map.side  = f; continue }
    plains.push(f)
  }
  // Promote first plain → front if no explicit front exists
  if (plains.length > 0 && !map.front) {
    map.front = plains.shift()
  }
  // Remaining plains become view_1, view_2, …
  plains.forEach((f, i) => { map[`view_${i + 1}`] = f })
  return map // { front?, back?, side?, view_1?, view_2?, … }
}

/** Copy file only if source is newer or dest doesn't exist */
function syncFile(src, dest, dryRun) {
  if (dryRun) {
    console.log(`  [copy] ${path.relative(ROOT, dest)}`)
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  if (fs.existsSync(dest)) {
    const srcMtime  = fs.statSync(src).mtimeMs
    const destMtime = fs.statSync(dest).mtimeMs
    if (srcMtime <= destMtime) return
  }
  fs.copyFileSync(src, dest)
}

// ── Product builder ──────────────────────────────────────────────────────────

function processProduct({ prodName, prodPath, shelfId, relFolderBase, row, meta, seenIds, productsArray, dryRun }) {
  const images = listImages(prodPath)
  if (images.length === 0) {
    console.warn(`  [warn] No images in: ${relFolderBase}/${prodName}`)
    return 0
  }

  const baseId = toKebab(prodName)
  let id = baseId
  if (seenIds.has(id)) id = `${baseId}-${shelfId}`
  if (seenIds.has(id)) id = `${baseId}-${shelfId}-r${row ?? 0}`
  seenIds.add(id)

  const relFolder = `medications/${relFolderBase}/${prodName}`
  const destDir   = path.join(OUT_IMAGES, relFolderBase, prodName)

  const classified = classifyImages(images)
  for (const [side, filename] of Object.entries(classified)) {
    syncFile(path.join(prodPath, filename), path.join(destDir, `${side}.jpg`), dryRun)
  }

  productsArray.push({
    id,
    name:            prodName,
    brand:           '',
    category:        shelfId,
    imageFolderPath: relFolder,
    sides:           Object.keys(classified),
    row:             row ?? null,
    bgColor:         meta.color,
    color:           '#FFFFFF',
  })
  return Object.keys(classified).length
}

// ── Main ─────────────────────────────────────────────────────────────────────

function run() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const sourcePath = args.find(a => !a.startsWith('--')) || DEFAULT_SOURCE

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source path not found: ${sourcePath}`)
    process.exit(1)
  }

  console.log(`Source : ${sourcePath}`)
  console.log(`Output : ${OUT_IMAGES}`)
  if (dryRun) console.log('DRY RUN — no files will be written\n')

  const shelvesArray  = []
  const productsArray = []
  const seenIds       = new Set()
  let copiedCount     = 0
  let productCount    = 0

  const categories = listDirs(sourcePath).sort()

  for (const catName of categories) {
    const catPath = path.join(sourcePath, catName)
    const meta    = CATEGORY_META[catName] || { emoji: '💊', color: '#95A5A6' }
    const catId   = toKebab(catName)

    const firstLevel = listDirs(catPath)
    if (firstLevel.length === 0) continue

    // ── Detect structure ────────────────────────────────────────────────────
    // Are the first-level dirs rows? → Cat → Row → Product (single shelf)
    const firstLevelRowCount = firstLevel.filter(d => isRowFolder(d)).length
    const firstLevelAreRows  = firstLevelRowCount > 0 && firstLevelRowCount >= firstLevel.length * 0.7

    if (firstLevelAreRows) {
      // ── Structure: Category → Row → Product ─────────────────────────────
      // The whole category is one shelf
      const shelfId = catId
      shelvesArray.push({
        id:          shelfId,
        categoryId:  catId,
        label:       catName,
        shelfName:   catName,
        shelfNumber: 1,
        emoji:       meta.emoji,
        color:       meta.color,
      })
      console.log(`  [shelf] ${catName}`)

      for (const rowName of sortedByRowNumber(firstLevel.filter(d => isRowFolder(d)))) {
        const rowNumber = parseRowNumber(rowName)
        const rowPath   = path.join(catPath, rowName)
        const prodNames = listDirs(rowPath).sort()

        for (const prodName of prodNames) {
          const prodPath    = path.join(rowPath, prodName)
          const relFolderBase = `${catName}/${rowName}`
          copiedCount += processProduct({ prodName, prodPath, shelfId, relFolderBase, row: rowNumber, meta, seenIds, productsArray, dryRun })
          productCount++
        }
      }

    } else {
      // firstLevel = shelf folders (or product folders in legacy case)
      // Check what's inside the first shelf-level dir
      const firstShelfPath   = path.join(catPath, firstLevel[0])
      const secondLevelDirs  = listDirs(firstShelfPath)

      // Are the second-level dirs rows? → Cat → Shelf → Row → Product
      const secondLevelRowCount = secondLevelDirs.filter(d => isRowFolder(d)).length
      const secondLevelAreRows  = secondLevelRowCount > 0 && secondLevelRowCount >= secondLevelDirs.length * 0.7

      // Does the second level have any images? → Cat → Shelf → Product (legacy)
      const secondLevelHasImages = secondLevelDirs.some(d =>
        listImages(path.join(firstShelfPath, d)).length > 0
      )

      // Does the first level have images directly? → Cat → Product (flat legacy)
      const firstLevelHasImages = firstLevel.some(d =>
        listImages(path.join(catPath, d)).length > 0
      )

      if (firstLevelHasImages) {
        // ── Legacy flat: Category → Product ─────────────────────────────
        const shelfId = catId
        shelvesArray.push({
          id: shelfId, categoryId: catId, label: catName,
          shelfName: catName, shelfNumber: 1, emoji: meta.emoji, color: meta.color,
        })
        console.log(`  [shelf] ${catName} (flat)`)
        for (const prodName of firstLevel.sort()) {
          const prodPath = path.join(catPath, prodName)
          if (listImages(prodPath).length === 0) continue
          copiedCount += processProduct({ prodName, prodPath, shelfId, relFolderBase: catName, row: null, meta, seenIds, productsArray, dryRun })
          productCount++
        }

      } else if (secondLevelAreRows || (!secondLevelHasImages && secondLevelDirs.length > 0)) {
        // ── Structure: Category → Shelf → Row → Product ─────────────────
        const shelfFolders = firstLevel.sort()
        for (let si = 0; si < shelfFolders.length; si++) {
          const shelfName   = shelfFolders[si]
          const shelfPath   = path.join(catPath, shelfName)
          const shelfId     = toKebab(shelfName)
          const shelfNumber = si + 1

          shelvesArray.push({
            id: shelfId, categoryId: catId, label: catName,
            shelfName, shelfNumber, emoji: meta.emoji, color: meta.color,
          })
          console.log(`  [shelf] ${catName} / ${shelfName}`)

          const rowDirs = listDirs(shelfPath).filter(d => isRowFolder(d))
          const nonRowDirs = listDirs(shelfPath).filter(d => !isRowFolder(d))

          if (rowDirs.length > 0) {
            // Has row folders
            for (const rowName of sortedByRowNumber(rowDirs)) {
              const rowNumber = parseRowNumber(rowName)
              const rowPath   = path.join(shelfPath, rowName)
              for (const prodName of listDirs(rowPath).sort()) {
                const prodPath      = path.join(rowPath, prodName)
                const relFolderBase = `${catName}/${shelfName}/${rowName}`
                copiedCount += processProduct({ prodName, prodPath, shelfId, relFolderBase, row: rowNumber, meta, seenIds, productsArray, dryRun })
                productCount++
              }
            }
          }
          // Also handle any non-row product dirs directly in the shelf (mixed/legacy)
          for (const prodName of nonRowDirs) {
            const prodPath = path.join(shelfPath, prodName)
            if (listImages(prodPath).length === 0) continue
            const relFolderBase = `${catName}/${shelfName}`
            copiedCount += processProduct({ prodName, prodPath, shelfId, relFolderBase, row: null, meta, seenIds, productsArray, dryRun })
            productCount++
          }
        }

      } else {
        // ── Legacy: Category → Shelf → Product ──────────────────────────
        const shelfFolders = firstLevel.sort()
        for (let si = 0; si < shelfFolders.length; si++) {
          const shelfName   = shelfFolders[si]
          const shelfPath   = path.join(catPath, shelfName)
          const shelfId     = toKebab(shelfName)
          const shelfNumber = si + 1

          shelvesArray.push({
            id: shelfId, categoryId: catId, label: catName,
            shelfName, shelfNumber, emoji: meta.emoji, color: meta.color,
          })
          console.log(`  [shelf] ${catName} / ${shelfName} (no rows)`)

          for (const prodName of listDirs(shelfPath).sort()) {
            const prodPath = path.join(shelfPath, prodName)
            if (listImages(prodPath).length === 0) continue
            const relFolderBase = `${catName}/${shelfName}`
            copiedCount += processProduct({ prodName, prodPath, shelfId, relFolderBase, row: null, meta, seenIds, productsArray, dryRun })
            productCount++
          }
        }
      }
    }
  }

  // ── Write products.js ──────────────────────────────────────────────────────
  const js = `// AUTO-GENERATED by scripts/sync-library.mjs — do not edit by hand.
// Run: node scripts/sync-library.mjs  to regenerate.

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

  console.log(`\n✓ ${productCount} products across ${shelvesArray.length} shelves`)
  console.log(`✓ ${copiedCount} image files synced`)
  if (!dryRun) console.log(`✓ products.js written to ${OUT_DATA}`)
}

run()

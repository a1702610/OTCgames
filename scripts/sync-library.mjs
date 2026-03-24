/**
 * sync-library.mjs
 *
 * Syncs medication images from a source folder into public/medications/,
 * then regenerates src/data/products.js.
 *
 * Usage:
 *   node scripts/sync-library.mjs                        # uses DEFAULT_SOURCE
 *   node scripts/sync-library.mjs "C:/My/Medications"    # custom source
 *   node scripts/sync-library.mjs --dry-run              # preview only, no file writes
 *
 * Source folder structure expected:
 *   {Category}/
 *     {Product}/          ← category has no sub-shelves
 *       {Name} FRONT.JPG
 *       {Name} BACK.JPG
 *       {Name} SIDE.JPG   (optional)
 *       {Name}.jpg        (optional extra)
 *   {Category}/
 *     {Shelf}/            ← category has sub-shelves
 *       {Product}/
 *         {Name} FRONT.JPG ...
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT       = path.resolve(__dirname, '..')
const OUT_IMAGES = path.join(ROOT, 'public', 'medications')
const OUT_DATA   = path.join(ROOT, 'src', 'data', 'products.js')

const DEFAULT_SOURCE = 'A:/Medications'

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

/** Decide which file maps to front/back/side */
function classifyImages(imageFiles) {
  const map = {}
  let plain = null
  for (const f of imageFiles) {
    const upper = f.toUpperCase()
    if (upper.includes(' FRONT')) { map.front = f; continue }
    if (upper.includes(' BACK'))  { map.back  = f; continue }
    if (upper.includes(' SIDE'))  { map.side  = f; continue }
    // Plain file (no keyword) — save for fallback
    if (!plain) plain = f
  }
  // Use plain as front fallback first, then side fallback
  if (plain) {
    if (!map.front) map.front = plain
    else if (!map.side) map.side = plain
  }
  return map // { front?, back?, side? }
}

/** Copy file only if source is newer or dest doesn't exist */
function syncFile(src, dest, dryRun) {
  if (dryRun) {
    console.log(`  [copy] ${path.relative(ROOT, dest)}`)
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  // Only overwrite if src is newer
  if (fs.existsSync(dest)) {
    const srcMtime  = fs.statSync(src).mtimeMs
    const destMtime = fs.statSync(dest).mtimeMs
    if (srcMtime <= destMtime) return
  }
  fs.copyFileSync(src, dest)
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

  const shelvesArray   = []
  const productsArray  = []
  const seenIds        = new Set()
  let   copiedCount    = 0
  let   productCount   = 0

  const categories = listDirs(sourcePath).sort()

  for (const catName of categories) {
    const catPath = path.join(sourcePath, catName)
    const meta    = CATEGORY_META[catName] || { emoji: '💊', color: '#95A5A6' }
    const catId   = toKebab(catName)

    // Determine if this category has sub-shelves by checking if first-level
    // subdirs themselves contain subdirectories (products) with images.
    const firstLevel = listDirs(catPath)
    if (firstLevel.length === 0) continue

    const firstLevelPath  = path.join(catPath, firstLevel[0])
    const secondLevelDirs = listDirs(firstLevelPath)
    const hasSubShelves   = secondLevelDirs.length > 0 &&
      secondLevelDirs.some(d => listImages(path.join(firstLevelPath, d)).length > 0 ||
                                listDirs(path.join(firstLevelPath, d)).length > 0)

    if (hasSubShelves) {
      // Category → Shelf → Product
      const shelfFolders = firstLevel.sort()
      for (let si = 0; si < shelfFolders.length; si++) {
        const shelfName   = shelfFolders[si]
        const shelfPath   = path.join(catPath, shelfName)
        const shelfId     = toKebab(shelfName)
        const shelfNumber = si + 1

        shelvesArray.push({
          id:          shelfId,
          categoryId:  catId,
          label:       catName,
          shelfName:   shelfName,
          shelfNumber,
          emoji:       meta.emoji,
          color:       meta.color,
        })

        for (const prodName of listDirs(shelfPath).sort()) {
          const prodPath  = path.join(shelfPath, prodName)
          const images    = listImages(prodPath)
          if (images.length === 0) {
            console.warn(`  [warn] No images in: ${catName}/${shelfName}/${prodName}`)
            continue
          }

          const baseId = toKebab(prodName)
          let   id     = seenIds.has(baseId) ? `${baseId}-${shelfId}` : baseId
          // Last resort if still collides
          if (seenIds.has(id)) id = `${baseId}-${shelfId}-${si}`
          seenIds.add(id)

          // imageFolderPath relative to public/ — keep spaces (app encodes at runtime)
          const relFolder = `medications/${catName}/${shelfName}/${prodName}`
          const destDir   = path.join(OUT_IMAGES, catName, shelfName, prodName)

          // Copy images with standardised names
          const classified = classifyImages(images)
          for (const [side, filename] of Object.entries(classified)) {
            syncFile(path.join(prodPath, filename), path.join(destDir, `${side}.jpg`), dryRun)
            copiedCount++
          }

          productsArray.push({
            id,
            name:            prodName,
            brand:           '',
            category:        shelfId,
            imageFolderPath: relFolder,
            sides:           Object.keys(classified),
            bgColor:         meta.color,
            color:           '#FFFFFF',
          })
          productCount++
        }
      }
    } else {
      // Category has no sub-shelves — the category IS the shelf
      shelvesArray.push({
        id:          catId,
        categoryId:  catId,
        label:       catName,
        shelfName:   catName,
        shelfNumber: 1,
        emoji:       meta.emoji,
        color:       meta.color,
      })

      for (const prodName of firstLevel.sort()) {
        const prodPath = path.join(catPath, prodName)
        const images   = listImages(prodPath)
        if (images.length === 0) {
          console.warn(`  [warn] No images in: ${catName}/${prodName}`)
          continue
        }

        const baseId = toKebab(prodName)
        let   id     = seenIds.has(baseId) ? `${baseId}-${catId}` : baseId
        if (seenIds.has(id)) id = `${baseId}-${catId}-2`
        seenIds.add(id)

        const relFolder = `medications/${catName}/${prodName}`
        const destDir   = path.join(OUT_IMAGES, catName, prodName)

        const classified = classifyImages(images)
        for (const [side, filename] of Object.entries(classified)) {
          syncFile(path.join(prodPath, filename), path.join(destDir, `${side}.jpg`), dryRun)
          copiedCount++
        }

        productsArray.push({
          id,
          name:            prodName,
          brand:           '',
          category:        catId,
          imageFolderPath: relFolder,
          sides:           Object.keys(classified),
          bgColor:         meta.color,
          color:           '#FFFFFF',
        })
        productCount++
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

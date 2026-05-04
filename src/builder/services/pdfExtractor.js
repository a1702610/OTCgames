// Extracts plain text from a PDF File object using pdfjs-dist
// Returns a single string with all page text joined by double newlines

export async function extractTextFromPdf(file) {
  const pdfjsLib = await import('pdfjs-dist')

  // Point the worker at the bundled worker file
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).href

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item) => item.str).join(' ')
    if (pageText.trim()) pages.push(pageText.trim())
  }

  return pages.join('\n\n')
}

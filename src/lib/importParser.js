import { makeCategory, makeItem } from './tripModel'

// Parses simple indented text into categories/items:
//
//   Category Name
//     Item one x3 - optional note
//     Item two
//   Another Category
//     Item three x2
//
// A line with no leading whitespace starts a new category. Indented lines
// under it become items. "xN" sets quantity (default 1); " - " starts notes.
export function parseImportText(text) {
  const categories = []
  let current = null

  for (const rawLine of text.split('\n')) {
    if (!rawLine.trim()) continue
    const isIndented = /^\s/.test(rawLine)
    const line = rawLine.trim()

    if (!isIndented) {
      current = makeCategory(line)
      categories.push(current)
      continue
    }

    if (!current) {
      // Item line before any category header — put it in a catch-all category.
      current = makeCategory('Imported items')
      categories.push(current)
    }

    const [namePart, ...noteParts] = line.split(' - ')
    const notes = noteParts.join(' - ').trim()

    const qtyMatch = namePart.match(/^(.*?)\s+x(\d+)$/i)
    const name = (qtyMatch ? qtyMatch[1] : namePart).trim()
    const quantity = qtyMatch ? parseInt(qtyMatch[2], 10) : 1

    if (!name) continue
    current.items.push(makeItem(name, quantity, notes))
  }

  return categories.filter((c) => c.items.length > 0)
}

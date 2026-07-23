// Pure helpers for working with a trip's lists/categories/items in memory.
// The whole `lists` array is written back to Firestore on every change —
// packing lists are small, so this keeps sync logic simple (one doc, one listener).

export function newId() {
  return crypto.randomUUID()
}

// A photo header (pasted image URL) overrides the motif pattern with a
// dark-gradient-over-photo look; returns undefined (no inline override) when
// there's no photo, so the CSS motif background shows through instead.
export function headerPhotoStyle(trip) {
  if (!trip.headerImageUrl) return undefined
  return {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url("${trip.headerImageUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}

export function makeList(name, categories = [], synced = false) {
  return { id: newId(), name, categories, synced }
}

// Trips created before multi-list support only have a flat `categories` array.
// Wrap it as a single "Recommended" list so old trips keep working unchanged.
export function normalizeLists(trip) {
  if (trip.lists && trip.lists.length > 0) return trip.lists
  return [makeList('Recommended', trip.categories || [])]
}

export function addList(lists, name) {
  return [...lists, makeList(name)]
}

export function renameList(lists, listId, name) {
  return lists.map((l) => (l.id === listId ? { ...l, name } : l))
}

export function deleteList(lists, listId) {
  return lists.filter((l) => l.id !== listId)
}

export function makeCategory(name) {
  return { id: newId(), name, items: [] }
}

export function makeItem(name, quantity = 1, notes = '') {
  return { id: newId(), name, quantity, notes, owned: false, buy: false, packed: false }
}

export function addCategory(categories, name) {
  return [...categories, makeCategory(name)]
}

export function renameCategory(categories, categoryId, name) {
  return categories.map((c) => (c.id === categoryId ? { ...c, name } : c))
}

export function deleteCategory(categories, categoryId) {
  return categories.filter((c) => c.id !== categoryId)
}

export function moveCategory(categories, categoryId, direction) {
  const index = categories.findIndex((c) => c.id === categoryId)
  const target = index + direction
  if (index === -1 || target < 0 || target >= categories.length) return categories
  const next = [...categories]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export function addItem(categories, categoryId, item) {
  return categories.map((c) =>
    c.id === categoryId ? { ...c, items: [...c.items, item] } : c
  )
}

// Own/Buy are mutually exclusive (checking one clears the other), matching
// the source tool this was modeled after.
export function ownedPatch(isOwned) {
  return isOwned ? { owned: true, buy: false } : { owned: false }
}

export function buyPatch(isBuy) {
  return isBuy ? { buy: true, owned: false } : { buy: false }
}

// Finds the item's list by listId and applies an updateItem-style patch to
// its categories — used by the shopping cart to edit an item that could
// belong to any trip/list.
export function updateItemInLists(lists, listId, categoryId, itemId, patch) {
  return lists.map((l) => (l.id === listId ? { ...l, categories: updateItem(l.categories, categoryId, itemId, patch) } : l))
}

export function updateItem(categories, categoryId, itemId, patch) {
  return categories.map((c) =>
    c.id !== categoryId
      ? c
      : { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
  )
}

export function deleteItem(categories, categoryId, itemId) {
  return categories.map((c) =>
    c.id !== categoryId ? c : { ...c, items: c.items.filter((i) => i.id !== itemId) }
  )
}

export function moveItem(categories, categoryId, itemId, direction) {
  return categories.map((c) => {
    if (c.id !== categoryId) return c
    const index = c.items.findIndex((i) => i.id === itemId)
    const target = index + direction
    if (index === -1 || target < 0 || target >= c.items.length) return c
    const items = [...c.items]
    ;[items[index], items[target]] = [items[target], items[index]]
    return { ...c, items }
  })
}

// Flat item-list CRUD, for the "My additions" personal items (no category grouping).
export function addFlatItem(items, item) {
  return [...items, item]
}

export function updateFlatItem(items, itemId, patch) {
  return items.map((i) => (i.id === itemId ? { ...i, ...patch } : i))
}

export function deleteFlatItem(items, itemId) {
  return items.filter((i) => i.id !== itemId)
}

export function moveFlatItem(items, itemId, direction) {
  const index = items.findIndex((i) => i.id === itemId)
  const target = index + direction
  if (index === -1 || target < 0 || target >= items.length) return items
  const next = [...items]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export function categoryProgress(category) {
  const total = category.items.length
  const packed = category.items.filter((i) => i.packed).length
  return { packed, total }
}

// Generic per-field progress (field is 'packed' | 'owned' | 'buy'), for
// the Owned tracking bar alongside the Packed one.
export function fieldProgress(categories, field) {
  return categories.reduce(
    (acc, c) => {
      const total = c.items.length
      const count = c.items.filter((i) => i[field]).length
      return { count: acc.count + count, total: acc.total + total }
    },
    { count: 0, total: 0 }
  )
}

export function tripProgress(categories) {
  return categories.reduce(
    (acc, c) => {
      const { packed, total } = categoryProgress(c)
      return { packed: acc.packed + packed, total: acc.total + total }
    },
    { packed: 0, total: 0 }
  )
}

// Combined progress across every list on a trip, for the dashboard summary card.
export function allListsProgress(lists) {
  return lists.reduce(
    (acc, l) => {
      const { packed, total } = tripProgress(l.categories)
      return { packed: acc.packed + packed, total: acc.total + total }
    },
    { packed: 0, total: 0 }
  )
}

// Clones categories/items with fresh ids and owned/buy/packed reset, for "duplicate trip".
export function cloneCategoriesAsTemplate(categories) {
  return categories.map((c) => ({
    id: newId(),
    name: c.name,
    items: c.items.map((i) => ({
      id: newId(),
      name: i.name,
      quantity: i.quantity,
      notes: i.notes,
      owned: false,
      buy: false,
      packed: false,
    })),
  }))
}

// Clones every list on a trip (all travelers' lists), for "duplicate trip".
export function cloneListsAsTemplate(lists) {
  return lists.map((l) => ({
    id: newId(),
    name: l.name,
    categories: cloneCategoriesAsTemplate(l.categories),
  }))
}

// For migrating a private trip's lists into a shared trip: keeps the same
// category/item ids (so the id sets collected below still point at the
// right items) but drops the embedded owned/buy/packed fields, since shared
// trips track that status per-viewer instead.
export function stripPackedForSharing(categories) {
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    items: c.items.map(({ id, name, quantity, notes }) => ({ id, name, quantity, notes })),
  }))
}

// Collects the ids of every item currently marked with a given boolean field
// (owned/buy/packed), for seeding a shared trip's initial per-status docs
// from a private trip's state.
export function collectItemIdsWhere(categories, field) {
  return categories.flatMap((c) => c.items.filter((i) => i[field]).map((i) => i.id))
}

export function collectPackedIds(categories) {
  return collectItemIdsWhere(categories, 'packed')
}

// Collects every item currently marked "buy" (with its category/list context),
// for the cross-trip shopping cart.
export function collectBuyItems(categories) {
  return categories.flatMap((c) =>
    c.items.filter((i) => i.buy).map((i) => ({ ...i, categoryName: c.name, categoryId: c.id }))
  )
}

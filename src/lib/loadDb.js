export async function loadDb() {
  console.log('[loadDb] Fetching zagrava_db_v1.json')
  const res = await fetch('/zagrava_db_v1.json')
  if (!res.ok) {
    console.error('[loadDb] Failed to load DB', res.status)
    return []
  }
  const json = await res.json()
  const items = json.items || []
  console.log('[loadDb] Loaded items:', items.length)
  return items
}

import { useState } from 'react'

export function useStoredList(key: string) {
  const [items, setItems] = useState<string[]>(() => {
    try { const value: unknown = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [] } catch { return [] }
  })
  function toggle(value: string) {
    setItems(previous => {
      const next = previous.includes(value) ? previous.filter(v => v !== value) : [...previous, value]
      try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* Keep the current session usable if storage is unavailable. */ }
      return next
    })
  }
  return [items, toggle] as const
}

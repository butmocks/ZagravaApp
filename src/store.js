import { create } from 'zustand'

console.log('[store] Zustand store created')

export const LEVEL_COLOR_MAP = {
  white: ['easy'],
  yellow: ['medium'],
  pink: ['hard'],
  red: ['extreme'],
}

const DEFAULT_COLOR = 'white'

export const useZStore = create((set) => ({
  lang: 'ua',
  theme: 'dark',
  auth: { isAuthed: false, method: 'pin' },
  pair: { maleName: '', femaleName: '' },
  selectedLevelColor: DEFAULT_COLOR,
  filters: {
    levels: new Set(LEVEL_COLOR_MAP[DEFAULT_COLOR]),
    categories: new Set(['action', 'question', 'game']),
    moods: new Set(['romantic', 'playful', 'passionate', 'deep']),
    consentOnly: false,
  },
  toggleLevel: (lv) =>
    set((s) => {
      console.log('[store] toggleLevel', lv)
      const next = new Set(s.filters.levels)
      next.has(lv) ? next.delete(lv) : next.add(lv)
      return { filters: { ...s.filters, levels: next } }
    }),
  toggleCategory: (c) =>
    set((s) => {
      console.log('[store] toggleCategory', c)
      const next = new Set(s.filters.categories)
      next.has(c) ? next.delete(c) : next.add(c)
      return { filters: { ...s.filters, categories: next } }
    }),
  toggleMood: (m) =>
    set((s) => {
      console.log('[store] toggleMood', m)
      const next = new Set(s.filters.moods)
      next.has(m) ? next.delete(m) : next.add(m)
      return { filters: { ...s.filters, moods: next } }
    }),
  toggleConsentOnly: () =>
    set((s) => {
      console.log('[store] toggleConsentOnly')
      return { filters: { ...s.filters, consentOnly: !s.filters.consentOnly } }
    }),
  setLang: (lang) => {
    console.log('[store] setLang', lang)
    set({ lang })
  },
  setPairNames: ({ maleName, femaleName }) => {
    console.log('[store] setPairNames', maleName, femaleName)
    set({ pair: { maleName, femaleName } })
  },
  setLevelColor: (color) =>
    set((s) => {
      console.log('[store] setLevelColor', color)
      const mapped = LEVEL_COLOR_MAP[color] || s.filters.levels
      return {
        selectedLevelColor: color,
        filters: { ...s.filters, levels: new Set(mapped) },
      }
    }),
  login: (pin) =>
    set(() => {
      console.log('[store] login attempt', pin)
      const ok = typeof pin === 'string' && pin.length >= 4
      if (ok) localStorage.setItem('zagrava_pin', pin)
      return { auth: { isAuthed: ok, method: 'pin' } }
    }),
  logout: () =>
    set(() => {
      console.log('[store] logout')
      localStorage.removeItem('zagrava_pin')
      return { auth: { isAuthed: false, method: 'pin' } }
    }),
  bootstrapAuth: () =>
    set(() => {
      const saved = localStorage.getItem('zagrava_pin')
      console.log('[store] bootstrapAuth, saved=', saved)
      return { auth: { isAuthed: !!saved, method: 'pin' } }
    }),
}))

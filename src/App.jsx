import { Suspense, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './i18n'
import { useZStore } from './store'
import { loadDb } from './lib/loadDb'

function Shell({ children }) {
  const { lang } = useZStore()

  useEffect(() => {
    console.log('[Shell] lang changed:', lang)
    document.documentElement.lang = lang
  }, [lang])

  console.log('[Shell] render')

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <header className="sticky top-0 z-10 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-semibold text-flame-400">
            Заграва
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/play" className="hover:text-flame-300">
              Грати
            </Link>
            <Link to="/settings" className="hover:text-flame-300">
              Налаштування
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  console.log('[Home] render')

  return (
    <div className="grid gap-6">
      <h1 className="text-4xl font-bold">Вітаємо у Заграві</h1>
      <p className="text-zinc-300">Ігрові картки для близькості, довіри й пристрасті.</p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            console.log('[Home] navigate to /play')
            navigate('/play')
          }}
          className="px-5 py-3 rounded-2xl bg-flame-600 hover:bg-flame-500 active:bg-flame-700 transition"
        >
          Почати
        </button>
        <Link
          to="/auth"
          onClick={() => console.log('[Home] navigate to /auth')}
          className="px-5 py-3 rounded-2xl bg-zinc-800 border border-white/10 hover:bg-zinc-700"
        >
          Доступ
        </Link>
      </div>
    </div>
  )
}

function Settings() {
  const s = useZStore()
  console.log('[Settings] render')

  const Row = ({ label, children }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/10">
      <span className="text-zinc-300">{label}</span>
      {children}
    </div>
  )

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">Налаштування</h2>

      <Row label="Мова">
        <select
          value={s.lang}
          onChange={(e) => {
            console.log('[Settings] setLang', e.target.value)
            s.setLang(e.target.value)
          }}
          className="bg-zinc-800 rounded-xl px-3 py-2"
        >
          <option value="ua">Українська</option>
          <option value="en">English</option>
        </select>
      </Row>

      <Row label="Тільки згодні до дій (18+)">
        <input
          type="checkbox"
          checked={s.filters.consentOnly}
          onChange={() => {
            console.log('[Settings] toggleConsentOnly')
            s.toggleConsentOnly()
          }}
        />
      </Row>

      <div className="grid grid-cols-2 gap-2">
        {['easy', 'medium', 'hard', 'extreme'].map((lv) => (
          <button
            key={lv}
            onClick={() => {
              console.log('[Settings] toggleLevel', lv)
              s.toggleLevel(lv)
            }}
            className={`px-3 py-2 rounded-xl border ${
              s.filters.levels.has(lv)
                ? 'bg-flame-600 border-flame-500'
                : 'bg-zinc-900 border-white/10'
            }`}
          >
            {lv}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {['action', 'question', 'game'].map((ct) => (
          <button
            key={ct}
            onClick={() => {
              console.log('[Settings] toggleCategory', ct)
              s.toggleCategory(ct)
            }}
            className={`px-3 py-2 rounded-xl border ${
              s.filters.categories.has(ct)
                ? 'bg-flame-600 border-flame-500'
                : 'bg-zinc-900 border-white/10'
            }`}
          >
            {ct}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {['romantic', 'playful', 'passionate', 'deep'].map((m) => (
          <button
            key={m}
            onClick={() => {
              console.log('[Settings] toggleMood', m)
              s.toggleMood(m)
            }}
            className={`px-3 py-2 rounded-xl border ${
              s.filters.moods.has(m)
                ? 'bg-flame-600 border-flame-500'
                : 'bg-zinc-900 border-white/10'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={() => {
            console.log('[Settings] logout (clear access)')
            s.logout()
          }}
          className="text-sm text-zinc-400 hover:text-white"
        >
          Очистити доступ (вийти)
        </button>
      </div>
    </div>
  )
}

function Card({ card, onNext }) {
  const title = card.title_ua
  const desc = card.description_ua
  console.log('[Card] render', card.id)

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
        <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">{card.category}</span>
        <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">{card.level}</span>
        <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">{card.mood}</span>
      </div>
      <h3 className="text-2xl font-bold mt-3 text-flame-300">{title}</h3>
      {card.consent_required && (
        <p className="mt-2 text-sm text-rose-300">⚠️ Памʼятайте: дія виконується лише за взаємної згоди.</p>
      )}
      <p className="mt-4 text-lg leading-relaxed text-zinc-200">{desc}</p>
      {card.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {card.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-1 rounded-full bg-black/40 border border-white/10">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            console.log('[Card] next card')
            onNext()
          }}
          className="px-4 py-2 rounded-xl bg-flame-600 hover:bg-flame-500"
        >
          Далі
        </button>
      </div>
    </div>
  )
}

function shuffle(arr) {
  console.log('[shuffle] length before', arr.length)
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  console.log('[shuffle] done')
  return arr
}

function filterCards(all, filters) {
  const result = all.filter(
    (c) =>
      filters.levels.has(c.level) &&
      filters.categories.has(c.category) &&
      filters.moods.has(c.mood) &&
      (!filters.consentOnly || c.consent_required === true),
  )
  console.log('[filterCards] input:', all.length, 'output:', result.length)
  return result
}

function Play() {
  const s = useZStore()
  const [cards, setCards] = useState([])
  const [i, setI] = useState(0)

  useEffect(() => {
    console.log('[Play] bootstrapAuth')
    s.bootstrapAuth()
  }, [])

  useEffect(() => {
    console.log('[Play] loading DB with filters', s.filters)
    ;(async () => {
      const all = await loadDb()
      const filtered = filterCards(all, s.filters)
      console.log('[Play] cards after filter:', filtered.length)
      setCards(shuffle([...filtered]))
      setI(0)
    })()
  }, [s.filters])

  if (!s.auth.isAuthed) {
    console.log('[Play] not authed, redirect to /auth')
    return <Navigate to="/auth" replace />
  }

  if (cards.length === 0) {
    return <p className="text-zinc-400">Завантаження карток… або фільтр занадто вузький.</p>
  }

  const card = cards[i % cards.length]

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            console.log('[Play] reshuffle cards')
            setCards(shuffle([...cards]))
            setI(0)
          }}
          className="text-sm text-zinc-400 hover:text-white"
        >
          Перемішати
        </button>
        <div className="text-sm text-zinc-400">
          {i + 1}/{cards.length}
        </div>
      </div>
      <Card
        card={card}
        onNext={() => {
          console.log('[Play] increment index', i + 1)
          setI(i + 1)
        }}
      />
    </div>
  )
}

function Auth() {
  const s = useZStore()
  const nav = useNavigate()
  const [pin, setPin] = useState('')

  useEffect(() => {
    console.log('[Auth] bootstrapAuth')
    s.bootstrapAuth()
    if (s.auth.isAuthed) {
      console.log('[Auth] already authed, redirect to /play')
      nav('/play')
    }
  }, [])

  const submit = (e) => {
    e.preventDefault()
    console.log('[Auth] submit pin')
    s.login(pin)
    if (pin && pin.length >= 4) {
      console.log('[Auth] pin ok, redirect to /play')
      nav('/play')
    } else {
      console.log('[Auth] pin too short')
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Доступ</h2>
      <p className="text-sm text-zinc-400 mb-4">Встановіть PIN (мінімум 4 символи), щоб захистити ваш простір.</p>
      <form onSubmit={submit} className="grid gap-3">
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          type="password"
          placeholder="Введіть PIN"
          className="px-3 py-2 rounded-xl bg-zinc-800 border border-white/10"
        />
        <button className="px-4 py-2 rounded-xl bg-flame-600 hover:bg-flame-500">Увійти</button>
      </form>
      <button
        onClick={() => {
          console.log('[Auth] reset pin/logout')
          s.logout()
          setPin('')
        }}
        className="mt-3 text-sm text-zinc-400 hover:text-white"
      >
        Скинути PIN
      </button>
    </div>
  )
}

export default function App() {
  console.log('[App] render')
  return (
    <Shell>
      <Suspense>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/play" element={<Play />} />
        </Routes>
      </Suspense>
    </Shell>
  )
}

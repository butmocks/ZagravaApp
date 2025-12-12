import { Suspense, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import './i18n'
import { LEVEL_COLOR_MAP, useZStore } from './store'
import { loadDb } from './lib/loadDb'
import { romanticFacts } from './data/facts'

const FLOW_LINKS = [
  { to: '/', label: 'Старт' },
  { to: '/fact', label: 'Факт' },
  { to: '/names', label: 'Пара' },
  { to: '/levels', label: 'Рівні' },
  { to: '/rules', label: 'Правила' },
  { to: '/play', label: 'Завдання' },
]

const INTRO_PARAGRAPHS = [
  'Ласкаво просимо до ZAGRAVA — гри, яка розкриває бажання.',
  'Тут немає переможців і переможених. Є тільки ви, ваші фантазії та випадкові завдання, які поступово проведуть вас від легкого флірту до глибокої близькості.',
  'Обирайте формат — білий, жовтий, рожевий або червоний — і дозвольте грі вести вас.',
  'Фанти випадкові. Ролі — визначає жереб. Єдине правило — взаємна згода та задоволення.',
]

const INTRO_PURPOSES = [
  'освіжити стосунки;',
  'додати сміливості;',
  'відкрити нових себе одне для одного;',
  'подарувати вечір, який ви точно запам’ятаєте.',
]

const INTRO_FOOTER = ['Грайте ніжно. Грайте сміливо. Грайте так, як хочете тільки ви.', 'Zagrava — розпалюй.']

const RULE_TLDR = [
  {
    title: '1. Підготовка',
    items: [
      'налаштуйтесь психологічно;',
      'створіть атмосферу (свічки, музика, легке світло);',
      'визначте, чи використовуєте іграшки;',
      'за потреби відкладіть певні фанти.',
    ],
  },
  {
    title: '2. Рівні гри',
    items: [
      'Білий → розмови, фантазії',
      'Жовтий → флірт і дотики',
      'Рожевий → інтимні дії (перше — ванна разом)',
      'Червоний → сексуальні завдання',
    ],
  },
  {
    title: '3. Жеребкування',
    items: [
      'фантуючий ховає фішку;',
      'партнер вгадує;',
      'хто вгадав — той витягує фант.',
    ],
  },
  {
    title: '4. Виконання',
    items: [
      'фант дістається сорочкою вгору — завжди «всліпу»;',
      'фантуючий читає або виконує мовчки;',
      'якщо є поза — перегляньте її;',
      'виконаний фант відкладається.',
    ],
  },
  {
    title: '5. Брейки',
    items: ['До 3 пауз за гру. Можна пропустити завдання.'],
  },
  {
    title: '6. Гра не зобовʼязує доходити до сексу',
    items: ['Насолода — єдина мета.'],
  },
]

const LEVEL_INFO = [
  {
    badge: '🟦',
    title: 'Білий рівень — легкість',
    focus: 'Фокус: спілкування, фантазії, довіра',
    items: ['Типи завдань: історії, питання, компліменти', 'Навіщо: теплий старт, легка хімія'],
  },
  {
    badge: '🟨',
    title: 'Жовтий рівень — дотики',
    focus: 'Фокус: флірт, тіло, перші фізичні взаємодії',
    items: ['Типи завдань: масаж, поцілунки, легкі дотики', 'Важливо: все робиться м’яко і повільно'],
  },
  {
    badge: '💕',
    title: 'Рожевий рівень — інтим',
    focus: 'Фокус: глибша близькість',
    items: ['Типи завдань: поцілунки тіла, ванна разом, інтимні ігри', 'Перше завдання: «разом у ванну»'],
  },
  {
    badge: '❤️',
    title: 'Червоний рівень — пристрасть',
    focus: 'Фокус: повноцінний секс, поза + роль',
    items: ['Типи завдань: пози, іграшки, експерименти', 'Рівень обираєте ви, гра не змушує!'],
  },
]

const DRAW_FLOW = [
  'фантуючий ховає фішку 👉 партнер вгадує;',
  'вгадав → він тягне фант;',
  'не вгадав → тягне той самий гравець;',
  'фантуючий завжди проводить наступний жереб.',
]

const PULL_STEPS = [
  'колода лежить сорочкою вверх (колір не видно);',
  'фантуючий витягує навмання;',
  'читає або виконує мовчки;',
  'якщо є поза → відкриває її;',
  'виконаний фант → у відбій.',
]

const BREAKS_GUIDE = [
  'До 3 брейків на гру.',
  'Можна пропустити завдання.',
  'Компенсація: кава в ліжко або інша приємність.',
]

const MODE_VARIANTS = [
  {
    title: '🌶 Перчик — для нових пар',
    desc: 'Легше, більше флірту, мінімум складних поз.',
  },
  {
    title: '🥃 Абсент — для довгих стосунків',
    desc: 'Глибше, сміливіше, з тривалими завданнями.',
  },
]

const CORE_PRINCIPLE = 'Гра створена для насолоди. Ніякого примусу, ніякого тиску. Тільки добровільність та задоволення.'

function Shell({ children }) {
  const { lang } = useZStore()

  useEffect(() => {
    console.log('[Shell] lang changed:', lang)
    document.documentElement.lang = lang
  }, [lang])

  console.log('[Shell] render')

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <header className="sticky top-0 z-10 backdrop-blur bg-black/50 border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-semibold text-flame-400">
            Заграва
          </Link>
          <nav className="hidden md:flex gap-3 text-sm">
            {FLOW_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-flame-200 transition-colors">
                {link.label}
              </Link>
            ))}
            <Link to="/settings" className="hover:text-flame-200 transition-colors">
              Налаштування
            </Link>
          </nav>
          <Link to="/auth" className="text-xs uppercase tracking-wide text-zinc-400 hover:text-white">
            PIN
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  )
}

function StartScreen() {
  const navigate = useNavigate()
  console.log('[StartScreen] render')

  return (
    <section className="grid gap-6">
      <p className="text-sm uppercase tracking-[0.4em] text-flame-400">Zagrava — розпалюй</p>
      <h1 className="text-4xl md:text-5xl font-bold max-w-3xl">Гра, що розкриває бажання.</h1>
      <div className="space-y-3 text-lg text-zinc-200 max-w-3xl">
        {INTRO_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5 space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Zagrava створена для того, щоб:</p>
        <ul className="list-disc pl-6 text-zinc-100 space-y-1">
          {INTRO_PURPOSES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-1 text-lg text-zinc-100">
        {INTRO_FOOTER.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/fact')}
          className="px-5 py-3 rounded-2xl bg-flame-600 hover:bg-flame-500 active:bg-flame-700 transition"
        >
          Розпочати шлях
        </button>
        <Link
          to="/rules"
          className="px-5 py-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-flame-500"
        >
          Переглянути правила
        </Link>
      </div>
    </section>
  )
}

function InfoScreen() {
  const navigate = useNavigate()
  const [fact, setFact] = useState(() => pickRandomFact())

  const nextFact = () => {
    setFact(pickRandomFact())
  }

  return (
    <section className="space-y-6">
      <div className="text-xs uppercase tracking-[0.4em] text-zinc-400">ЦІКАВИЙ ФАКТ</div>
      <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl">
        <p className="text-xl leading-relaxed text-zinc-100">{fact}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={nextFact} className="text-sm text-flame-300 hover:text-flame-100">
            Ще один факт
          </button>
          <button
            onClick={() => navigate('/names')}
            className="px-4 py-2 rounded-xl bg-flame-600 hover:bg-flame-500"
          >
            Продовжити
          </button>
        </div>
      </article>
    </section>
  )
}

function NamesScreen() {
  const navigate = useNavigate()
  const pair = useZStore((s) => s.pair)
  const setPairNames = useZStore((s) => s.setPairNames)
  const [maleName, setMaleName] = useState(pair.maleName)
  const [femaleName, setFemaleName] = useState(pair.femaleName)

  const submit = (e) => {
    e.preventDefault()
    setPairNames({ maleName: maleName.trim(), femaleName: femaleName.trim() })
    navigate('/levels')
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">крок 2</p>
        <h2 className="text-3xl font-semibold">Запишіть імена пари</h2>
        <p className="text-zinc-400">Ми підставимо їх у завдання, щоб інструкції звучали персонально.</p>
      </div>
      <form onSubmit={submit} className="grid gap-4 max-w-md">
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-300">Імʼя чоловіка / парня</span>
          <input
            value={maleName}
            onChange={(e) => setMaleName(e.target.value)}
            placeholder="Андрій"
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10"
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-300">Імʼя дівчини / партнерки</span>
          <input
            value={femaleName}
            onChange={(e) => setFemaleName(e.target.value)}
            placeholder="Марія"
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10"
            required
          />
        </label>
        <button className="px-4 py-2 rounded-xl bg-flame-600 hover:bg-flame-500">Зберегти та далі</button>
      </form>
    </section>
  )
}

const LEVEL_CARDS = [
  {
    id: 'white',
    title: 'Білий жар',
    tagline: 'ніжність та стартові відвертості',
    desc: 'Для розігріву, легкі дотики, компліменти та фантазії без тиску.',
  },
  {
    id: 'yellow',
    title: 'Жовте сяйво',
    tagline: 'флірт і сміливіші сценарії',
    desc: 'Більше тілесності, грайливих завдань і розкриття вподобань.',
  },
  {
    id: 'pink',
    title: 'Рожева хвиля',
    tagline: 'пристрасть + експерименти',
    desc: 'Фантазії, рольові ігри, сценарії зі сміливими запитаннями.',
  },
  {
    id: 'red',
    title: 'Червоний жар',
    tagline: 'максимальна відвертість',
    desc: 'Глибоке дослідження меж, складні виклики, повна довіра.',
  },
]

function LevelsScreen() {
  const navigate = useNavigate()
  const { selectedLevelColor, setLevelColor } = useZStore((s) => ({
    selectedLevelColor: s.selectedLevelColor,
    setLevelColor: s.setLevelColor,
  }))

  const select = (level) => {
    setLevelColor(level)
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">крок 3</p>
        <h2 className="text-3xl font-semibold">Обирайте колір вашого вечора</h2>
        <p className="text-zinc-400">База вже містить білий рівень. Наступні кольори готуємо — можете планувати їх наперед.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {LEVEL_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => select(card.id)}
            className={clsx(
              'text-left rounded-3xl border border-white/10 bg-zinc-900/70 p-5 transition',
              selectedLevelColor === card.id && 'border-flame-500 shadow-[0_0_25px_rgba(249,115,22,0.35)]',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500">{card.tagline}</p>
                <h3 className="text-2xl font-semibold">{card.title}</h3>
              </div>
              <span className="text-xs uppercase px-3 py-1 rounded-full border border-white/10">
                {LEVEL_COLOR_MAP[card.id]?.join(', ') || 'coming soon'}
              </span>
            </div>
            <p className="mt-3 text-zinc-300">{card.desc}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate('/rules')} className="px-4 py-2 rounded-xl bg-flame-600 hover:bg-flame-500">
          До правил
        </button>
        <button onClick={() => navigate('/play')} className="px-4 py-2 rounded-xl bg-zinc-800 border border-white/10">
          Пропустити правила та грати
        </button>
      </div>
    </section>
  )
}

function RulesScreen() {
  const navigate = useNavigate()
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">крок 4</p>
        <h2 className="text-3xl font-semibold">Правила, що дарують свободу</h2>
        <p className="text-zinc-400">
          Інтенсивність завжди за вашим бажанням. Використовуйте ці підказки, щоб грати усвідомлено і безпечно.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {RULE_TLDR.map((block) => (
          <article
            key={block.title}
            className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5 space-y-2 shadow-inner"
          >
            <h3 className="text-lg font-semibold text-flame-200">{block.title}</h3>
            <ul className="list-disc pl-5 text-sm text-zinc-100 space-y-1">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {LEVEL_INFO.map((level) => (
          <article
            key={level.title}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-black p-5 space-y-2"
          >
            <p className="text-2xl">{level.badge}</p>
            <h3 className="text-xl font-semibold text-white">{level.title}</h3>
            <p className="text-sm text-zinc-400">{level.focus}</p>
            <ul className="list-disc pl-5 text-sm text-zinc-100 space-y-1">
              {level.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5 space-y-2">
          <h3 className="text-xl font-semibold">🎲 Жеребкування</h3>
          <ul className="list-disc pl-5 text-sm text-zinc-100 space-y-1">
            {DRAW_FLOW.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5 space-y-2">
          <h3 className="text-xl font-semibold">📜 Витягування фанта</h3>
          <ul className="list-disc pl-5 text-sm text-zinc-100 space-y-1">
            {PULL_STEPS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5 space-y-2">
          <h3 className="text-xl font-semibold">🛑 Брейки</h3>
          <ul className="list-disc pl-5 text-sm text-zinc-100 space-y-1">
            {BREAKS_GUIDE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        {MODE_VARIANTS.map((mode) => (
          <article key={mode.title} className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5 space-y-2">
            <h3 className="text-xl font-semibold">{mode.title}</h3>
            <p className="text-sm text-zinc-100">{mode.desc}</p>
          </article>
        ))}
      </div>

      <article className="rounded-3xl border border-white/10 bg-black/60 p-6 text-center text-lg text-zinc-100">
        {CORE_PRINCIPLE}
      </article>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/play')} className="px-5 py-3 rounded-2xl bg-flame-600 hover:bg-flame-500">
          До завдань
        </button>
        <button onClick={() => navigate('/levels')} className="px-5 py-3 rounded-2xl bg-zinc-900 border border-white/10">
          Переглянути рівні ще раз
        </button>
      </div>
    </section>
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

function Card({ card, onNext, pair }) {
  const title = card.title_ua
  const desc = injectNames(card.description_ua, pair)
  console.log('[Card] render', card.id)

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
        <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">{card.category}</span>
        <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">{card.level}</span>
        <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">{card.mood}</span>
      </div>
      <h3 className="text-2xl font-bold mt-3 text-flame-300">{title}</h3>
      {card.consent_required && (
        <p className="mt-2 text-sm text-rose-300">⚠️ Памʼятайте: дія виконується лише за взаємної згоди.</p>
      )}
      {card.img && (
        <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
          <img src={card.img} alt={title} className="w-full h-64 object-cover" />
        </div>
      )}
      <p className="mt-4 text-lg leading-relaxed text-zinc-200 whitespace-pre-line">{desc}</p>
      {card.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {card.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-1 rounded-full bg-black/40 border border-white/10">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-zinc-500">
          Пара: {pair.maleName || 'він'} & {pair.femaleName || 'вона'}
        </div>
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
  const pair = s.pair
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

  if (!pair.maleName || !pair.femaleName) {
    return <Navigate to="/names" replace />
  }

  if (cards.length === 0) {
    return <p className="text-zinc-400">Завантаження карток… або фільтр/рівень ще не заповнений.</p>
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
        pair={pair}
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
      <p className="text-sm text-zinc-400 mb-4">
        Встановіть PIN (мінімум 4 символи), щоб захистити ваш простір.
      </p>
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

function injectNames(text, pair) {
  if (!text) return ''
  const male = pair.maleName || 'партнер'
  const female = pair.femaleName || 'панночка'
  return text
    .replaceAll('{boy}', male)
    .replaceAll('{Boy}', male)
    .replaceAll('{girl}', female)
    .replaceAll('{Girl}', female)
}

function pickRandomFact() {
  return romanticFacts[Math.floor(Math.random() * romanticFacts.length)]
}

export default function App() {
  console.log('[App] render')
  return (
    <Shell>
      <Suspense>
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/fact" element={<InfoScreen />} />
          <Route path="/names" element={<NamesScreen />} />
          <Route path="/levels" element={<LevelsScreen />} />
          <Route path="/rules" element={<RulesScreen />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/play" element={<Play />} />
        </Routes>
      </Suspense>
    </Shell>
  )
}

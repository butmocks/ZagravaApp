import { useState } from 'react'

const STREAMS = [
  {
    id: 'lounge',
    name: 'Lounge Vibes',
    url: 'https://stream.mixlive.ie:8011/lounge',
    desc: 'легка електроніка та даунтемпо',
  },
  {
    id: 'jazz',
    name: 'Jazz & Warm',
    url: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3',
    desc: 'затишний джаз, сакс і вокал',
  },
  {
    id: 'ambient',
    name: 'Ambient Flow',
    url: 'https://icecast2.iskelma.fi/iltasoitto',
    desc: 'повільні синти та атмосферні хвилі',
  },
]

export default function RadioPlayer() {
  const [currentId, setCurrentId] = useState(STREAMS[0].id)
  const current = STREAMS.find((s) => s.id === currentId) ?? STREAMS[0]

  return (
    <section className="rounded-3xl border border-white/10 bg-black/40 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Романтичне радіо</p>
          <h3 className="text-lg font-semibold text-flame-200">{current.name}</h3>
          <p className="text-sm text-zinc-400">{current.desc}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STREAMS.map((stream) => (
            <button
              key={stream.id}
              onClick={() => setCurrentId(stream.id)}
              className={`px-3 py-1 rounded-full text-xs border ${
                currentId === stream.id ? 'bg-flame-600 border-flame-500' : 'bg-zinc-900 border-white/10'
              }`}
            >
              {stream.name}
            </button>
          ))}
        </div>
      </div>
      <audio
        key={current.url}
        controls
        className="w-full"
        src={current.url}
        preload="none"
        aria-label={`Онлайн-радіо ${current.name}`}
      >
        Ваш браузер не підтримує аудіо.
      </audio>
    </section>
  )
}

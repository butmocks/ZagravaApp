import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

console.log('[i18n] Initializing i18n')

const resources = {
  ua: {
    translation: {
      appName: 'Заграва',
      play: 'Грати',
      settings: 'Налаштування',
      levels: { easy: 'Легко', medium: 'Середньо', hard: 'Складно', extreme: 'Екстрим' },
      categories: { action: 'Дія', question: 'Питання', game: 'Гра' },
      consent: 'Згода обовʼязкова',
      next: 'Далі',
      shuffle: 'Перемішати',
      start: 'Старт',
    },
  },
  en: {
    translation: {
      appName: 'Zagrava',
      play: 'Play',
      settings: 'Settings',
      levels: { easy: 'Easy', medium: 'Medium', hard: 'Hard', extreme: 'Extreme' },
      categories: { action: 'Action', question: 'Question', game: 'Game' },
      consent: 'Consent required',
      next: 'Next',
      shuffle: 'Shuffle',
      start: 'Start',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'ua',
  fallbackLng: 'ua',
  interpolation: { escapeValue: false },
})

export default i18n

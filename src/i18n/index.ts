import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'

// NOTE: am (Amharic) and om (Oromo) intentionally fall back to English for now.
// Populate src/i18n/am.json and src/i18n/om.json with real translations
// (reviewed by a native speaker) before store submission — machine
// translations were deliberately not shipped here to avoid wrong copy.
void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n

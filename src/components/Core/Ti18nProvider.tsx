'use client'

import type { TranslationKey } from '@/types/i18n'

import de from '@/resources/i18n/de.json'
import en from '@/resources/i18n/en.json'

import { TRANSLATION_KEYS } from '@/types/i18n'

import { Ti18n, ti18n } from '@zealsprince/ti18n'
import { createContext, useContext } from 'react'

// Locale provider for easily accessing the locale in the app
const Ti18nContext = createContext<Ti18n<TranslationKey>>(ti18n)

export const useTi18n = () => useContext(Ti18nContext)

export function LocaleProvider({ locale, children }: { locale: string | null, children: any }) {
  const i18n = new Ti18n<TranslationKey>({ keys: TRANSLATION_KEYS })
  i18n.loadLocales({
    de,
    en,
  })
  i18n.setLanguage(locale || 'en')

  return (
    <Ti18nContext.Provider value={i18n}>
      {children}
    </Ti18nContext.Provider>
  )
}

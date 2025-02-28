'use client'

import type { Key } from '@/types/i18n'

import de from '@/resources/i18n/de.json'
import en from '@/resources/i18n/en.json'
import keys from '@/resources/i18n/keys.json'

import { Ti18n, ti18n } from '@zealsprince/ti18n'
import { createContext, useContext } from 'react'

// Locale provider for easily accessing the locale in the app
const LocaleContext = createContext<Ti18n<Key>>(ti18n)

export const useLocale = () => useContext(LocaleContext)

export function LocaleProvider({ locale, children }: { locale: string | null, children: any }) {
  const i18n = new Ti18n<Key>({ keys: keys as Key[] })
  i18n.loadLocales({
    de,
    en,
  })
  i18n.setLanguage(locale || 'en')

  return (
    <LocaleContext.Provider value={i18n}>
      {children}
    </LocaleContext.Provider>
  )
}

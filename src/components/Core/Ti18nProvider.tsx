import type { TranslationKey } from '@/types/i18n'

import { Ti18n, ti18n } from '@zealsprince/ti18n'
import { createContext, useContext, useMemo } from 'react'

import de from '@/resources/i18n/de.json'

import en from '@/resources/i18n/en.json'
import { TRANSLATION_KEYS } from '@/types/i18n'

// Locale provider for easily accessing the locale in the app
const Ti18nContext = createContext<Ti18n<TranslationKey>>(ti18n)

export const useTi18n = () => useContext(Ti18nContext)

export function LocaleProvider({ locale, children }: { readonly locale: string | null, readonly children: any }) {
  const i18n = useMemo(() => {
    const instance = new Ti18n<TranslationKey>({ keys: Array.from(TRANSLATION_KEYS) })
    instance.loadLocales({
      de,
      en,
    })
    instance.setLanguage(locale ?? 'en')
    return instance
  }, [locale])

  return (
    <Ti18nContext.Provider value={i18n}>
      {children}
    </Ti18nContext.Provider>
  )
}

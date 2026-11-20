import { useAsyncStorage, useColorScheme } from 'react-native';
import { useEffect, useState, createContext, useContext } from 'react';
import * as Localization from 'expo-localization';
import en from './en/translations';
import ptBR from './pt-BR/translations';

export type Language = 'en' | 'pt-BR';

type TranslationKeys = keyof typeof en;

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

function detectInitialLanguage(): Language {
  const locale = Localization.locale;
  if (locale.startsWith('pt')) {
    return 'pt-BR';
  }
  return 'en';
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);
  const [translations] = useState(() => ({
    en,
    'pt-BR': ptBR,
  }));
  const [t] = useState(() => {
    const current = translations[language];
    return (key: TranslationKeys) => current[key] ?? key;
  });

  useEffect(() => {
    const subscription = Localization.addEventListener('change', (e: { locale: string }) => {
      const detected = e.locale.startsWith('pt') ? 'pt-BR' : 'en';
      setLanguageState(detected);
    });
    return () => subscription.remove();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return ctx;
}

export { en, ptBR };
export type { TranslationKeys };

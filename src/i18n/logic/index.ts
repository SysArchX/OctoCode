import { useTranslation } from '../index';
import enLogic from './en';
import ptBR from './pt-BR';

type LogicModule = typeof enLogic;

function getLogicModule(language: 'en' | 'pt-BR'): LogicModule {
  if (language === 'pt-BR') {
    return ptBR;
  }
  return enLogic;
}

/**
 * Hook that returns the correct logic keyword set for the active language.
 *
 * Rules:
 * - pt-BR  → Portugol (se / senao, enquanto, escreva, leia, ...)
 * - en     → International Standard Pseudocode (IF / ELSE, WHILE, PRINT, INPUT, ...)
 * - any other language falls back to en (International Standard Pseudocode).
 */
export function useLogic() {
  const { language } = useTranslation();
  const module = getLogicModule(language);
  return {
    keywords: module.LOGIC_KEYWORDS,
    example: module.LOGIC_EXAMPLE,
    explanation: module.LOGIC_EXPLANATION,
    isPortugol: language === 'pt-BR',
    isInternational: language !== 'pt-BR',
  };
}

export { enLogic, ptBR };
export type { LogicModule };

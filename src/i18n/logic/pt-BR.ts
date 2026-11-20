// Portugol keywords — used ONLY when the active language is pt-BR.

export const LOGIC_KEYWORDS = {
  SE: 'se',
  SENAO: 'senao',
  ENTAO: 'entao',
  FIMSE: 'fimse',

  ENQUANTO: 'enquanto',
  FIMENQUANTO: 'fimenquanto',

  PARA: 'para',
  FIMPARA: 'fimpara',

  ESCREVA: 'escreva',
  LEIA: 'leia',

  ATRIBUA: 'atribua',
  IGUAL: '=',

  VERDADEIRO: 'verdadeiro',
  FALSO: 'falso',

  IGUALDADE: '=',
  DIFERENTE: '<>',
  MAIOR: '>',
  MENOR: '<',
  MAIOR_IGUAL: '>=',
  MENOR_IGUAL: '<=',
} as const;

export const LOGIC_EXAMPLE = `atribua pontuacao = 85
se pontuacao >= 70 entao
  escreva "Aprovado"
senao
  escreva "Tente Novamente"
fimse`;

export const LOGIC_EXPLANATION =
  'Este exemplo usa Portugol. A palavra-chave "se" inicia uma condicional; "senao" trata o caminho alternativo; "escreva" exibe um valor na tela; "leia" lê a entrada do usuário; "enquanto" repete um bloco enquanto uma condição for verdadeira; "para" itera um número determinado de vezes.';

export { LOGIC_KEYWORDS as default };

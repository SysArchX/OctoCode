// International Standard Pseudocode keywords — used when language is NOT pt-BR
// (i.e., en and any other locale).

export const LOGIC_KEYWORDS = {
  // Conditional
  IF: 'IF',
  ELSE: 'ELSE',
  THEN: 'THEN',
  ENDIF: 'END IF',

  // Loop
  WHILE: 'WHILE',
  ENDWHILE: 'END WHILE',
  FOR: 'FOR',
  ENDFOR: 'END FOR',

  // I/O
  PRINT: 'PRINT',
  INPUT: 'INPUT',

  // Assignment
  LET: 'LET',
  EQUALS: '=',

  // Boolean literals
  TRUE: 'TRUE',
  FALSE: 'FALSE',

  // Comparison
  EQ: '=',
  NEQ: '<>',
  GT: '>',
  LT: '<',
  GTE: '>=',
  LTE: '<=',
} as const;

export const LOGIC_EXAMPLE = `LET score = 85
IF score >= 70 THEN
  PRINT "Pass"
ELSE
  PRINT "Try Again"
END IF`;

export const LOGIC_EXPLANATION =
  'This example uses International Standard Pseudocode. The IF keyword starts a conditional; ELSE handles the alternative path; PRINT outputs a value to the screen; INPUT reads user input; WHILE repeats a block while a condition holds; FOR iterates a known number of times.';

export { LOGIC_KEYWORDS as default };

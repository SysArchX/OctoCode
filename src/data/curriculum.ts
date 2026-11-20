export type TrackId = "python" | "javascript" | "linux" | "hacking";

export type TrackIcon = "code" | "file-text" | "terminal" | "shield";

export interface Track {
  id: TrackId;
  name: string;
  short: string;
  tagline: string;
  color: string;
  soft: string;
  icon: TrackIcon;
}

export type Exercise =
  | {
      id: string;
      type: "choice";
      prompt: string;
      code?: string;
      options: string[];
      answer: number;
      explain: string;
    }
  | {
      id: string;
      type: "blank";
      prompt: string;
      template: string;
      accepts: string[];
      placeholder?: string;
      explain: string;
    }
  | {
      id: string;
      type: "order";
      prompt: string;
      lines: string[];
      explain: string;
    }
  | {
      id: string;
      type: "bug";
      prompt: string;
      lines: string[];
      buggy: number;
      explain: string;
    };

export interface Theory {
  title: string;
  intro: string;
  points: string[];
  code?: string;
  tip?: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  summary: string;
  minutes: number;
  source: string;
  theory: Theory;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  index: number;
  title: string;
  description: string;
  track?: TrackId;
  lessons: Lesson[];
}

export const tracks: Track[] = [
  {
    id: "python",
    name: "Python",
    short: "Python",
    tagline: "Automação, dados e backend",
    color: "#3776AB",
    soft: "#E8F1FA",
    icon: "code",
  },
  {
    id: "javascript",
    name: "JavaScript",
    short: "JS",
    tagline: "Web, interfaces e produto",
    color: "#8A6D00",
    soft: "#FBF6D8",
    icon: "file-text",
  },
  {
    id: "linux",
    name: "Linux & Terminal",
    short: "Linux",
    tagline: "OctoCoreOS, do shell ao root",
    color: "#A16207",
    soft: "#FDF4D6",
    icon: "terminal",
  },
  {
    id: "hacking",
    name: "Ethical Hacking",
    short: "Hacking",
    tagline: "Segurança ofensiva com ética",
    color: "#B91C1C",
    soft: "#FBE7E7",
    icon: "shield",
  },
];

const logicUnit: Unit = {
  id: "logic",
  index: 1,
  title: "Fundamentos da Lógica",
  description: "Variáveis, decisões e repetições: a base de toda linguagem.",
  lessons: [
    {
      id: "logic-1",
      unitId: "logic",
      title: "Variáveis e Memória",
      summary: "Guarde valores com nomes claros e entenda o que a memória faz.",
      minutes: 4,
      source: "Python Docs · Lexical analysis",
      theory: {
        title: "Uma variável é um apelido para a memória",
        intro:
          "Um nome de variável aponta para um valor guardado na memória. O sinal de igual não compara: ele guarda. Vamos ver isso primeiro em Portugol, a linguagem de lógica que todo brasileiro usa para aprender, e depois em Python.",
        points: [
          "Em Portugol usamos `<-` para guardar: `idade <- 25`.",
          "`=` atribui um valor; `==` compara dois valores.",
          "O tipo do valor define o que você pode fazer com ele (`inteiro`, `real`, `cadeia`, `logico`).",
          "Nomes claros evitam bugs difíceis depois.",
        ],
        code: '// Portugol\ninteiro idade <- 25\ncadeia nome <- "Ana"\nreal media <- 8.5\nlogico aprovado <- verdadeiro\n\n# Python\nidade = 25\nnome = "Ana"\nmedia = 8.5\naprovado = True',
        tip: "Leia `idade <- 25` e `idade = 25` como “idade recebe 25”."
      },
      exercises: [
        {
          id: "logic-1-e1",
          type: "choice",
          prompt: "O que uma variável guarda?",
          options: [
            "Um valor na memória do programa",
            "Um arquivo do sistema operacional",
            "Uma senha do computador",
            "Um endereço de site",
          ],
          answer: 0,
          explain:
            "A variável é um nome que aponta para um valor na memória. Ela não guarda arquivos nem senhas.",
        },
        {
          id: "logic-1-e2",
          type: "blank",
          prompt: "Complete para guardar o número 10 na variável pontos:",
          template: "pontos __ 10",
          accepts: ["="],
          placeholder: "operador",
          explain: "O sinal `=` atribui o valor 10 à variável pontos.",
        },
        {
          id: "logic-1-e3",
          type: "choice",
          prompt: 'Qual é o tipo do valor "42" (entre aspas)?',
          options: ["Texto (string)", "Número inteiro", "Booleano", "Lista"],
          answer: 0,
          explain:
            "Com aspas, o valor é texto. Sem aspas, 42 seria um número inteiro e poderia ser somado.",
        },
        {
          id: "logic-1-e4",
          type: "order",
          prompt: "Ordene as linhas para ler um nome e exibir uma saudação.",
          lines: ["nome = input()", "saudacao = 'Olá, ' + nome", "print(saudacao)"],
          explain:
            "Primeiro lemos a entrada, depois montamos o texto e só no final mostramos o resultado.",
        },
      ],
    },
    {
      id: "logic-2",
      unitId: "logic",
      title: "Decisões com if/else",
      summary: "Faça o programa escolher caminhos diferentes.",
      minutes: 5,
      source: "Python Docs · Compound statements",
      theory: {
        title: "O programa escolhe um caminho",
        intro:
          "Um bloco `if` executa apenas quando a condição é verdadeira. O `else` cobre o caso contrário. A indentação define o que pertence ao bloco.",
        points: [
          "Comparações usam `==`, `!=`, `>`, `>=`, `<`, `<=`.",
          "A indentação não é estilo: ela muda o significado do código.",
          "Encadeie com `elif` para testar várias condições em ordem.",
        ],
        code: '// Portugol\nse (nota >= 7) {\n    escreva("aprovado")\n} senao {\n    escreva("recuperacao")\n}\n\n# Python\nnota = 8\nif nota >= 7:\n    print("aprovado")\nelse:\n    print("recuperação")',
        tip: "Só o primeiro caminho verdadeiro executa — em Portugol ou em Python.",
      },
      exercises: [
        {
          id: "logic-2-e1",
          type: "choice",
          prompt: "O que este código mostra na tela?",
          code: 'idade = 20\nif idade >= 18:\n    print("maior")\nelse:\n    print("menor")',
          options: ["maior", "menor", "maior e menor", "Nada"],
          answer: 0,
          explain: "20 é maior ou igual a 18, então o bloco do `if` executa.",
        },
        {
          id: "logic-2-e2",
          type: "blank",
          prompt: "Complete a condição para que o bloco execute quando a nota for 7 ou mais:",
          template: "if nota __ 7:",
          accepts: [">="],
          placeholder: "operador",
          explain: "`>=` significa maior ou igual, incluindo o próprio 7.",
        },
        {
          id: "logic-2-e3",
          type: "bug",
          prompt: "Encontre a linha que impede o código de rodar.",
          lines: ["nota = 8", "if nota = 7:", "    print('sete')"],
          buggy: 1,
          explain: "`=` atribui; para comparar usamos `==`. O correto é `if nota == 7:`.",
        },
      ],
    },
    {
      id: "logic-3",
      unitId: "logic",
      title: "Repetições com loops",
      summary: "Execute o mesmo bloco várias vezes sem copiar código.",
      minutes: 5,
      source: "Python Docs · The for statement",
      theory: {
        title: "Repita sem duplicar",
        intro:
          "`for` percorre uma sequência conhecida. `while` repete enquanto a condição for verdadeira. Todo `while` precisa de algo que o faça terminar.",
        points: [
          "`range(3)` gera 0, 1 e 2 — o fim é exclusivo.",
          "Atualize a variável de controle dentro do `while`, senão o laço nunca termina.",
          "Loops economizam linhas e deixam a intenção clara.",
        ],
        code: "// Portugol\npara (inteiro i <- 0; i < 3; i++) {\n    escreva(i)\n}\n\n# Python\nfor i in range(3):\n    print(i)",
        tip: "Se o loop não termina, procure a variável que nunca muda.",
      },
      exercises: [
        {
          id: "logic-3-e1",
          type: "choice",
          prompt: "O que este laço imprime?",
          code: "for i in range(3):\n    print(i)",
          options: ["0, 1, 2", "1, 2, 3", "0, 1, 2, 3", "3"],
          answer: 0,
          explain: "`range(3)` começa em 0 e para antes do 3, então imprime 0, 1 e 2.",
        },
        {
          id: "logic-3-e2",
          type: "blank",
          prompt: "Complete o laço para repetir exatamente 5 vezes:",
          template: "for i in range(__):",
          accepts: ["5"],
          placeholder: "número",
          explain: "`range(5)` gera cinco valores: 0 a 4.",
        },
        {
          id: "logic-3-e3",
          type: "bug",
          prompt: "Encontre a linha com erro de estrutura.",
          lines: ["i = 0", "while i < 3:", "print(i)", "    i += 1"],
          buggy: 2,
          explain:
            "A linha `print(i)` está fora do bloco. Ela precisa de quatro espaços de indentação para repetir junto com `i += 1`.",
        },
      ],
    },
  ],
};

function syntaxUnit(track: TrackId, title: string, description: string, lessons: Lesson[]): Unit {
  return { id: `syntax-${track}`, index: 2, title, description, track, lessons };
}

function projectUnit(track: TrackId, title: string, description: string, lessons: Lesson[]): Unit {
  return { id: `project-${track}`, index: 3, title, description, track, lessons };
}

const pythonSyntax = syntaxUnit(
  "python",
  "Sintaxe e Prática em Python",
  "Entrada, saída, listas e funções com código real.",
  [
    {
      id: "python-1",
      unitId: "syntax-python",
      title: "Entrada, saída e tipos",
      summary: "Leia dados do usuário e formate a resposta.",
      minutes: 6,
      source: "Python Docs · Built-in Functions",
      theory: {
        title: "Conversa com o usuário",
        intro:
          "`input()` sempre devolve texto. Para calcular, converta com `int()` ou `float()`. `f-strings` montam textos legíveis.",
        points: [
          "`int('18')` vira o número 18.",
          '`f"Total: {preco:.2f}"` formata com duas casas decimais.',
          "`type(valor)` mostra o tipo em tempo de execução.",
        ],
        code: 'nome = input("Seu nome: ")\nidade = int(input("Idade: "))\nprint(f"{nome} tem {idade} anos")',
        tip: "Somar input sem converter gera concatenação de texto, não soma.",
      },
      exercises: [
        {
          id: "python-1-e1",
          type: "choice",
          prompt: "O que este código imprime?",
          code: 'preco = 19.9\nprint(f"Total: {preco:.2f}")',
          options: ["Total: 19.90", "Total: 19.9", "Total: {preco}", "Erro de sintaxe"],
          answer: 0,
          explain: "`:.2f` força duas casas decimais no número.",
        },
        {
          id: "python-1-e2",
          type: "blank",
          prompt: "Complete a conversão para poder somar a idade digitada:",
          template: 'idade = __(input("Idade: "))',
          accepts: ["int"],
          placeholder: "função",
          explain: "`input` devolve texto; `int` converte para número inteiro.",
        },
      ],
    },
    {
      id: "python-2",
      unitId: "syntax-python",
      title: "Listas e funções",
      summary: "Organize dados e reaproveite código com funções.",
      minutes: 7,
      source: "Python Docs · Data Structures",
      theory: {
        title: "Agrupe dados, nomeie ações",
        intro:
          "Listas guardam uma sequência ordenada. Funções transformam um bloco de código em algo reutilizável, com parâmetros e retorno.",
        points: [
          "`lista.append(x)` adiciona no fim; índices começam em 0.",
          "`def nome(parametro):` declara uma função.",
          "`return` devolve o resultado para quem chamou.",
        ],
        code: "def media(notas):\n    return sum(notas) / len(notas)\n\nprint(media([7, 9, 10]))",
        tip: "Sem `return`, a função devolve `None`.",
      },
      exercises: [
        {
          id: "python-2-e1",
          type: "choice",
          prompt: "Qual é o valor de `notas[1]`?",
          code: "notas = [7, 9, 10]",
          options: ["7", "9", "10", "Erro de índice"],
          answer: 1,
          explain: "O primeiro índice é 0, então `notas[1]` é o segundo item: 9.",
        },
        {
          id: "python-2-e2",
          type: "blank",
          prompt: "Complete a função para devolver o resultado:",
          template: "def dobro(n):\n    __ n * 2",
          accepts: ["return"],
          placeholder: "palavra-chave",
          explain: "`return` envia o valor de volta para quem chamou a função.",
        },
      ],
    },
  ],
);

const jsSyntax = syntaxUnit(
  "javascript",
  "Sintaxe e Prática em JavaScript",
  "Variáveis, template strings, arrays e funções modernas.",
  [
    {
      id: "javascript-1",
      unitId: "syntax-javascript",
      title: "const, let e template strings",
      summary: "Declare variáveis com intenção e monte textos legíveis.",
      minutes: 6,
      source: "MDN · let, const e template literals",
      theory: {
        title: "Escolha a declaração certa",
        intro:
          "`const` cria uma ligação que não pode ser reatribuída. `let` permite mudar o valor. Template strings usam crases e `${}`.",
        points: [
          "Prefira `const` por padrão; use `let` quando o valor muda.",
          "`${}` interpola expressões dentro de crases.",
          "`console.log()` é a janela para o que está acontecendo.",
        ],
        code: "const nome = 'Ana'\nlet pontos = 0\npontos += 10\nconsole.log(`${nome}: ${pontos} pontos`)",
        tip: "Objetos `const` ainda podem ter propriedades alteradas.",
      },
      exercises: [
        {
          id: "javascript-1-e1",
          type: "choice",
          prompt: "O que aparece no console?",
          code: "let x = 2\nx += 3\nconsole.log(`x = ${x}`)",
          options: ["x = 2", "x = 3", "x = 5", "x = 23"],
          answer: 2,
          explain: "`x += 3` soma 3 ao valor atual, resultando em 5.",
        },
        {
          id: "javascript-1-e2",
          type: "blank",
          prompt: "Complete a interpolação do nome na template string:",
          template: "console.log(`Olá, __{nome}`)",
          accepts: ["$"],
          placeholder: "símbolo",
          explain: "A sintaxe é `${expressao}`, com cifrão antes das chaves.",
        },
      ],
    },
    {
      id: "javascript-2",
      unitId: "syntax-javascript",
      title: "Funções e arrays",
      summary: "Transforme listas com arrow functions e métodos de array.",
      minutes: 7,
      source: "MDN · Array.prototype.map, filter",
      theory: {
        title: "Dados entram, resultado sai",
        intro:
          "`map` transforma cada item, `filter` seleciona itens e `reduce` acumula um resultado. Arrow functions deixam a intenção curta.",
        points: [
          "`const dobrar = (n) => n * 2` é uma arrow function.",
          "`filter` recebe uma condição e devolve um novo array.",
          "`map` devolve um array do mesmo tamanho, com itens transformados.",
        ],
        code: "const numeros = [1, 2, 3, 4]\nconst pares = numeros.filter((n) => n % 2 === 0)\nconst dobrados = pares.map((n) => n * 2)",
        tip: "`map` e `filter` não alteram o array original.",
      },
      exercises: [
        {
          id: "javascript-2-e1",
          type: "choice",
          prompt: "Qual é o resultado de `pares`?",
          code: "const numeros = [1, 2, 3, 4]\nconst pares = numeros.filter((n) => n % 2 === 0)",
          options: ["[1, 3]", "[2, 4]", "[1, 2, 3, 4]", "[4, 2]"],
          answer: 1,
          explain: "`filter` mantém apenas os itens em que a condição é verdadeira: 2 e 4.",
        },
        {
          id: "javascript-2-e2",
          type: "blank",
          prompt: "Complete a arrow function que dobra um número:",
          template: "const dobrar = (n) __ n * 2",
          accepts: ["=>"],
          placeholder: "operador",
          explain: "A seta `=>` liga os parâmetros ao corpo da função.",
        },
      ],
    },
  ],
);

const linuxSyntax = syntaxUnit(
  "linux",
  "Sintaxe e Prática no Terminal",
  "Navegue, crie arquivos e leia permissões com confiança.",
  [
    {
      id: "linux-1",
      unitId: "syntax-linux",
      title: "Navegando no OctoCoreOS",
      summary: "pwd, ls e cd: oriente-se em qualquer servidor.",
      minutes: 6,
      source: "Linux man pages · pwd(1), ls(1), cd(1)",
      theory: {
        title: "O terminal não tem janelas",
        intro:
          "Você sempre está em um diretório. `pwd` mostra onde está, `ls` lista o conteúdo e `cd` muda de diretório. `~` é a sua pasta pessoal.",
        points: [
          "`cd ..` sobe um nível; `cd ~` volta para a home.",
          "`ls -la` mostra arquivos ocultos e permissões.",
          "Caminhos absolutos começam com `/`; relativos partem do diretório atual.",
        ],
        code: "pwd\nls -la\ncd /var/log\ncd ~",
        tip: "Use Tab para completar caminhos e evitar erros de digitação.",
      },
      exercises: [
        {
          id: "linux-1-e1",
          type: "choice",
          prompt: "Qual comando mostra o diretório em que você está?",
          options: ["pwd", "ls", "cd", "whoami"],
          answer: 0,
          explain: "`pwd` significa print working directory.",
        },
        {
          id: "linux-1-e2",
          type: "order",
          prompt: "Ordene os comandos para ir até /etc e listar os arquivos.",
          lines: ["cd /etc", "pwd", "ls -la"],
          explain: "Primeiro entre no diretório, confirme com `pwd` e então liste o conteúdo.",
        },
      ],
    },
    {
      id: "linux-2",
      unitId: "syntax-linux",
      title: "Arquivos e permissões",
      summary: "Leia, escreva e proteja arquivos com chmod e grep.",
      minutes: 7,
      source: "Linux man pages · chmod(1), grep(1)",
      theory: {
        title: "Permissões são a primeira defesa",
        intro:
          "Cada arquivo tem permissões para dono, grupo e outros. `chmod` altera esses bits; `grep` busca padrões dentro de arquivos.",
        points: [
          "`chmod 600` deixa o arquivo legível e gravável apenas pelo dono.",
          "`grep -i erro app.log` busca sem diferenciar maiúsculas.",
          "`>` sobrescreve, `>>` acrescenta ao final do arquivo.",
        ],
        code: "touch notas.txt\necho 'estudar linux' >> notas.txt\ngrep -i linux notas.txt\nchmod 600 notas.txt",
        tip: "`ls -l` traduz permissões: r leitura, w escrita, x execução.",
      },
      exercises: [
        {
          id: "linux-2-e1",
          type: "choice",
          prompt: "O que `chmod 600 segredo.txt` permite?",
          options: [
            "Apenas o dono lê e escreve",
            "Todos leem e escrevem",
            "Todos executam o arquivo",
            "Ninguém acessa o arquivo",
          ],
          answer: 0,
          explain: "6 = leitura + escrita para o dono; 0 para grupo e outros.",
        },
        {
          id: "linux-2-e2",
          type: "blank",
          prompt: "Complete para acrescentar uma linha sem apagar o conteúdo:",
          template: "echo 'nova linha' __ notas.txt",
          accepts: [">>"],
          placeholder: "operador",
          explain: "`>>` acrescenta. `>` sozinho apagaria o conteúdo anterior.",
        },
      ],
    },
  ],
);

const hackingSyntax = syntaxUnit(
  "hacking",
  "Fundamentos de Segurança Ofensiva",
  "Reconhecimento ético, superfície de ataque e análise.",
  [
    {
      id: "hacking-1",
      unitId: "syntax-hacking",
      title: "Mentalidade e escopo",
      summary: "Pense como atacante, aja com autorização.",
      minutes: 6,
      source: "OWASP · Testing Guide",
      theory: {
        title: "Sem escopo, não existe teste",
        intro:
          "Ethical hacking começa com autorização escrita e escopo definido. O objetivo é encontrar falhas antes que alguém mal-intencionado o faça.",
        points: [
          "Nunca teste sistemas sem permissão explícita. Isso é crime.",
          "Reconhecimento passivo usa informação pública e não toca no alvo.",
          "Documente evidências, impacto e passos de reprodução.",
        ],
        code: "# Fluxo de um teste autorizado\n1. Escopo assinado\n2. Reconhecimento passivo\n3. Varredura controlada\n4. Evidências e relatório",
        tip: "Reportar uma falha com responsabilidade vale mais que explorá-la.",
      },
      exercises: [
        {
          id: "hacking-1-e1",
          type: "choice",
          prompt: "Qual é o primeiro passo antes de qualquer teste de intrusão?",
          options: [
            "Obter autorização e definir o escopo",
            "Rodar um scanner na internet inteira",
            "Baixar ferramentas pagas",
            "Explorar o primeiro serviço que encontrar",
          ],
          answer: 0,
          explain: "Autorização e escopo separam ethical hacking de atividade criminosa.",
        },
        {
          id: "hacking-1-e2",
          type: "choice",
          prompt: "O que é reconhecimento passivo?",
          options: [
            "Coletar informação pública sem interagir com o alvo",
            "Enviar pacotes maliciosos ao servidor",
            "Quebrar senhas por força bruta",
            "Alterar arquivos do sistema",
          ],
          answer: 0,
          explain: "Reconhecimento passivo usa fontes públicas e mantém o alvo intocado.",
        },
      ],
    },
    {
      id: "hacking-2",
      unitId: "syntax-hacking",
      title: "Redes, portas e serviços",
      summary: "Entenda como um serviço exposto vira superfície de ataque.",
      minutes: 7,
      source: "OWASP · Attack Surface Analysis",
      theory: {
        title: "Toda porta aberta conta uma história",
        intro:
          "Um host expõe serviços em portas. Identificar versões e configurações é o que permite avaliar risco — não apenas listar portas.",
        points: [
          "22 SSH, 80 HTTP, 443 HTTPS, 3306 MySQL são portas comuns.",
          "`nmap -sV host` identifica serviços e versões, dentro do escopo.",
          "Serviço desnecessário aberto é superfície de ataque desnecessária.",
        ],
        code: "nmap -sV 10.0.0.5\nnmap -p 22,80,443 10.0.0.5",
        tip: "Versão antiga + configuração padrão = risco alto.",
      },
      exercises: [
        {
          id: "hacking-2-e1",
          type: "choice",
          prompt: "Qual porta é usada por HTTPS por padrão?",
          options: ["443", "80", "22", "21"],
          answer: 0,
          explain: "HTTPS usa 443; HTTP usa 80; SSH usa 22; FTP usa 21.",
        },
        {
          id: "hacking-2-e2",
          type: "blank",
          prompt: "Complete o comando que identifica serviços e versões:",
          template: "nmap __ 10.0.0.5",
          accepts: ["-sV", "-sv"],
          placeholder: "flag",
          explain: "`-sV` ativa a detecção de versão dos serviços.",
        },
      ],
    },
  ],
);

const pythonProject = projectUnit(
  "python",
  "Projeto Final",
  "Gerador e validador de senhas seguras.",
  [
    {
      id: "python-project",
      unitId: "project-python",
      title: "Gerador de Senhas Seguras",
      summary: "Um script real, com entropia, regras e teste.",
      minutes: 12,
      source: "Python Docs · secrets module",
      theory: {
        title: "Projeto: sua primeira ferramenta real",
        intro:
          "Você vai montar um gerador que usa aleatoriedade segura, garante variedade de caracteres e valida a força da senha gerada.",
        points: [
          "`secrets` é a biblioteca correta para senhas; `random` não é criptograficamente seguro.",
          "Garanta ao menos uma letra, um número e um símbolo.",
          "Sempre valide o resultado antes de considerar pronto.",
        ],
        code: "import secrets\nimport string\n\nalfabeto = string.ascii_letters + string.digits + '!@#$%&*'\n\ndef gerar(tamanho=16):\n    return ''.join(secrets.choice(alfabeto) for _ in range(tamanho))\n\nprint(gerar())",
        tip: "Ferramenta pronta é ferramenta testada com casos difíceis.",
      },
      exercises: [
        {
          id: "python-project-e1",
          type: "choice",
          prompt: "Por que usar `secrets` em vez de `random` para senhas?",
          options: [
            "`secrets` usa aleatoriedade criptograficamente segura",
            "`random` é mais lento",
            "`secrets` gera senhas mais curtas",
            "Não existe diferença prática",
          ],
          answer: 0,
          explain: "`secrets` foi projetado para tokens e senhas, com fonte de entropia adequada.",
        },
        {
          id: "python-project-e2",
          type: "choice",
          prompt: "Qual senha é mais forte?",
          options: ["Tr0v4o!Forte#92", "senha123", "12345678", "qwerty"],
          answer: 0,
          explain: "Comprimento + variedade + ausência de padrões óbvios aumentam a entropia.",
        },
      ],
    },
  ],
);

const jsProject = projectUnit(
  "javascript",
  "Projeto Final",
  "Medidor de força de senha no navegador.",
  [
    {
      id: "javascript-project",
      unitId: "project-javascript",
      title: "Medidor de Força de Senha",
      summary: "Lógica real de validação rodando no navegador.",
      minutes: 12,
      source: "MDN · Regular expressions",
      theory: {
        title: "Projeto: transformar regra em função",
        intro:
          "Você vai escrever uma função pura que recebe uma senha e devolve uma pontuação com rótulo, pronta para ligar em qualquer interface.",
        points: [
          "Funções puras são fáceis de testar: mesma entrada, mesma saída.",
          "Use expressões booleanas somadas para pontuar critérios.",
          "Nunca mostre a senha em logs.",
        ],
        code: "const criterios = [\n  (s) => s.length >= 12,\n  (s) => /[0-9]/.test(s),\n  (s) => /[A-Z]/.test(s),\n  (s) => /[^A-Za-z0-9]/.test(s),\n]\n\nconst forca = (senha) =>\n  ['Fraca', 'Média', 'Boa', 'Forte', 'Excelente'][\n    criterios.filter((teste) => teste(senha)).length\n  ]",
        tip: "Um bom medidor orienta o usuário, não apenas julga.",
      },
      exercises: [
        {
          id: "javascript-project-e1",
          type: "choice",
          prompt: "O que caracteriza uma função pura?",
          options: [
            "Mesma entrada gera mesma saída e não altera nada externo",
            "Usa `console.log` em todas as linhas",
            "Só pode ser chamada uma vez",
            "Precisa de uma API externa",
          ],
          answer: 0,
          explain: "Sem efeitos colaterais e com resultado previsível, o teste fica simples.",
        },
        {
          id: "javascript-project-e2",
          type: "blank",
          prompt: "Complete a condição que exige pelo menos 12 caracteres:",
          template: "if (senha.length __ 12) pontos++",
          accepts: [">="],
          placeholder: "operador",
          explain: "`>=` inclui exatamente 12 caracteres.",
        },
      ],
    },
  ],
);

const linuxProject = projectUnit(
  "linux",
  "Projeto Final",
  "Script de auditoria de arquivos.",
  [
    {
      id: "linux-project",
      unitId: "project-linux",
      title: "Auditoria de Arquivos",
      summary: "Encontre permissões perigosas com um script real.",
      minutes: 12,
      source: "Linux man pages · find(1)",
      theory: {
        title: "Projeto: automatizar uma auditoria",
        intro:
          "Você vai combinar `find`, `ls` e `grep` em um script que lista arquivos graváveis por todos e registra o resultado.",
        points: [
          "Permissão `777` significa leitura, escrita e execução para todos.",
          "`find` filtra por permissão com `-perm`.",
          "Sempre teste scripts em uma pasta de exemplo antes de rodar no sistema inteiro.",
        ],
        code: '#!/usr/bin/env bash\nset -euo pipefail\n\nALVO="${1:-.}"\nRELATORIO="auditoria-$(date +%F).txt"\nfind "$ALVO" -type f -perm -o+w -print > "$RELATORIO"\necho "Relatório: $RELATORIO"',
        tip: "Um relatório com data e caminho é mais útil que uma lista solta.",
      },
      exercises: [
        {
          id: "linux-project-e1",
          type: "choice",
          prompt: "O que a permissão 777 concede?",
          options: [
            "Leitura, escrita e execução para todos",
            "Somente leitura para o dono",
            "Execução apenas para o root",
            "Nenhum acesso",
          ],
          answer: 0,
          explain: "Cada dígito 7 soma leitura + escrita + execução.",
        },
        {
          id: "linux-project-e2",
          type: "choice",
          prompt: "Qual comando encontra arquivos graváveis por qualquer usuário?",
          options: [
            "find . -type f -perm -o+w",
            "ls -la | grep root",
            "chmod 777 .",
            "cat /etc/passwd",
          ],
          answer: 0,
          explain: "`-perm -o+w` filtra arquivos com escrita para outros.",
        },
      ],
    },
  ],
);

const hackingProject = projectUnit(
  "hacking",
  "Projeto Final",
  "Analisador de logs de acesso.",
  [
    {
      id: "hacking-project",
      unitId: "project-hacking",
      title: "Analisador de Logs",
      summary: "Extraia sinais de ataque de um log real.",
      minutes: 12,
      source: "OWASP · Logging Cheat Sheet",
      theory: {
        title: "Projeto: do log ao insight",
        intro:
          "Logs de acesso registram IP, data e status. Um analisador conta tentativas falhas por IP para priorizar a investigação.",
        points: [
          "Status 401 e 403 indicam falha de autenticação e autorização.",
          "`awk` extrai colunas; `sort | uniq -c` conta ocorrências.",
          "Ordenar por frequência revela padrões de força bruta.",
        ],
        code: "awk '$9 == 401 {print $1}' access.log | sort | uniq -c | sort -rn | head -5",
        tip: "Nunca exponha IPs reais em relatórios públicos sem necessidade.",
      },
      exercises: [
        {
          id: "hacking-project-e1",
          type: "choice",
          prompt: "Qual status HTTP indica falha de autenticação?",
          options: ["401", "200", "301", "500"],
          answer: 0,
          explain: "401 Unauthorized indica credenciais ausentes ou inválidas.",
        },
        {
          id: "hacking-project-e2",
          type: "choice",
          prompt: "O que `sort | uniq -c` faz?",
          options: [
            "Conta quantas vezes cada linha aparece",
            "Apaga linhas duplicadas do arquivo",
            "Ordena arquivos por tamanho",
            "Compacta o log",
          ],
          answer: 0,
          explain: "`uniq -c` conta ocorrências consecutivas após `sort` agrupar linhas iguais.",
        },
      ],
    },
  ],
);

const unitsByTrack: Record<TrackId, Unit[]> = {
  python: [logicUnit, pythonSyntax, pythonProject],
  javascript: [logicUnit, jsSyntax, jsProject],
  linux: [logicUnit, linuxSyntax, linuxProject],
  hacking: [logicUnit, hackingSyntax, hackingProject],
};

export function getUnits(track: TrackId): Unit[] {
  return unitsByTrack[track] ?? unitsByTrack.python;
}

export function getTrack(id: TrackId): Track {
  return tracks.find((item) => item.id === id) ?? tracks[0];
}

export function getAllLessons(track?: TrackId): Lesson[] {
  if (track) return getUnits(track).flatMap((unit) => unit.lessons);
  const unique = new Map<string, Lesson>();
  Object.values(unitsByTrack)
    .flat()
    .forEach((unit) => unit.lessons.forEach((lesson) => unique.set(lesson.id, lesson)));
  return [...unique.values()];
}

export function findLesson(id: string): Lesson | undefined {
  return getAllLessons().find((lesson) => lesson.id === id);
}

export function findUnitOfLesson(lessonId: string): Unit | undefined {
  const unique = new Map<string, Unit>();
  Object.values(unitsByTrack)
    .flat()
    .forEach((unit) => unique.set(unit.id, unit));
  return [...unique.values()].find((unit) => unit.lessons.some((lesson) => lesson.id === lessonId));
}

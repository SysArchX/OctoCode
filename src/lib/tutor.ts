export const TUTOR_URL =
  process.env.EXPO_PUBLIC_TUTOR_URL ?? "http://163.176.170.31:4000";

export const OFF_TOPIC_REPLY =
  "Faça perguntas apenas sobre programação, Linux, cybersecurity ou sobre o exercício atual!";

const TOPIC_WORDS = [
  "codigo", "código", "programa", "programar", "programacao", "programação",
  "python", "javascript", "typescript", "java", "kotlin", "swift", "rust",
  "golang", "php", "ruby", "sql", "html", "css", "react", "node", "expo",
  "variavel", "variável", "funcao", "função", "funcoes", "loop", "while",
  "for", "if", "else", "array", "lista", "dicionario", "dicionário", "objeto",
  "classe", "heranca", "herança", "recursao", "recursão", "algoritmo",
  "logica", "lógica", "portugol", "compilador", "interpretador", "bug",
  "erro", "exception", "excecao", "exceção", "debug", "teste", "api",
  "json", "http", "servidor", "cliente", "banco de dados", "database",
  "sql", "select", "join", "git", "github", "terminal", "shell", "bash",
  "linux", "kernel", "processo", "permissao", "permissão", "chmod", "chown",
  "sudo", "root", "usuario", "usuário", "rede", "redes", "ip", "dns",
  "tcp", "udp", "porta", "nmap", "gobuster", "hydra", "sqlmap", "nikto",
  "hash", "criptografia", "seguranca", "segurança", "cybersecurity",
  "pentest", "vulnerabilidade", "exploit", "firewall", "vpn", "proxy",
  "owasp", "ctf", "hacking", "etico", "ético", "phishing", "malware",
  "memoria", "memória", "binario", "binário", "compilar", "sintaxe",
  "soma", "somar", "subtrair", "multiplicar", "dividir", "numero", "número",
  "texto", "palavra", "contar", "ordenar", "vetor", "matriz", "comparar",
  "condicao", "condição", "repetir", "imprimir", "entrada", "saida", "saída",
  "funcao", "retorno", "parametro", "parâmetro", "escopo", "classe", "metodo",
  "metodo", "ponteiro", "malloc", "buffer", "arquivo", "pasta", "diretorio",
  "diretório", "comando", "executar", "permissao", "instalar", "configurar",
  "shell", "script", "concorrencia", "concorrência", "thread", "assincrono",
  "assíncrono", "promise", "componente", "estado", "props", "tipo", "tipagem",
];

const OFF_TOPIC_WORDS = [
  "capivara", "animal", "animais", "cachorro", "gato", "receita", "cozinhar",
  "bolo", "pizza", "futebol", "jogo do brasil", "flamengo", "corinthians",
  "novela", "fofoca", "celebridade", "clima", "temperatura", "previsao do tempo",
  "horoscopo", "horóscopo", "signo", "namoro", "namorada", "namorado",
  "filme", "serie", "série", "netflix", "musica", "música", "cantor",
  "politica", "política", "eleicao", "eleição", "presidente", "receita de",
  "medicina", "remedio", "remédio", "doenca", "doença", "peso", "dieta",
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const normalizedTopics = TOPIC_WORDS.map(normalize);
const normalizedOffTopic = OFF_TOPIC_WORDS.map(normalize);

export function isOnTopic(question: string): boolean {
  const text = ` ${normalize(question)} `;
  const technical = normalizedTopics.some((word) => text.includes(word));
  if (technical) return true;
  const forbidden = normalizedOffTopic.some((word) => text.includes(word));
  if (forbidden) return false;
  return false;
}

export interface TutorSource {
  title: string;
  url: string;
}

export interface TutorReply {
  answer: string;
  model?: string;
  sources?: TutorSource[];
}

export async function askTutor(
  question: string,
  context?: string,
): Promise<TutorReply> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${TUTOR_URL}/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, context }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`servidor respondeu ${response.status}`);
    }
    const data = (await response.json()) as TutorReply;
    return {
      answer: String(data.answer ?? "").trim(),
      model: data.model,
      sources: Array.isArray(data.sources) ? data.sources : [],
    };
  } finally {
    clearTimeout(timer);
  }
}

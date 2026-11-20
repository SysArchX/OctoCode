import cors from "cors";
import express from "express";

const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 4000;
const API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1";
const DISCOVERY_INTERVAL = 6 * 60 * 60 * 1000;

const BASE_MODELS = [
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "openrouter/free",
];

const FALLBACK_MODEL = "openrouter/free";
const BIG_MODEL = /(405b|70b|72b|coder)/i;

let models = [...BASE_MODELS, FALLBACK_MODEL];
let lastDiscovery = 0;
let discovering = null;

async function discoverModels() {
  if (!API_KEY) return models;
  if (discovering) return discovering;
  if (Date.now() - lastDiscovery < DISCOVERY_INTERVAL) return models;

  discovering = (async () => {
    try {
      const response = await fetch(`${OPENROUTER_URL}/models`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`models respondeu ${response.status}`);
      const payload = await response.json();
      const free = (payload?.data ?? [])
        .map((model) => model.id)
        .filter((id) => typeof id === "string" && id.endsWith(":free"));

      const big = free.filter((id) => BIG_MODEL.test(id));
      const others = free.filter((id) => !BIG_MODEL.test(id) && id !== FALLBACK_MODEL);
      const merged = [...new Set([...BASE_MODELS, ...big, ...others, FALLBACK_MODEL])];
      models = merged;
      lastDiscovery = Date.now();
      console.log(`[OctoTutor] ${models.length} modelos gratuitos na cascata`);
    } catch (error) {
      console.warn(`[OctoTutor] descoberta de modelos falhou: ${error.message}`);
    } finally {
      discovering = null;
    }
    return models;
  })();

  return discovering;
}

async function chat(model, messages, { timeout = 4000, maxTokens = 700 } = {}) {
  const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://octocode.app",
      "X-Title": "OctoCode OctoTutor",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(timeout),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content || !String(content).trim()) throw new Error("resposta vazia");
  return String(content).trim();
}

async function askCascade(messages, options) {
  await discoverModels();
  for (const model of models) {
    try {
      const answer = await chat(model, messages, options);
      console.log(`[OctoTutor] Sucesso usando modelo: ${model}`);
      return { answer, model };
    } catch (error) {
      console.warn(`[OctoTutor] ${model} pulado: ${error.message}`);
    }
  }
  throw new Error("Nenhum modelo gratuito respondeu");
}

function extractLinks(html) {
  const results = [];
  const pattern = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  for (const match of html.matchAll(pattern)) {
    let href = match[1].replace(/&amp;/g, "&");
    const uddg = href.match(/uddg=([^&]+)/);
    if (uddg) href = decodeURIComponent(uddg[1]);
    if (!/^https?:/i.test(href)) continue;
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    if (results.some((item) => item.url === href)) continue;
    results.push({ title: title || href, url: href });
  }
  return results;
}

async function searchWeb(question) {
  let query = question;
  try {
    const rewritten = await askCascade(
      [
        {
          role: "system",
          content:
            "Rewrite the student question into a short technical search query in English. Return only the query, no quotes, max 12 words.",
        },
        { role: "user", content: question },
      ],
      { maxTokens: 40, timeout: 4000 },
    );
    query = rewritten.answer.replace(/["\n]/g, " ").trim().slice(0, 160) || question;
  } catch {
    query = question;
  }

  try {
    const response = await fetch(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; OctoCodeBot/1.0)" },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!response.ok) throw new Error(`duckduckgo ${response.status}`);
    const html = await response.text();
    const links = extractLinks(html).slice(0, 3);

    const sources = [];
    for (const link of links) {
      let excerpt = "";
      try {
        const reader = await fetch(`https://r.jina.ai/${link.url}`, {
          headers: { "User-Agent": "OctoCodeBot/1.0" },
          signal: AbortSignal.timeout(6000),
        });
        if (reader.ok) excerpt = (await reader.text()).slice(0, 1400);
      } catch {
        excerpt = "";
      }
      sources.push({ ...link, excerpt });
    }
    return { query, sources };
  } catch (error) {
    console.warn(`[OctoTutor] busca web falhou: ${error.message}`);
    return { query, sources: [] };
  }
}

/** Same rule as the app: off-topic questions are answered locally, before any
 *  search or model call, so they never spend a token. */
const OFF_TOPIC = [
  "capivara", "receita", "bolo", "pizza", "futebol", "flamengo", "corinthians",
  "novela", "fofoca", "celebridade", "horoscopo", "horóscopo", "signo", "namoro",
  "namorada", "namorado", "filme", "série", "serie", "netflix", "música", "musica",
  "cantor", "política", "politica", "eleição", "eleicao", "presidente", "dieta",
];

const OFF_TOPIC_REPLY =
  "Faça perguntas apenas sobre programação, Linux, cybersecurity ou sobre o exercício atual!";

function looksOffTopic(question) {
  const text = question.toLowerCase();
  return OFF_TOPIC.some((word) => text.includes(word));
}

const SYSTEM_PROMPT = `Você é o OctoAI, professor de programação, lógica, Linux e cybersecurity do app OctoCode.
Regras obrigatórias:
1. Responda em português do Brasil, direto, com no máximo 220 palavras.
2. NUNCA entregue o código pronto, a resposta final da questão, o comando exato pedido no exercício ou a alternativa correta. Explique o conceito, o porquê e como verificar sozinho.
3. Use as fontes fornecidas quando existirem e cite os links ao final em uma linha "Fontes:".
4. Se a pergunta estiver fora de programação, Linux, redes ou cybersecurity, recuse educadamente em uma frase.
5. Prefira exemplos genéricos e analogias curtas a soluções copiáveis.
6. Nunca invente APIs, comandos ou versões. Se não tiver certeza, diga o que consultar.`;

const rateBuckets = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 60 * 1000;

function rateLimited(ip) {
  const now = Date.now();
  const bucket = (rateBuckets.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW);
  if (bucket.length >= RATE_LIMIT) {
    rateBuckets.set(ip, bucket);
    return true;
  }
  bucket.push(now);
  rateBuckets.set(ip, bucket);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateBuckets) {
    const fresh = bucket.filter((time) => now - time < RATE_WINDOW);
    if (fresh.length === 0) rateBuckets.delete(ip);
    else rateBuckets.set(ip, fresh);
  }
}, 10 * 60 * 1000).unref?.();

const app = express();
app.use(cors({ origin: process.env.ALLOW_ORIGIN ?? "*" }));
app.use(express.json({ limit: "64kb" }));

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "octocode-tutor",
    models: models.length,
    hasKey: Boolean(API_KEY),
    uptime: Math.round(process.uptime()),
  });
});

app.post("/tutor", async (request, response) => {
  const ip = request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.ip || "unknown";
  if (rateLimited(ip)) {
    response.status(429).json({
      answer: "Limite de 20 perguntas por hora atingido. Volte daqui a pouco.",
      sources: [],
    });
    return;
  }

  const question = String(request.body?.question ?? "").trim();
  const context = String(request.body?.context ?? "").slice(0, 400);

  if (question.length < 4) {
    response.status(400).json({ answer: "Escreva uma pergunta um pouco mais completa.", sources: [] });
    return;
  }
  if (question.length > 800) {
    response.status(400).json({ answer: "Pergunta muito longa. Resuma em até 800 caracteres.", sources: [] });
    return;
  }
  if (looksOffTopic(question)) {
    response.json({ answer: OFF_TOPIC_REPLY, sources: [] });
    return;
  }
  if (!API_KEY) {
    response.status(503).json({
      answer: "O servidor do OctoAI está sem a chave de acesso configurada.",
      sources: [],
    });
    return;
  }

  try {
    const { query, sources } = await searchWeb(question);
    const referenceBlock = sources.length
      ? sources
          .map(
            (source, index) =>
              `[${index + 1}] ${source.title}\nURL: ${source.url}\nTrecho: ${source.excerpt || "(sem trecho)"}`,
          )
          .join("\n\n")
      : "(nenhuma fonte externa encontrada, responda com teoria fundamental)";

    const { answer, model } = await askCascade(
      [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Pergunta do aluno: ${question}\nContexto do app: ${context || "nenhum"}\nConsulta usada na web: ${query}\n\nFontes consultadas:\n${referenceBlock}`,
        },
      ],
      { maxTokens: 700, timeout: 4000 },
    );

    response.json({
      answer,
      model,
      query,
      sources: sources.map((source) => ({ title: source.title, url: source.url })),
    });
  } catch (error) {
    console.error(`[OctoAI] falha total: ${error.message}`);
    response.status(502).json({
      answer:
        "Os modelos gratuitos estão ocupados agora. Tente novamente em alguns segundos ou reformule a pergunta.",
      sources: [],
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[OctoAI] ouvindo em http://0.0.0.0:${PORT}`);
  discoverModels();
  setInterval(discoverModels, DISCOVERY_INTERVAL).unref?.();
});

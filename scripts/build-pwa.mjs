/**
 * Builds pwa-app/ from the exported Expo web bundle (dist/).
 *
 * - copies the real app so the PWA is the same product as the native build
 * - adds the manifest, the icons and an offline service worker
 * - injects the iOS install gate: on iPhone Safari, outside standalone mode,
 *   the app is blocked behind a Liquid Glass tutorial until it is added to the
 *   Home Screen.
 *
 * Run after: CI=1 npx expo export --platform web
 */
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "pwa-app");

if (!existsSync(path.join(DIST, "index.html"))) {
  console.error("dist/index.html não encontrado. Rode primeiro: CI=1 npx expo export --platform web");
  process.exit(1);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(DIST, OUT, { recursive: true });

/* ---------- ícones ---------- */
const assets = path.join(OUT, "assets");
await mkdir(assets, { recursive: true });
await cp(path.join(ROOT, "assets/mascot/mascot.png"), path.join(assets, "mascot.png"));
await cp(path.join(ROOT, "assets/mascot/logo-icon.png"), path.join(assets, "logo-icon.png"));

const manifest = {
  name: "OctoCode — aprenda programação de verdade",
  short_name: "OctoCode",
  description:
    "Lógica com Portugol, 15 trilhas, OctoCoreOS com terminal POSIX e cybersecurity. Funciona offline no seu aparelho.",
  lang: "pt-BR",
  id: "/",
  start_url: "./index.html",
  scope: "./",
  display: "standalone",
  display_override: ["standalone", "fullscreen"],
  orientation: "portrait-primary",
  background_color: "#F6F4FC",
  theme_color: "#5B21B6",
  categories: ["education", "productivity"],
  icons: [
    { src: "./assets/logo-icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "./assets/logo-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "./assets/logo-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

await writeFile(path.join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

/* ---------- trava de instalação no iPhone ---------- */

const GATE_CSS = `
    <style id="octo-ios-gate-style">
      html.octo-gate #root { display: none !important; }
      html.octo-gate body { overflow: hidden !important; }
      #octo-gate {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 14px;
        padding: 14px 16px 18px;
        overscroll-behavior: contain;
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
        color: #17131f;
        background:
          radial-gradient(120% 90% at 15% 0%, rgba(255, 255, 255, 0.95), transparent 60%),
          radial-gradient(120% 100% at 90% 100%, rgba(196, 181, 253, 0.85), transparent 62%),
          linear-gradient(160deg, #efe7ff, #dfe9ff 48%, #ffe3f1);
        overflow-y: auto;
        -webkit-backdrop-filter: saturate(180%) blur(22px);
        backdrop-filter: saturate(180%) blur(22px);
      }
      #octo-gate * { box-sizing: border-box; }
      .og-card {
        position: relative;
        width: 100%;
        max-width: 420px;
        margin: auto;
        border-radius: 28px;
        padding: 18px 16px 16px;
        background: rgba(255, 255, 255, 0.62);
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 26px 60px -30px rgba(45, 22, 92, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        backdrop-filter: blur(24px) saturate(180%);
      }
      .og-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
      .og-mark {
        width: 32px; height: 32px; border-radius: 11px; background: #5b21b6; color: #fff;
        display: inline-flex; align-items: center; justify-content: center; gap: 3px;
        font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 12px; font-weight: 700;
      }
      .og-mark i { width: 5px; height: 5px; border-radius: 50%; background: #fff; display: block; }
      .og-brand strong { font-size: 1rem; letter-spacing: -0.02em; }
      .og-mascot { width: 68px; height: 68px; object-fit: contain; display: block; margin: 0 auto 4px; }
      .og-eyebrow {
        display: block; text-align: center; font-size: 0.66rem; letter-spacing: 0.16em;
        text-transform: uppercase; font-weight: 700; color: #7c3aed; margin-bottom: 8px;
      }
      .og-title {
        text-align: center; font-size: 1.34rem; line-height: 1.12; letter-spacing: -0.03em;
        font-weight: 800; margin: 0 0 7px;
      }
      .og-sub {
        text-align: center; font-size: 0.8rem; line-height: 1.42; color: #5e5673; margin: 0 0 13px;
      }
      .og-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
      .og-step {
        display: grid; grid-template-columns: 32px 1fr; gap: 11px; align-items: center;
        background: rgba(255, 255, 255, 0.78); border: 1px solid rgba(255, 255, 255, 0.95);
        border-radius: 17px; padding: 9px 12px;
      }
      .og-num {
        width: 34px; height: 34px; border-radius: 12px; background: rgba(91, 33, 182, 0.1);
        color: #5b21b6; display: grid; place-items: center; font-weight: 800; font-size: 0.82rem;
      }
      .og-step strong { display: block; font-size: 0.82rem; letter-spacing: -0.01em; }
      .og-step span { display: block; font-size: 0.7rem; color: #6b6482; line-height: 1.35; }
      .og-share {
        display: inline-flex; align-items: center; justify-content: center;
        width: 22px; height: 22px; border-radius: 6px; background: #0a84ff; color: #fff;
        vertical-align: -5px; margin: 0 2px;
      }
      .og-share svg { width: 13px; height: 13px; }
      .og-pointer {
        display: flex; flex-direction: column; align-items: center; gap: 2px;
        font-size: 0.64rem; font-weight: 700; color: #5b21b6; letter-spacing: 0.08em;
        animation: og-bob 1.9s ease-in-out infinite;
      }
      .og-pointer svg { width: 20px; height: 20px; }
      @keyframes og-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
      .og-foot {
        text-align: center; font-size: 0.68rem; color: #6b6482; margin: 12px 0 0; line-height: 1.4;
      }
      .og-foot strong { color: #5b21b6; }
      @media (prefers-reduced-motion: reduce) { .og-pointer { animation: none; } }
    </style>`;

const SHARE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V3"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>`;

const GATE_HTML = `
    <div id="octo-gate" role="dialog" aria-modal="true" aria-label="Instalar o OctoCode no iPhone">
      <div class="og-card">
        <div class="og-brand">
          <span class="og-mark" aria-hidden="true"><i></i>&lt;</span>
          <strong>OctoCode</strong>
        </div>
        <img class="og-mascot" src="./assets/mascot.png" alt="Octo, o mascote do OctoCode" />
        <span class="og-eyebrow">Modo iPhone</span>
        <h1 class="og-title">Instale o OctoCode<br />para usar agora</h1>
        <p class="og-sub">
          O app completo, o OctoCoreOS e as lições só são liberados quando ele é aberto pelo
          ícone da Tela de Início. São três toques:
        </p>
        <ol class="og-steps">
          <li class="og-step">
            <span class="og-num">1</span>
            <div>
              <strong>Toque em Compartilhar <span class="og-share" aria-hidden="true">${SHARE_ICON}</span></strong>
              <span>O ícone fica na barra do Safari, embaixo ou no topo.</span>
            </div>
          </li>
          <li class="og-step">
            <span class="og-num">2</span>
            <div>
              <strong>Escolha “Adicionar à Tela de Início”</strong>
              <span>Role a lista de opções até encontrar esse item e confirme em “Adicionar”.</span>
            </div>
          </li>
          <li class="og-step">
            <span class="og-num">3</span>
            <div>
              <strong>Abra pelo ícone do OctoCode</strong>
              <span>O app sai do Safari, ocupa a tela inteira e funciona offline.</span>
            </div>
          </li>
        </ol>
        <div class="og-pointer" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v14"/><path d="m6 12 6 6 6-6"/></svg>
          BARRA DO SAFARI
        </div>
        <p class="og-foot">
          No computador ou no Android abre direto. <strong>Offline</strong> depois da primeira visita.
        </p>
      </div>
    </div>`;

const GATE_SCRIPT = `
    <script id="octo-ios-gate">
      (function () {
        var ua = navigator.userAgent || "";
        var isIOS = /iPad|iPhone|iPod/.test(ua) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        var standalone = window.navigator.standalone === true ||
          window.matchMedia("(display-mode: standalone)").matches;
        if (!isIOS || standalone) return;
        document.documentElement.classList.add("octo-gate");
        var mount = function () {
          if (document.getElementById("octo-gate")) return;
          var holder = document.createElement("div");
          holder.innerHTML = ${JSON.stringify(GATE_HTML)};
          document.body.appendChild(holder.firstElementChild);
        };
        if (document.body) mount();
        else document.addEventListener("DOMContentLoaded", mount);
      })();
    </script>`;

/* ---------- index.html ---------- */
let html = await readFile(path.join(OUT, "index.html"), "utf8");

html = html
  .replace('<html lang="en">', '<html lang="pt-BR">')
  .replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />',
  )
  .replace("<title>OctoCode</title>", "<title>OctoCode</title>")
  .replace(
    '<link rel="icon" href="/favicon.ico"/>',
    [
      '<link rel="icon" href="/favicon.ico"/>',
      '<link rel="manifest" href="./manifest.json"/>',
      '<meta name="theme-color" content="#5B21B6"/>',
      '<meta name="description" content="Lógica com Portugol, 15 trilhas, OctoCoreOS com terminal POSIX e cybersecurity. Funciona offline."/>',
      '<meta name="mobile-web-app-capable" content="yes"/>',
      '<meta name="apple-mobile-web-app-capable" content="yes"/>',
      '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>',
      '<meta name="apple-mobile-web-app-title" content="OctoCode"/>',
      '<link rel="apple-touch-icon" href="./assets/logo-icon.png"/>',
      '<link rel="apple-touch-startup-image" href="./assets/mascot.png"/>',
    ].join("\n    "),
  )
  .replace("</head>", `${GATE_CSS}\n  </head>`)
  .replace("</body>", `${GATE_SCRIPT}\n  </body>`);

await writeFile(path.join(OUT, "index.html"), html);

/* ---------- service worker ---------- */
const sw = `/* OctoCode PWA — offline first */
const CACHE = "octocode-app-v1";
const PRECACHE = ["./", "./index.html", "./manifest.json", "./assets/mascot.png", "./assets/logo-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html").then((cached) => cached || caches.match("./"))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
`;

await writeFile(path.join(OUT, "sw.js"), sw);

/* ---------- registro do service worker ---------- */
let finalHtml = await readFile(path.join(OUT, "index.html"), "utf8");
if (!finalHtml.includes("octocode-sw-register")) {
  finalHtml = finalHtml.replace(
    "</body>",
    `  <script id="octocode-sw-register">
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("./sw.js").catch(function () {});
        });
      }
    </script>
  </body>`,
  );
  await writeFile(path.join(OUT, "index.html"), finalHtml);
}

console.log("pwa-app pronto em", path.relative(ROOT, OUT));

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8090";
const OUT = "screenshots";

const today = new Date();
const lastDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
  today.getDate(),
).padStart(2, "0")}`;

const seed = {
  onboarded: true,
  track: "python",
  level: "intermediate",
  placementPassed: true,
  dailyGoal: 10,
  streak: 12,
  gems: 240,
  hearts: 5,
  xpToday: 12,
  xpTotal: 480,
  completed: ["logic-1", "logic-2"],
  notes: [
    {
      id: "note-1",
      title: "Resumo — Variáveis e Memória",
      body: "Variável é um nome que aponta para um valor na memória. = atribui, == compara. Usei snake_case para nomes compostos.",
      tags: ["#Lógica"],
      createdAt: Date.now() - 86400000,
    },
  ],
  lastDay,
  muted: false,
};

const modes = [
  { ui: "material", mode: "light", width: 390, height: 844, label: "material-390" },
  { ui: "glass", mode: "light", width: 390, height: 844, label: "glass-390" },
  { ui: "material", mode: "light", width: 412, height: 915, label: "material-412" },
  { ui: "glass", mode: "light", width: 412, height: 915, label: "glass-412" },
];

const browser = await chromium.launch();

await mkdir(OUT, { recursive: true });

for (const entry of modes) {
  const context = await browser.newContext({
    viewport: { width: entry.width, height: entry.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: entry.mode,
  });
  await context.addInitScript(
    ({ ui, mode }) => {
      localStorage.setItem("octocode.ui", ui);
      localStorage.setItem("octocode.mode", mode);
    },
    { ui: entry.ui, mode: entry.mode },
  );
  const page = await context.newPage();
  const prefix = `${OUT}/${entry.label}`;

  // Onboarding (sem progresso salvo)
  await page.goto(`${BASE}/onboarding`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("octocode.progress.v1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${prefix}-onboarding.png` });

  // Progresso de demonstração
  await page.evaluate((data) => localStorage.setItem("octocode.progress.v1", JSON.stringify(data)), seed);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${prefix}-home.png` });

  // Mapa da trilha
  await page.getByRole("tab", { name: "Trilha" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${prefix}-learn.png` });

  // Lição — micro-aula
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.getByText("Continuar lição", { exact: true }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${prefix}-lesson-theory.png` });

  // Lição — exercício
  await page.getByText("Entendi, quero praticar", { exact: true }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${prefix}-lesson-exercise.png` });

  await context.close();
  console.log(`capturado: ${entry.label}`);
}

for (const ui of ["material", "glass"]) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
  });
  await context.addInitScript(
    ({ uiStyle, progress }) => {
      localStorage.setItem("octocode.ui", uiStyle);
      localStorage.setItem("octocode.mode", "dark");
      localStorage.setItem("octocode.progress.v1", JSON.stringify(progress));
    },
    { uiStyle: ui, progress: seed },
  );
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/${ui}-390-home-dark.png` });
  await context.close();
  console.log(`capturado: ${ui}-390-home-dark`);
}

await browser.close();
console.log("screenshots prontos");

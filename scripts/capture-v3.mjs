import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const APP = process.env.APP_URL ?? "http://127.0.0.1:8090";
const OUT = "screenshots";

const today = new Date();
const lastDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
  today.getDate(),
).padStart(2, "0")}`;

const seed = {
  onboarded: true,
  track: "python",
  level: "intermediate",
  placementLevel: "intermediate",
  placementPassed: true,
  dailyGoal: 10,
  streak: 12,
  gems: 240,
  hearts: 5,
  xpToday: 12,
  xpTotal: 480,
  completed: ["logic-1", "logic-2"],
  notes: [],
  lastDay,
  muted: false,
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

async function makeContext({ ui = "glass", mode = "light", signedIn = true, onboarded = true } = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: mode,
  });
  await context.addInitScript(
    ({ uiStyle, modeStyle, guest, progress, onboardedFlag }) => {
      window.__OCTO_UI__ = uiStyle;
      localStorage.setItem("octocode.mode", modeStyle);
      localStorage.setItem("octocode.walkthrough.v1", "done");
      if (guest) localStorage.setItem("octocode.guest.v1", "true");
      if (onboardedFlag) {
        localStorage.setItem("octocode.progress.v1", JSON.stringify(progress));
      } else {
        localStorage.removeItem("octocode.progress.v1");
      }
    },
    { uiStyle: ui, modeStyle: mode, guest: signedIn, progress: seed, onboardedFlag: onboarded },
  );
  return context;
}

// 1. Entry screen with the real artwork, then the guest warning modal.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(() => {
    window.__OCTO_UI__ = "glass";
    localStorage.clear();
  });
  const page = await context.newPage();
  await page.goto(`${APP}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/v3-entry.png` });
  await page.getByText("Entrar sem login", { exact: true }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/v3-entry-guest-warning.png` });
  await context.close();
}

async function homeShots(ui, mode, name) {
  const context = await makeContext({ ui, mode });
  const page = await context.newPage();
  await page.goto(`${APP}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/${name}-home.png` });

  await page.mouse.move(6, 430);
  await page.mouse.down();
  for (let x = 12; x <= 300; x += 24) {
    await page.mouse.move(x, 430);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}-drawer.png` });
  await context.close();
}

await homeShots("glass", "light", "v3-glass");
await homeShots("material", "light", "v3-material");
await homeShots("glass", "dark", "v3-glass-dark");

// 2. Lesson with the five hearts at the top.
{
  const context = await makeContext({ ui: "glass" });
  const page = await context.newPage();
  await page.goto(`${APP}/lesson/logic-2`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/v3-lesson-hearts.png` });
  await context.close();
}

// 3. Progressive placement: first question, then the live XP/level bar.
{
  const context = await makeContext({ ui: "glass", onboarded: false });
  const page = await context.newPage();
  await page.goto(`${APP}/onboarding`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await page.getByText("Continuar", { exact: true }).click();
  await page.waitForTimeout(700);
  await page.getByText("Já tenho base", { exact: true }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/v3-placement-1.png` });
  await page.getByText("=", { exact: true }).first().click();
  await page.waitForTimeout(300);
  await page.getByText("Verificar", { exact: true }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/v3-placement-xp.png` });
  await context.close();
}

// 4. Terminal octofetch and OctoAI.
{
  const context = await makeContext({ ui: "glass" });
  const page = await context.newPage();
  await page.goto(`${APP}/terminal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1300);
  await page.getByText("octofetch", { exact: true }).last().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/v3-terminal.png` });

  await page.goto(`${APP}/tutor`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${OUT}/v3-octoai.png` });

  await page.goto(`${APP}/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/v3-settings.png` });

  await page.goto(`${APP}/learn`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/v3-learn.png` });
  await context.close();
}

await browser.close();
console.log("capturas v3 prontas");

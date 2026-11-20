import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const SITE = process.env.SITE_URL ?? "http://127.0.0.1:8091";
const PWA = process.env.PWA_URL ?? "http://127.0.0.1:8092";
const APP = process.env.APP_URL ?? "http://127.0.0.1:8090";
const OUT = "screenshots";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

/* ---------- Site oficial ---------- */
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(`${SITE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/site-v4-hero.png` });

  await page.click("#menu-toggle");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/site-v4-downloads.png` });

  await page.click("#download-close");
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector("#historia").scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/site-v4-historia.png` });

  await page.evaluate(() => document.querySelector("#terminal").scrollIntoView());
  await page.waitForTimeout(400);
  await page.fill("#terminal-field", "octofetch");
  await page.press("#terminal-field", "Enter");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/site-v4-terminal.png` });
  await context.close();
}

/* ---------- Site no celular, com o menu aberto ---------- */
{
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await context.newPage();
  await page.goto(`${SITE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.click("#menu-toggle");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/site-v4-downloads-iphone.png` });
  await context.close();
}

/* ---------- PWA no Safari do iPhone: trava de instalação ---------- */
{
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();
  await page.goto(`${PWA}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const gate = await page.locator("#octo-gate").count();
  console.log("gate visível:", gate);
  if (gate === 0) throw new Error("a trava do iPhone não apareceu");
  await page.screenshot({ path: `${OUT}/pwa-v4-ios-gate.png` });
  await context.close();
}

/* ---------- PWA instalado / desktop: precisa abrir sem trava ---------- */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${PWA}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const gate = await page.locator("#octo-gate").count();
  console.log("gate no desktop:", gate);
  if (gate !== 0) throw new Error("a trava apareceu fora do iPhone");
  await page.screenshot({ path: `${OUT}/pwa-v4-desktop.png` });
  await context.close();
}

/* ---------- App nativo (web) com o polvo espiando ---------- */
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(() => {
    window.__OCTO_UI__ = "glass";
    localStorage.setItem("octocode.guest.v1", "true");
    localStorage.setItem("octocode.walkthrough.v1", "done");
    localStorage.setItem(
      "octocode.progress.v1",
      JSON.stringify({
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
        lastDay: new Date().toISOString().slice(0, 10),
        muted: false,
      }),
    );
  });
  const page = await context.newPage();
  await page.goto(`${APP}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/app-v4-peek.png` });
  await page.getByLabel("Abrir o chat do OctoAI").click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/app-v4-chat.png` });
  await context.close();
}

await browser.close();
console.log("capturas finais prontas");

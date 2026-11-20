import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const APP = process.env.APP_URL ?? "http://127.0.0.1:8090";
const SITE = process.env.SITE_URL ?? "http://127.0.0.1:8091";
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
  hearts: 4,
  xpToday: 12,
  xpTotal: 480,
  completed: ["logic-1", "logic-2"],
  notes: [],
  lastDay,
  muted: false,
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

async function appContext(ui, mode) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: mode,
  });
  await context.addInitScript(
    ({ uiStyle, modeStyle, progress }) => {
      localStorage.setItem("octocode.ui", uiStyle);
      localStorage.setItem("octocode.mode", modeStyle);
      localStorage.setItem("octocode.progress.v1", JSON.stringify(progress));
      if (!sessionStorage.getItem("seeded")) {
        localStorage.removeItem("octocode.walkthrough.v1");
        sessionStorage.setItem("seeded", "1");
      }
    },
    { uiStyle: ui, modeStyle: mode, progress: seed },
  );
  return context;
}

for (const ui of ["material", "glass"]) {
  const context = await appContext(ui, "light");
  const page = await context.newPage();
  await page.goto(`${APP}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);

  await page.screenshot({ path: `${OUT}/v2-${ui}-tour-1.png` });
  await page.getByText("Próximo", { exact: true }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/v2-${ui}-tour-2.png` });
  await page.getByText("Próximo", { exact: true }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/v2-${ui}-tour-3.png` });
  await page.getByText("Começar a aprender", { exact: true }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/v2-${ui}-home.png` });

  await page.mouse.move(6, 430);
  await page.mouse.down();
  for (let x = 12; x <= 300; x += 24) {
    await page.mouse.move(x, 430);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/v2-${ui}-drawer.png` });

  await page.mouse.click(360, 700);
  await page.waitForTimeout(700);

  await page.goto(`${APP}/terminal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.getByText("octofetch", { exact: true }).last().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/v2-${ui}-terminal.png` });

  await page.goto(`${APP}/tutor`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/v2-${ui}-tutor.png` });

  await page.goto(`${APP}/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/v2-${ui}-settings.png` });

  await page.goto(`${APP}/leaderboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/v2-${ui}-leaderboard.png` });

  await context.close();
  console.log(`app capturado: ${ui}`);
}

const darkContext = await appContext("material", "dark");
const darkPage = await darkContext.newPage();
await darkPage.goto(`${APP}/`, { waitUntil: "networkidle" });
await darkPage.waitForTimeout(1400);
await darkPage.getByText("Pular", { exact: true }).click();
await darkPage.waitForTimeout(600);
await darkPage.mouse.move(6, 430);
await darkPage.mouse.down();
for (let x = 12; x <= 320; x += 22) {
  await darkPage.mouse.move(x, 430);
  await darkPage.waitForTimeout(16);
}
await darkPage.mouse.up();
await darkPage.waitForTimeout(900);
await darkPage.screenshot({ path: `${OUT}/v2-material-drawer-dark.png` });
await darkContext.close();

const siteDesktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const desktopPage = await siteDesktop.newPage();
await desktopPage.goto(`${SITE}/index.html`, { waitUntil: "networkidle" });
await desktopPage.waitForTimeout(900);
await desktopPage.screenshot({ path: `${OUT}/site-desktop-hero.png` });
await desktopPage.getByRole("button", { name: "octofetch" }).click();
await desktopPage.waitForTimeout(500);
await desktopPage.locator("#terminal").scrollIntoViewIfNeeded();
await desktopPage.waitForTimeout(500);
await desktopPage.screenshot({ path: `${OUT}/site-desktop-terminal.png` });
await desktopPage.locator("#cursos").scrollIntoViewIfNeeded();
await desktopPage.waitForTimeout(500);
await desktopPage.screenshot({ path: `${OUT}/site-desktop-cursos.png` });
await desktopPage.locator("#instalar").scrollIntoViewIfNeeded();
await desktopPage.waitForTimeout(500);
await desktopPage.screenshot({ path: `${OUT}/site-desktop-instalar.png` });
await siteDesktop.close();

const siteMobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mobilePage = await siteMobile.newPage();
await mobilePage.goto(`${SITE}/index.html`, { waitUntil: "networkidle" });
await mobilePage.waitForTimeout(900);
await mobilePage.screenshot({ path: `${OUT}/site-mobile-hero.png` });
await mobilePage.locator("#terminal").scrollIntoViewIfNeeded();
await mobilePage.waitForTimeout(600);
await mobilePage.screenshot({ path: `${OUT}/site-mobile-terminal.png` });
await siteMobile.close();

await browser.close();
console.log("capturas v2 prontas");

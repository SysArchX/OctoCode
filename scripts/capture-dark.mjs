import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8090";
const seedPath = "octocode.progress.v1";

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
  notes: [],
  lastDay,
  muted: false,
};

const browser = await chromium.launch();

for (const ui of ["material", "glass"]) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
  });
  await context.addInitScript(
    ({ uiStyle, progress, key }) => {
      localStorage.setItem("octocode.ui", uiStyle);
      localStorage.setItem("octocode.mode", "dark");
      localStorage.setItem(key, JSON.stringify(progress));
    },
    { uiStyle: ui, progress: seed, key: seedPath },
  );
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screenshots/${ui}-390-home-dark.png` });
  await page.getByRole("tab", { name: "Trilha" }).click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `screenshots/${ui}-390-learn-dark.png` });
  await context.close();
  console.log(`dark capturado: ${ui}`);
}

await browser.close();

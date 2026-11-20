import { chromium } from "playwright";

const SITE = process.env.SITE_URL ?? "http://127.0.0.1:8091";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await page.goto(`${SITE}/index.html`, { waitUntil: "networkidle" });
await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 20000 });
await page.reload({ waitUntil: "networkidle" });

const cached = await page.evaluate(async () => {
  const cache = await caches.open("octocode-site-v1");
  return (await cache.keys()).map((request) => new URL(request.url).pathname);
});

await context.setOffline(true);
await page.reload({ waitUntil: "domcontentloaded" });
const heading = await page.locator("h1").innerText().catch(() => "");
const terminalWorks = await page
  .locator("#terminal-form input")
  .fill("whoami")
  .then(() => page.locator("#terminal-form").evaluate((form) => form.requestSubmit()))
  .catch(() => undefined);
await page.waitForTimeout(400);
const output = await page.locator("#terminal-output").innerText().catch(() => "");

console.log(`SW controller ativo`);
console.log(`cache: ${cached.length} entradas`);
console.log(`offline h1: ${heading.replace(/\s+/g, " ").slice(0, 60)}`);
console.log(`terminal offline respondeu octo: ${output.includes("octo")}`);
await browser.close();

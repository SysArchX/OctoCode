// Real end-to-end check: open the web build, enter as guest and confirm the
// device profile is written to the live Supabase project.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8090";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const logs = [];
page.on("console", (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
page.on("pageerror", (error) => logs.push(`pageerror: ${error.message}`));

await page.addInitScript(() => {
  window.localStorage.clear();
});
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const guest = page.getByText("Entrar sem login", { exact: false }).first();
await guest.waitFor({ state: "visible", timeout: 15000 });
await guest.click();
await page.waitForTimeout(8000);

const storage = await page.evaluate(() => {
  const out = {};
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    out[key] = window.localStorage.getItem(key);
  }
  return out;
});

const deviceKey = Object.keys(storage).find((key) => key.includes("device")) ?? null;
const syncKey = Object.keys(storage).find((key) => key.includes("octocode.sync")) ?? null;

console.log("URL:", page.url());
console.log("device key:", deviceKey);
console.log("device id:", deviceKey ? storage[deviceKey] : null);
console.log("sync queue:", syncKey ? storage[syncKey] : null);
console.log("console:", logs.filter((line) => /error|warn|auth|supabase/i.test(line)).slice(0, 12));

await browser.close();

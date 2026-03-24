import { createRequire } from "node:module";
import type { AxeResults, Result } from "axe-core";
import { expect, test } from "@playwright/test";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

async function runAxe(page: import("@playwright/test").Page) {
  await page.addScriptTag({ path: axePath });
  return await page.evaluate(async (): Promise<AxeResults> => {
    // @ts-expect-error axe is injected in the page context
    return window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"]
      }
    });
  });
}

async function gotoStub(page: import("@playwright/test").Page) {
  await page.goto("/?source=stub");
}

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.getByPlaceholder("correo@tenant.com").fill(email);
  await page.getByPlaceholder("Contrasena").fill("Demo1234!");
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function openAdminConfig(page: import("@playwright/test").Page) {
  await page.locator("aside").getByRole("button", { name: "Configuracion", exact: true }).click();
}

function expectNoSeriousViolations(results: AxeResults) {
  const seriousViolations = results.violations.filter((violation: Result) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);
}

test("opita sync login has no serious accessibility violations", async ({ page }) => {
  await gotoStub(page);
  expectNoSeriousViolations(await runAxe(page));
});

test("opita sync authenticated shell has no serious accessibility violations", async ({ page }) => {
  await gotoStub(page);
  await signIn(page, "supervisor@acme.opita.test");
  expectNoSeriousViolations(await runAxe(page));
});

test("opita sync case detail keeps no serious accessibility violations", async ({ page }) => {
  await gotoStub(page);
  await signIn(page, "tecnico@acme.opita.test");
  await page.getByRole("button", { name: "Casos", exact: true }).click();
  await page.getByRole("button", { name: "Ver detalle" }).first().click();
  expectNoSeriousViolations(await runAxe(page));
});

test("opita sync admin configuration keeps no serious accessibility violations", async ({ page }) => {
  await gotoStub(page);
  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);
  expectNoSeriousViolations(await runAxe(page));
});

test("opita sync disclosures remain accessible when expanded", async ({ page }) => {
  await gotoStub(page);
  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);
  await page.locator("details").filter({ has: page.getByText("Billing externo") }).locator("summary").click();
  expectNoSeriousViolations(await runAxe(page));
});

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

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.getByPlaceholder("correo@tenant.com").fill(email);
  await page.getByPlaceholder("Contrasena").fill("Demo1234!");
  await page.getByRole("button", { name: "Entrar" }).click();
}

function expectNoSeriousViolations(results: AxeResults) {
  const seriousViolations = results.violations.filter((violation: Result) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);
}

test("opita sync login has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  expectNoSeriousViolations(await runAxe(page));
});

test("opita sync authenticated shell has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await signIn(page, "supervisor@acme.opita.test");
  expectNoSeriousViolations(await runAxe(page));
});


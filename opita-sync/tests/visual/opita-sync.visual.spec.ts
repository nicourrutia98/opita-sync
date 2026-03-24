import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.getByPlaceholder("correo@tenant.com").fill(email);
  await page.getByPlaceholder("Contrasena").fill("Demo1234!");
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function gotoStub(page: import("@playwright/test").Page) {
  await page.goto("/?source=stub");
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 390, height: 844 }
]) {
  test(`opita sync login layout stays inside viewport on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoStub(page);

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const cards = [...document.querySelectorAll("section, article, nav, header, footer, form")].map((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return { left: rect.left, right: rect.right, width: rect.width, display: style.display, visibility: style.visibility };
      }).filter((node) => node.display !== "none" && node.visibility !== "hidden" && node.width > 0);

      return { scrollWidth: doc.scrollWidth, innerWidth: window.innerWidth, cards };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
    for (const card of metrics.cards) {
      expect(card.left).toBeGreaterThanOrEqual(-1);
      expect(card.right).toBeLessThanOrEqual(viewport.width + 1);
      expect(card.width).toBeGreaterThan(80);
    }
  });

  test(`opita sync authenticated layout stays inside viewport on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoStub(page);
    await signIn(page, viewport.name === "mobile" ? "supervisor@acme.opita.test" : "tecnico@acme.opita.test");

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const cards = [...document.querySelectorAll("section, article, nav, header, footer")].map((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return { left: rect.left, right: rect.right, width: rect.width, display: style.display, visibility: style.visibility };
      }).filter((node) => node.display !== "none" && node.visibility !== "hidden" && node.width > 0);

      return { scrollWidth: doc.scrollWidth, innerWidth: window.innerWidth, cards };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
    for (const card of metrics.cards) {
      expect(card.left).toBeGreaterThanOrEqual(-1);
      expect(card.right).toBeLessThanOrEqual(viewport.width + 1);
      expect(card.width).toBeGreaterThan(80);
    }
  });

  test(`opita sync keeps a single dominant intro surface on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoStub(page);
    await signIn(page, viewport.name === "mobile" ? "tecnico@acme.opita.test" : "admin@acme.opita.test");

    if (viewport.name === "desktop") {
      await page.locator("aside").getByRole("button", { name: "Configuracion", exact: true }).click();
    }

    const mainHeading = page.locator("main h2").first();
    await expect(mainHeading).toBeVisible();
    await expect(page.locator("main h2")).toHaveCount(1);
  });
}

test("opita sync keeps secondary billing context collapsed until requested", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page);
  await signIn(page, "admin@acme.opita.test");
  await page.locator("aside").getByRole("button", { name: "Configuracion", exact: true }).click();

  const billingDetails = page.locator("details").filter({ has: page.getByText("Billing externo") });
  await expect(billingDetails).toHaveCount(1);
  await expect(billingDetails).not.toHaveAttribute("open", "");

  await billingDetails.locator("summary").click();
  await expect(billingDetails).toHaveAttribute("open", "");
  await expect(page.getByRole("button", { name: "Exportar consumo para billing" })).toBeVisible();
});

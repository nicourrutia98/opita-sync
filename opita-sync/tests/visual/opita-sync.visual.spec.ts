import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.getByPlaceholder("correo@tenant.com").fill(email);
  await page.getByPlaceholder("Contrasena").fill("Demo1234!");
  await page.getByRole("button", { name: "Entrar" }).click();
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 390, height: 844 }
]) {
  test(`opita sync login layout stays inside viewport on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

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
    await page.goto("/");
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
}


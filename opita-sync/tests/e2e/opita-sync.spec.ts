import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page, email: string, password = "Demo1234!") {
  await page.getByPlaceholder("correo@tenant.com").fill(email);
  await page.getByPlaceholder("Contrasena").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function gotoStub(page: import("@playwright/test").Page, extraQuery = "") {
  const suffix = extraQuery ? `&${extraQuery}` : "";
  await page.goto(`/?source=stub${suffix}`);
}

async function openAdminConfig(page: import("@playwright/test").Page) {
  await page.locator("aside").getByRole("button", { name: "Configuracion", exact: true }).click();
}

test("opita sync signs in, loads the connected shell, and signs out", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStub(page);

  await expect(page).toHaveTitle("Opita Sync");
  await expect(page.getByRole("heading", { name: "Accede a Opita Sync" })).toBeVisible();

  await signIn(page, "tecnico@acme.opita.test");
  await expect(page.getByRole("heading", { name: "Una sola ruta clara para operar, revisar y decidir." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Empieza por lo importante y entra al caso correcto mas rapido." })).toBeVisible();
  await expect(page.getByText("Laura Rojas")).toBeVisible();

  await page.getByRole("button", { name: /Cerrar sesion/i }).click();
  await expect(page.getByRole("heading", { name: "Accede a Opita Sync" })).toBeVisible();
});

test("opita sync shows an invalid credential error without breaking layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStub(page);

  await signIn(page, "tecnico@acme.opita.test", "incorrecta");
  await expect(page.getByText("No pudimos iniciar sesion")).toBeVisible();
  await expect(page.getByText("Credenciales invalidas. Revisa correo y contrasena.")).toBeVisible();
});

test("opita sync redirects to login when a connected view returns 401", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page, "authFailOnce=cases:unauthorized");

  await signIn(page, "tecnico@acme.opita.test");
  await page.locator("aside").getByRole("button", { name: "Casos", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Accede a Opita Sync" })).toBeVisible();
  await expect(page.getByText("Sesion expirada")).toBeVisible();
});

test("opita sync keeps session active and shows access denied on 403", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page, "authFailOnce=tenant:forbidden");

  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);
  await expect(page.getByText("Acceso denegado")).toBeVisible();
  await expect(page.getByText("Paula Mejia")).toBeVisible();
});

test("opita sync loads the supervisor workspace after authenticated bootstrap", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStub(page);

  await signIn(page, "supervisor@acme.opita.test");
  await expect(page.getByText("Supervisor workspace")).toBeVisible();
  await expect(page.getByRole("button", { name: /Revisar borrador sensible/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resuelve bloqueos y aprobaciones sin perder continuidad." })).toBeVisible();
});

test("opita sync allows tecnico to register governed log entries from case detail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStub(page);

  await signIn(page, "tecnico@acme.opita.test");
  await page.getByRole("button", { name: "Casos", exact: true }).click();
  await page.getByRole("button", { name: "Ver detalle" }).first().click();

  await page.locator("details").filter({ has: page.getByText("Registrar en bitacora") }).locator("summary").click();
  await page.getByPlaceholder("Detalle del avance o evento operativo").fill("Entrada de prueba release 2 desde e2e.");
  await page.getByRole("button", { name: "Guardar entrada auditada" }).click();

  await expect(page.getByText("Entrada registrada", { exact: true })).toBeVisible();
  await page.locator("details").filter({ has: page.getByText("Bitacora gobernada") }).locator("summary").click();
  await expect(page.getByText("Entrada de prueba release 2 desde e2e.")).toBeVisible();
});

test("opita sync allows admin to update tenant parameter and capability state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page);

  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);

  const priorityCard = page.getByTestId("tenant-parameter-case.default_priority");
  const priorityInput = priorityCard.locator("input");
  await priorityInput.fill("Alta");
  await priorityCard.getByRole("button", { name: "Guardar parametro" }).click();
  await expect(page.getByText("Configuracion actualizada")).toBeVisible();

  await page.getByRole("button", { name: /Desactivar capacidad|Activar capacidad/ }).first().click();
  await expect(page.getByText("Capacidad actualizada")).toBeVisible();
  await expect(page.getByText("Herramienta sin certificacion para produccion en este tenant.")).toBeVisible();
});

test("opita sync recovers from release-2 capability service failure with retry", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page, "failOnce=capabilities");

  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);

  await expect(page.getByText("No se pudo cargar capacidades")).toBeVisible();
  await page.getByRole("button", { name: "Reintentar" }).first().click();
  await expect(page.getByText("Capacidades, herramientas y consumo")).toBeVisible();
});

test("opita sync generates assisted draft from chat on authenticated flow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStub(page);

  await signIn(page, "tecnico@acme.opita.test");
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  await expect(page.getByText("Chat / Orchestrator", { exact: true })).toBeVisible();

  const assistance = page.locator("details").filter({ has: page.getByText("Asistencia y auditoria") });
  await assistance.locator("summary").click();
  await page.getByRole("button", { name: "Generar borrador asistido" }).click();

  await expect(page.getByText("Borrador generado")).toBeVisible();
  await expect(page.getByText("Prompt base:")).toBeVisible();
});

test("opita sync shows release-3 value reporting block on home", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page);

  await signIn(page, "supervisor@acme.opita.test");
  await expect(page.getByText("Reporting de valor")).toBeVisible();
  await expect(page.getByText("Acciones positivas")).toBeVisible();
});

test("opita sync exports usage for external billing from admin config", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page);

  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);
  await page.locator("details").filter({ has: page.getByText("Billing externo") }).locator("summary").click();
  await page.getByRole("button", { name: "Exportar consumo para billing" }).click();

  await expect(page.getByText("Export generado")).toBeVisible();
  await expect(page.getByText("Export EXP-R3")).toBeVisible();
});

test("opita sync executes release-4 governance action from admin config", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page);

  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);
  await page.getByTestId("governance-deploy-release").click();

  await expect(page.getByText("Accion de gobierno ejecutada")).toBeVisible();
  await expect(page.getByText("Audit AUD-R4-ACT-")).toBeVisible();
});

test("opita sync updates data reuse consent in compliance block", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page);

  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);
  await page.getByTestId("compliance-toggle-consent").click();

  await expect(page.getByText("Compliance actualizado")).toBeVisible();
  await expect(page.getByText("Consentimiento actualizado: activo")).toBeVisible();
});

test("opita sync renders navigation manifesto for authenticated role", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStub(page);

  await signIn(page, "tecnico@acme.opita.test");
  await expect(page.getByText("Navegacion por rol")).toBeVisible();
  await page.locator("details").filter({ has: page.getByText("Navegacion por rol") }).locator("summary").click();
  await expect(page.getByText("inicio, chat, casos, detalle", { exact: true })).toBeVisible();
});

test("opita sync preserves continuity across the main tecnico journey", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoStub(page);

  await signIn(page, "tecnico@acme.opita.test");

  await page.getByRole("button", { name: "Ir a chat" }).click();
  await expect(page.getByText("Chat / Orchestrator", { exact: true })).toBeVisible();
  await expect(page.getByText("Hilo principal", { exact: true })).toBeVisible();
  await expect(page.locator("textarea")).toBeVisible();

  await page.getByRole("button", { name: "Casos", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Una cola mas limpia para decidir mas rapido." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Casos activos y continuidad" })).toBeVisible();

  await page.getByRole("button", { name: "Ver detalle" }).first().click();
  await expect(page.getByRole("heading", { name: "El caso como centro de continuidad." })).toBeVisible();
  await expect(page.getByText("Bitacora gobernada")).toBeVisible();

  await page.getByRole("button", { name: "Inicio", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Empieza por lo importante y entra al caso correcto mas rapido." })).toBeVisible();
});

test("opita sync keeps admin control primary and secondary context collapsible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await gotoStub(page);

  await signIn(page, "admin@acme.opita.test");
  await openAdminConfig(page);

  await expect(page.getByRole("heading", { name: "Backoffice mas ordenado, menos panel por panel." })).toBeVisible();
  await expect(page.getByText("Gobierno operativo")).toBeVisible();

  const billingDetails = page.locator("details").filter({ has: page.getByText("Billing externo") });
  await expect(billingDetails).toHaveCount(1);
  await expect(billingDetails).not.toHaveAttribute("open", "");

  await billingDetails.locator("summary").click();
  await expect(billingDetails).toHaveAttribute("open", "");
  await expect(page.getByRole("button", { name: "Exportar consumo para billing" })).toBeVisible();
});

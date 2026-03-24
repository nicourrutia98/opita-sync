import bcrypt from "bcryptjs";
import { PrismaClient, RoleKey, PolicyMode, ToolRiskLevel, ToolCertificationState, CasePriority, CaseStatus } from "@prisma/client";
import { loadRootEnv } from "../src/load-root-env.ts";

const prisma = new PrismaClient();

loadRootEnv();

const config = {
  tenantSlug: process.env.OPITA_PROVISION_TENANT_SLUG ?? "tenant-local-real",
  tenantName: process.env.OPITA_PROVISION_TENANT_NAME ?? "Opita Local Real",
  adminName: process.env.OPITA_PROVISION_ADMIN_NAME ?? "Admin Local",
  adminEmail: (process.env.OPITA_PROVISION_ADMIN_EMAIL ?? "admin@local.opita.test").toLowerCase(),
  adminPassword: process.env.OPITA_PROVISION_ADMIN_PASSWORD ?? "Admin1234!",
  aiProvider: process.env.OPITA_PROVISION_AI_PROVIDER ?? "gemini",
  aiBaseUrl: process.env.OPITA_PROVISION_AI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta",
  aiApiKey: process.env.OPITA_PROVISION_AI_API_KEY ?? "",
  aiModel: process.env.OPITA_PROVISION_AI_MODEL ?? "gemini-2.5-flash"
};

async function ensureRole(key, label) {
  return prisma.role.upsert({
    where: { key },
    update: { label },
    create: { key, label }
  });
}

async function ensureTenantParameter(key, label, editable) {
  return prisma.tenantParameter.upsert({
    where: { key },
    update: { label, editable },
    create: { key, label, editable }
  });
}

async function ensureCapability(key, name, description, requiresApproval) {
  return prisma.capability.upsert({
    where: { key },
    update: { name, description, requiresApproval, active: true },
    create: { key, name, description, requiresApproval, active: true }
  });
}

async function ensureTool(key, name, riskLevel, certification, environment, maxPolicyMode) {
  return prisma.tool.upsert({
    where: { key },
    update: { name, riskLevel, certification, environment, maxPolicyMode, active: true },
    create: { key, name, riskLevel, certification, environment, maxPolicyMode, active: true }
  });
}

async function ensureBootstrapConversation({ tenantId, userId, userName, caseId, caseCode }) {
  const existing = await prisma.conversation.findFirst({
    where: { tenantId, userId },
    orderBy: { updatedAt: "desc" }
  });

  if (existing) {
    return existing;
  }

  const conversation = await prisma.conversation.create({
    data: {
      tenantId,
      caseId: caseId ?? null,
      userId,
      title: caseCode ? `${caseCode} · Orquestador Opita` : "Orquestador Opita Sync",
      promptDraft: caseCode
        ? `Necesito apoyo operativo sobre ${caseCode}.`
        : "Necesito ayuda para continuar mi turno operativo."
    }
  });

  await prisma.conversationMessage.create({
    data: {
      tenantId,
      conversationId: conversation.id,
      authorId: null,
      tone: "assistant",
      body: `Hola ${userName}. Ya dejé listo tu hilo operativo con Gemini para que puedas escribir apenas entres.`
    }
  });

  return conversation;
}

async function main() {
  const adminRole = await ensureRole(RoleKey.admin, "Admin tenant");

  const tenant = await prisma.tenant.upsert({
    where: { slug: config.tenantSlug },
    update: { name: config.tenantName },
    create: { slug: config.tenantSlug, name: config.tenantName }
  });

  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: config.adminEmail
      }
    },
    update: {
      fullName: config.adminName,
      passwordHash,
      active: true
    },
    create: {
      tenantId: tenant.id,
      fullName: config.adminName,
      email: config.adminEmail,
      passwordHash,
      active: true
    }
  });

  await prisma.userRoleAssignment.upsert({
    where: {
      tenantId_userId_roleId: {
        tenantId: tenant.id,
        userId: adminUser.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  const [defaultPriority, visibleStatuses, draftTone, aiProvider, aiBaseUrl, aiApiKey, aiModel] = await Promise.all([
    ensureTenantParameter("case.default_priority", "Prioridad por defecto", true),
    ensureTenantParameter("case.visible_statuses", "Estados visibles", false),
    ensureTenantParameter("draft.tone", "Tono de borradores", true),
    ensureTenantParameter("ai.provider", "Proveedor IA", true),
    ensureTenantParameter("ai.base_url", "Base URL API", true),
    ensureTenantParameter("ai.api_key", "API Key", true),
    ensureTenantParameter("ai.model", "Modelo por defecto", true)
  ]);

  await Promise.all([
    prisma.tenantParameterValue.upsert({
      where: { tenantId_parameterId: { tenantId: tenant.id, parameterId: defaultPriority.id } },
      update: { value: "Media" },
      create: { tenantId: tenant.id, parameterId: defaultPriority.id, value: "Media" }
    }),
    prisma.tenantParameterValue.upsert({
      where: { tenantId_parameterId: { tenantId: tenant.id, parameterId: visibleStatuses.id } },
      update: { value: "Nuevo, En curso, Bloqueado, Resuelto" },
      create: { tenantId: tenant.id, parameterId: visibleStatuses.id, value: "Nuevo, En curso, Bloqueado, Resuelto" }
    }),
    prisma.tenantParameterValue.upsert({
      where: { tenantId_parameterId: { tenantId: tenant.id, parameterId: draftTone.id } },
      update: { value: "Operativo formal" },
      create: { tenantId: tenant.id, parameterId: draftTone.id, value: "Operativo formal" }
    }),
    prisma.tenantParameterValue.upsert({
      where: { tenantId_parameterId: { tenantId: tenant.id, parameterId: aiProvider.id } },
      update: { value: config.aiProvider },
      create: { tenantId: tenant.id, parameterId: aiProvider.id, value: config.aiProvider }
    }),
    prisma.tenantParameterValue.upsert({
      where: { tenantId_parameterId: { tenantId: tenant.id, parameterId: aiBaseUrl.id } },
      update: { value: config.aiBaseUrl },
      create: { tenantId: tenant.id, parameterId: aiBaseUrl.id, value: config.aiBaseUrl }
    }),
    prisma.tenantParameterValue.upsert({
      where: { tenantId_parameterId: { tenantId: tenant.id, parameterId: aiApiKey.id } },
      update: { value: config.aiApiKey },
      create: { tenantId: tenant.id, parameterId: aiApiKey.id, value: config.aiApiKey }
    }),
    prisma.tenantParameterValue.upsert({
      where: { tenantId_parameterId: { tenantId: tenant.id, parameterId: aiModel.id } },
      update: { value: config.aiModel },
      create: { tenantId: tenant.id, parameterId: aiModel.id, value: config.aiModel }
    })
  ]);

  const [updateCase, generateDraft, autoClose] = await Promise.all([
    ensureCapability("cap-update-case", "Actualizar caso", "Registra cambios operativos y transiciones autorizadas.", false),
    ensureCapability("cap-generate-draft", "Generar borrador", "Crea borradores contextuales para seguimiento.", true),
    ensureCapability("cap-auto-close", "Cierre automatico", "Cierra casos con checklist validado.", true)
  ]);

  await Promise.all([
    prisma.tenantCapabilityState.upsert({
      where: { tenantId_capabilityId: { tenantId: tenant.id, capabilityId: updateCase.id } },
      update: { enabled: true, policyMode: PolicyMode.confirm_then_execute },
      create: { tenantId: tenant.id, capabilityId: updateCase.id, enabled: true, policyMode: PolicyMode.confirm_then_execute }
    }),
    prisma.tenantCapabilityState.upsert({
      where: { tenantId_capabilityId: { tenantId: tenant.id, capabilityId: generateDraft.id } },
      update: { enabled: true, policyMode: PolicyMode.suggest },
      create: { tenantId: tenant.id, capabilityId: generateDraft.id, enabled: true, policyMode: PolicyMode.suggest }
    }),
    prisma.tenantCapabilityState.upsert({
      where: { tenantId_capabilityId: { tenantId: tenant.id, capabilityId: autoClose.id } },
      update: { enabled: false, policyMode: PolicyMode.auto_execute },
      create: { tenantId: tenant.id, capabilityId: autoClose.id, enabled: false, policyMode: PolicyMode.auto_execute }
    })
  ]);

  const [pressureReader, workOrderWriter] = await Promise.all([
    ensureTool("tool-pressure-reader", "Lectura de sensores", ToolRiskLevel.low, ToolCertificationState.certified, "production", PolicyMode.auto_execute),
    ensureTool("tool-work-order-write", "Actualizacion orden trabajo", ToolRiskLevel.high, ToolCertificationState.certified, "production", PolicyMode.confirm_then_execute)
  ]);

  await Promise.all([
    prisma.toolPolicyOverride.upsert({
      where: { tenantId_toolId: { tenantId: tenant.id, toolId: pressureReader.id } },
      update: { tenantOverrideAllowed: false, blockedReason: null },
      create: { tenantId: tenant.id, toolId: pressureReader.id, tenantOverrideAllowed: false, blockedReason: null }
    }),
    prisma.toolPolicyOverride.upsert({
      where: { tenantId_toolId: { tenantId: tenant.id, toolId: workOrderWriter.id } },
      update: { tenantOverrideAllowed: false, blockedReason: "Se requiere confirmacion en produccion." },
      create: { tenantId: tenant.id, toolId: workOrderWriter.id, tenantOverrideAllowed: false, blockedReason: "Se requiere confirmacion en produccion." }
    })
  ]);

  const seededCase = await prisma.case.upsert({
    where: {
      tenantId_code: {
        tenantId: tenant.id,
        code: "CAS-2048"
      }
    },
    update: {
      title: "Validar integracion del asistente",
      site: "Centro de control maximfishing",
      priority: CasePriority.Alta,
      status: CaseStatus.En_curso,
      summary: "Caso base para probar configuracion, chat y seguimiento del orquestador.",
      suggestedAction: "Confirmar conexion del asistente y enviar un turno de prueba."
    },
    create: {
      tenantId: tenant.id,
      code: "CAS-2048",
      title: "Validar integracion del asistente",
      site: "Centro de control maximfishing",
      priority: CasePriority.Alta,
      status: CaseStatus.En_curso,
      summary: "Caso base para probar configuracion, chat y seguimiento del orquestador.",
      suggestedAction: "Confirmar conexion del asistente y enviar un turno de prueba."
    }
  });

  await prisma.caseAssignment.upsert({
    where: {
      tenantId_caseId_userId: {
        tenantId: tenant.id,
        caseId: seededCase.id,
        userId: adminUser.id
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      caseId: seededCase.id,
      userId: adminUser.id
    }
  });

  await ensureBootstrapConversation({
    tenantId: tenant.id,
    userId: adminUser.id,
    userName: config.adminName,
    caseId: seededCase.id,
    caseCode: "CAS-2048"
  });

  await Promise.all([
    prisma.retentionPolicy.upsert({
      where: { tenantId: tenant.id },
      update: {
        operationalRetentionDays: 365,
        auditRetentionDays: 1825,
        anonymizationRequiredForReuse: true,
        dataReuseDefaultOptIn: false
      },
      create: {
        tenantId: tenant.id,
        operationalRetentionDays: 365,
        auditRetentionDays: 1825,
        anonymizationRequiredForReuse: true,
        dataReuseDefaultOptIn: false
      }
    }),
    prisma.dataReuseConsent.upsert({
      where: { tenantId: tenant.id },
      update: {
        enabled: false,
        updatedAt: new Date(),
        auditId: "AUD-PROVISION-CONSENT-01"
      },
      create: {
        tenantId: tenant.id,
        enabled: false,
        auditId: "AUD-PROVISION-CONSENT-01"
      }
    }),
    prisma.valueMetricSnapshot.upsert({
      where: { id: `provision-value-snapshot-${tenant.slug}` },
      update: {
        tenantId: tenant.id,
        periodLabel: "Ultimos 7 dias",
        role: RoleKey.admin,
        payload: [
          {
            id: "value-admin-surface",
            label: "Superficies activas",
            value: "6",
            trend: "Listas",
            positiveImpact: "Backoffice real conectado sin stub."
          }
        ]
      },
      create: {
        id: `provision-value-snapshot-${tenant.slug}`,
        tenantId: tenant.id,
        periodLabel: "Ultimos 7 dias",
        role: RoleKey.admin,
        payload: [
          {
            id: "value-admin-surface",
            label: "Superficies activas",
            value: "6",
            trend: "Listas",
            positiveImpact: "Backoffice real conectado sin stub."
          }
        ]
      }
    }),
    prisma.usageEvent.upsert({
      where: { id: `provision-usage-${tenant.slug}` },
      update: {
        tenantId: tenant.id,
        successful: true,
        estimatedTokens: 1200
      },
      create: {
        id: `provision-usage-${tenant.slug}`,
        tenantId: tenant.id,
        successful: true,
        estimatedTokens: 1200
      }
    }),
    prisma.deployment.upsert({
      where: { id: `provision-deployment-${tenant.slug}` },
      update: {
        tenantId: tenant.id,
        channel: "production",
        versionTag: "local-admin-bootstrap"
      },
      create: {
        id: `provision-deployment-${tenant.slug}`,
        tenantId: tenant.id,
        channel: "production",
        versionTag: "local-admin-bootstrap"
      }
    }),
    prisma.navigationManifest.upsert({
      where: {
        tenantId_role: {
          tenantId: tenant.id,
          role: RoleKey.admin
        }
      },
      update: {
        primaryViews: ["chat", "inicio", "casos", "detalle", "configuracion"],
        backofficeViews: ["chat", "configuracion"]
      },
      create: {
        tenantId: tenant.id,
        role: RoleKey.admin,
        primaryViews: ["chat", "inicio", "casos", "detalle", "configuracion"],
        backofficeViews: ["chat", "configuracion"]
      }
    })
  ]);

  console.log("Provision complete.");
  console.log(`tenant_slug=${config.tenantSlug}`);
  console.log(`tenant_name=${config.tenantName}`);
  console.log(`admin_email=${config.adminEmail}`);
  console.log(`admin_name=${config.adminName}`);
  console.log("admin_role=admin");
  console.log("admin_password=<provided via env or default Admin1234!>");
}

main()
  .catch((error) => {
    console.error("Provision failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

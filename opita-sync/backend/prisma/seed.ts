import bcrypt from "bcryptjs";
import { PrismaClient, RoleKey, CaseStatus, CasePriority, MessageTone, PolicyMode, ToolRiskLevel, ToolCertificationState, GovernanceActionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureRole(role: RoleKey, label: string) {
  return prisma.role.upsert({
    where: { key: role },
    update: { label },
    create: { key: role, label }
  });
}

async function main() {
  const [solicitanteRole, tecnicoRole, supervisorRole, adminRole] = await Promise.all([
    ensureRole(RoleKey.solicitante, "Solicitante"),
    ensureRole(RoleKey.tecnico, "Tecnico"),
    ensureRole(RoleKey.supervisor, "Supervisor"),
    ensureRole(RoleKey.admin, "Admin tenant")
  ]);

  const tenants = await Promise.all([
    prisma.tenant.upsert({
      where: { slug: "acme-industrial" },
      update: { name: "Acme Industrial" },
      create: { slug: "acme-industrial", name: "Acme Industrial" }
    }),
    prisma.tenant.upsert({
      where: { slug: "bio-petro" },
      update: { name: "Bio Petro" },
      create: { slug: "bio-petro", name: "Bio Petro" }
    })
  ]);

  const passwordHash = await bcrypt.hash("Demo1234!", 10);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenants[0].id, email: "solicitante@acme.opita.test" } },
      update: { fullName: "Ana Pineda", passwordHash, active: true },
      create: { tenantId: tenants[0].id, fullName: "Ana Pineda", email: "solicitante@acme.opita.test", passwordHash }
    }),
    prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenants[0].id, email: "tecnico@acme.opita.test" } },
      update: { fullName: "Laura Rojas", passwordHash, active: true },
      create: { tenantId: tenants[0].id, fullName: "Laura Rojas", email: "tecnico@acme.opita.test", passwordHash }
    }),
    prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenants[0].id, email: "supervisor@acme.opita.test" } },
      update: { fullName: "Diego Gil", passwordHash, active: true },
      create: { tenantId: tenants[0].id, fullName: "Diego Gil", email: "supervisor@acme.opita.test", passwordHash }
    }),
    prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenants[0].id, email: "admin@acme.opita.test" } },
      update: { fullName: "Paula Mejia", passwordHash, active: true },
      create: { tenantId: tenants[0].id, fullName: "Paula Mejia", email: "admin@acme.opita.test", passwordHash }
    })
  ]);

  const roleMap = [
    { userId: users[0].id, roleId: solicitanteRole.id },
    { userId: users[1].id, roleId: tecnicoRole.id },
    { userId: users[2].id, roleId: supervisorRole.id },
    { userId: users[3].id, roleId: adminRole.id }
  ];
  for (const item of roleMap) {
    await prisma.userRoleAssignment.upsert({
      where: { tenantId_userId_roleId: { tenantId: tenants[0].id, userId: item.userId, roleId: item.roleId } },
      update: {},
      create: { tenantId: tenants[0].id, userId: item.userId, roleId: item.roleId }
    });
  }

  const capabilities = await Promise.all([
    prisma.capability.upsert({
      where: { key: "cap-update-case" },
      update: { name: "Actualizar caso", description: "Registra cambios operativos y transiciones autorizadas.", requiresApproval: false, active: true },
      create: { key: "cap-update-case", name: "Actualizar caso", description: "Registra cambios operativos y transiciones autorizadas.", requiresApproval: false, active: true }
    }),
    prisma.capability.upsert({
      where: { key: "cap-generate-draft" },
      update: { name: "Generar borrador", description: "Genera borradores contextuales para seguimiento.", requiresApproval: true, active: true },
      create: { key: "cap-generate-draft", name: "Generar borrador", description: "Genera borradores contextuales para seguimiento.", requiresApproval: true, active: true }
    }),
    prisma.capability.upsert({
      where: { key: "cap-auto-close" },
      update: { name: "Cierre automatico", description: "Cierre controlado de casos con checklist.", requiresApproval: true, active: true },
      create: { key: "cap-auto-close", name: "Cierre automatico", description: "Cierre controlado de casos con checklist.", requiresApproval: true, active: true }
    })
  ]);

  for (const capability of capabilities) {
    await prisma.tenantCapabilityState.upsert({
      where: { tenantId_capabilityId: { tenantId: tenants[0].id, capabilityId: capability.id } },
      update: {
        enabled: capability.key !== "cap-auto-close",
        policyMode: capability.key === "cap-update-case" ? PolicyMode.confirm_then_execute : PolicyMode.suggest
      },
      create: {
        tenantId: tenants[0].id,
        capabilityId: capability.id,
        enabled: capability.key !== "cap-auto-close",
        policyMode: capability.key === "cap-update-case" ? PolicyMode.confirm_then_execute : PolicyMode.suggest
      }
    });
  }

  const tools = await Promise.all([
    prisma.tool.upsert({
      where: { key: "tool-pressure-reader" },
      update: { name: "Lectura de sensores", riskLevel: ToolRiskLevel.low, certification: ToolCertificationState.certified, environment: "production", maxPolicyMode: PolicyMode.auto_execute, active: true },
      create: { key: "tool-pressure-reader", name: "Lectura de sensores", riskLevel: ToolRiskLevel.low, certification: ToolCertificationState.certified, environment: "production", maxPolicyMode: PolicyMode.auto_execute, active: true }
    }),
    prisma.tool.upsert({
      where: { key: "tool-work-order-write" },
      update: { name: "Actualizacion orden trabajo", riskLevel: ToolRiskLevel.high, certification: ToolCertificationState.certified, environment: "production", maxPolicyMode: PolicyMode.confirm_then_execute, active: true },
      create: { key: "tool-work-order-write", name: "Actualizacion orden trabajo", riskLevel: ToolRiskLevel.high, certification: ToolCertificationState.certified, environment: "production", maxPolicyMode: PolicyMode.confirm_then_execute, active: true }
    })
  ]);

  for (const capability of capabilities.slice(0, 2)) {
    for (const tool of tools) {
      await prisma.toolCapabilityLink.upsert({
        where: { capabilityId_toolId: { capabilityId: capability.id, toolId: tool.id } },
        update: {},
        create: { capabilityId: capability.id, toolId: tool.id }
      });
      await prisma.toolPolicyOverride.upsert({
        where: { tenantId_toolId: { tenantId: tenants[0].id, toolId: tool.id } },
        update: { tenantOverrideAllowed: false, blockedReason: tool.key === "tool-work-order-write" ? "Se requiere confirmación en producción." : null },
        create: { tenantId: tenants[0].id, toolId: tool.id, tenantOverrideAllowed: false, blockedReason: tool.key === "tool-work-order-write" ? "Se requiere confirmación en producción." : null }
      });
    }
  }

  const params = await Promise.all([
    prisma.tenantParameter.upsert({
      where: { key: "case.default_priority" },
      update: { label: "Prioridad por defecto", editable: true },
      create: { key: "case.default_priority", label: "Prioridad por defecto", editable: true }
    }),
    prisma.tenantParameter.upsert({
      where: { key: "case.visible_statuses" },
      update: { label: "Estados visibles", editable: false },
      create: { key: "case.visible_statuses", label: "Estados visibles", editable: false }
    }),
    prisma.tenantParameter.upsert({
      where: { key: "draft.tone" },
      update: { label: "Tono de borradores", editable: true },
      create: { key: "draft.tone", label: "Tono de borradores", editable: true }
    })
  ]);
  const paramValues = [
    { parameterId: params[0].id, value: "Media" },
    { parameterId: params[1].id, value: "Nuevo, En curso, Bloqueado, Resuelto" },
    { parameterId: params[2].id, value: "Operativo formal" }
  ];
  for (const p of paramValues) {
    await prisma.tenantParameterValue.upsert({
      where: { tenantId_parameterId: { tenantId: tenants[0].id, parameterId: p.parameterId } },
      update: { value: p.value },
      create: { tenantId: tenants[0].id, parameterId: p.parameterId, value: p.value }
    });
  }

  const cases = await Promise.all([
    prisma.case.upsert({
      where: { tenantId_code: { tenantId: tenants[0].id, code: "CAS-2048" } },
      update: {
        title: "Falla intermitente en compresor principal",
        site: "Planta Norte",
        priority: CasePriority.Alta,
        status: CaseStatus.En_curso,
        summary: "Variación de presión detectada; técnico en sitio.",
        suggestedAction: "Registrar avance y generar borrador"
      },
      create: {
        tenantId: tenants[0].id,
        code: "CAS-2048",
        title: "Falla intermitente en compresor principal",
        site: "Planta Norte",
        priority: CasePriority.Alta,
        status: CaseStatus.En_curso,
        summary: "Variación de presión detectada; técnico en sitio.",
        suggestedAction: "Registrar avance y generar borrador"
      }
    }),
    prisma.case.upsert({
      where: { tenantId_code: { tenantId: tenants[0].id, code: "CAS-2035" } },
      update: {
        title: "Revision de valvula de seguridad",
        site: "Planta Sur",
        priority: CasePriority.Alta,
        status: CaseStatus.Bloqueado,
        summary: "Bloqueado por aprobación de repuesto.",
        suggestedAction: "Aprobar repuesto y destrabar orden"
      },
      create: {
        tenantId: tenants[0].id,
        code: "CAS-2035",
        title: "Revision de valvula de seguridad",
        site: "Planta Sur",
        priority: CasePriority.Alta,
        status: CaseStatus.Bloqueado,
        summary: "Bloqueado por aprobación de repuesto.",
        suggestedAction: "Aprobar repuesto y destrabar orden"
      }
    })
  ]);

  await prisma.caseAssignment.upsert({
    where: { tenantId_caseId_userId: { tenantId: tenants[0].id, caseId: cases[0].id, userId: users[1].id } },
    update: {},
    create: { tenantId: tenants[0].id, caseId: cases[0].id, userId: users[1].id }
  });

  const convo = await prisma.conversation.create({
    data: {
      tenantId: tenants[0].id,
      caseId: cases[0].id,
      userId: users[1].id,
      title: "Intencion operativa con contexto",
      promptDraft: "Resume condición del compresor y propone siguiente paso."
    }
  });
  await prisma.conversationMessage.createMany({
    data: [
      { tenantId: tenants[0].id, conversationId: convo.id, authorId: users[1].id, tone: MessageTone.user, body: "Necesito actualizar caso y notificar supervisor." },
      { tenantId: tenants[0].id, conversationId: convo.id, authorId: null, tone: MessageTone.assistant, body: "Capacidad detectada: actualizar caso y generar borrador." }
    ]
  });

  await prisma.operationalLogEntry.create({
    data: {
      tenantId: tenants[0].id,
      caseId: cases[0].id,
      authorId: users[1].id,
      type: "Avance",
      detail: "Presión estabilizada tras ajuste inicial.",
      visibility: "internal",
      beforeValue: "78 psi",
      afterValue: "64 psi",
      auditId: "AUD-SEED-LOG-01",
      evidence: { create: { tenantId: tenants[0].id, label: "Foto tablero compresor" } }
    }
  });

  await prisma.valueMetricSnapshot.upsert({
    where: { id: "seed-value-snapshot-tecnico" },
    update: { periodLabel: "Ultimos 7 dias", role: RoleKey.tecnico, payload: [{ id: "value-positive-actions", label: "Acciones positivas", value: "126", trend: "+18%", positiveImpact: "Resoluciones sin retrabajo." }] },
    create: { id: "seed-value-snapshot-tecnico", tenantId: tenants[0].id, periodLabel: "Ultimos 7 dias", role: RoleKey.tecnico, payload: [{ id: "value-positive-actions", label: "Acciones positivas", value: "126", trend: "+18%", positiveImpact: "Resoluciones sin retrabajo." }] }
  });
  await prisma.valueMetricSnapshot.upsert({
    where: { id: "seed-value-snapshot-supervisor" },
    update: { periodLabel: "Ultimos 7 dias", role: RoleKey.supervisor, payload: [{ id: "value-sla", label: "SLA protegido", value: "92%", trend: "+4%", positiveImpact: "Escalamientos tempranos." }] },
    create: { id: "seed-value-snapshot-supervisor", tenantId: tenants[0].id, periodLabel: "Ultimos 7 dias", role: RoleKey.supervisor, payload: [{ id: "value-sla", label: "SLA protegido", value: "92%", trend: "+4%", positiveImpact: "Escalamientos tempranos." }] }
  });

  await prisma.usageEvent.createMany({
    data: [
      { tenantId: tenants[0].id, caseId: cases[0].id, successful: true, estimatedTokens: 1600 },
      { tenantId: tenants[0].id, caseId: cases[1].id, successful: true, estimatedTokens: 2100 },
      { tenantId: tenants[0].id, successful: false, estimatedTokens: 900 }
    ]
  });

  await prisma.retentionPolicy.upsert({
    where: { tenantId: tenants[0].id },
    update: {
      operationalRetentionDays: 365,
      auditRetentionDays: 1825,
      anonymizationRequiredForReuse: true,
      dataReuseDefaultOptIn: false
    },
    create: {
      tenantId: tenants[0].id,
      operationalRetentionDays: 365,
      auditRetentionDays: 1825,
      anonymizationRequiredForReuse: true,
      dataReuseDefaultOptIn: false
    }
  });

  await prisma.dataReuseConsent.upsert({
    where: { tenantId: tenants[0].id },
    update: { enabled: false, auditId: "AUD-SEED-CONSENT-01", updatedAt: new Date() },
    create: { tenantId: tenants[0].id, enabled: false, auditId: "AUD-SEED-CONSENT-01" }
  });

  await prisma.navigationManifest.upsert({
    where: { tenantId_role: { tenantId: tenants[0].id, role: RoleKey.tecnico } },
    update: { primaryViews: ["inicio", "chat", "casos", "detalle"], backofficeViews: [] },
    create: { tenantId: tenants[0].id, role: RoleKey.tecnico, primaryViews: ["inicio", "chat", "casos", "detalle"], backofficeViews: [] }
  });
  await prisma.navigationManifest.upsert({
    where: { tenantId_role: { tenantId: tenants[0].id, role: RoleKey.admin } },
    update: { primaryViews: ["inicio", "casos", "configuracion"], backofficeViews: ["inicio", "configuracion"] },
    create: { tenantId: tenants[0].id, role: RoleKey.admin, primaryViews: ["inicio", "casos", "configuracion"], backofficeViews: ["inicio", "configuracion"] }
  });

  await prisma.governanceAction.create({
    data: {
      tenantId: tenants[0].id,
      actorUserId: users[3].id,
      action: "approve_capability",
      status: GovernanceActionStatus.success,
      auditId: "AUD-SEED-GOV-01",
      detail: "Aprobación inicial de capacidad."
    }
  });
  await prisma.deployment.create({
    data: { tenantId: tenants[0].id, channel: "production", versionTag: "seed-v1" }
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete. Demo users password: Demo1234!");
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

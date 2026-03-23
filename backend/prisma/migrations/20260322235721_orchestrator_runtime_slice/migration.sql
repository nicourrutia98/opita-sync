-- CreateEnum
CREATE TYPE "ToolRiskLevel" AS ENUM ('READ_ONLY', 'DRAFT_ONLY', 'WRITE_WITH_CONFIRMATION', 'AUTO_EXECUTABLE_LOW_RISK');

-- CreateEnum
CREATE TYPE "ToolExecutionMode" AS ENUM ('SUGGEST', 'CONFIRM_THEN_EXECUTE', 'AUTO_EXECUTE');

-- CreateEnum
CREATE TYPE "ToolCertificationStatus" AS ENUM ('DRAFT', 'REVIEWED', 'CERTIFIED', 'PRODUCTION', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "ToolExecutionResult" AS ENUM ('SUCCESS', 'FAILED', 'BLOCKED', 'REQUIRES_CONFIRMATION');

-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'CONFIRMED', 'REJECTED');

-- CreateTable
CREATE TABLE "tool_registry" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tool_code" TEXT NOT NULL,
    "tool_version" TEXT NOT NULL,
    "capability_code" TEXT NOT NULL,
    "tool_type" TEXT NOT NULL,
    "risk_level" "ToolRiskLevel" NOT NULL,
    "execution_mode" "ToolExecutionMode" NOT NULL,
    "certification_status" "ToolCertificationStatus" NOT NULL,
    "tenant_scope_mode" TEXT NOT NULL,
    "permissions_required_json" JSONB NOT NULL,
    "requires_provider" BOOLEAN NOT NULL DEFAULT false,
    "rollback_strategy" TEXT NOT NULL,
    "input_contract_ref" TEXT NOT NULL,
    "output_contract_ref" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_policy_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "capability_code" TEXT NOT NULL,
    "tool_code" TEXT NOT NULL,
    "tool_version" TEXT NOT NULL,
    "risk_level" "ToolRiskLevel" NOT NULL,
    "default_execution_mode" "ToolExecutionMode" NOT NULL,
    "tenant_override_json" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_policy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_execution_attempts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "case_id" TEXT,
    "actor_user_id" TEXT,
    "intent_code" TEXT,
    "capability_code" TEXT NOT NULL,
    "tool_code" TEXT NOT NULL,
    "tool_version" TEXT NOT NULL,
    "execution_mode" "ToolExecutionMode" NOT NULL,
    "confirmation_required" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_status" "ConfirmationStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "execution_result" "ToolExecutionResult" NOT NULL,
    "request_payload_json" JSONB,
    "response_payload_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_execution_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positive_actions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "case_id" TEXT,
    "actor_user_id" TEXT,
    "capability_code" TEXT NOT NULL,
    "tool_code" TEXT NOT NULL,
    "tool_version" TEXT NOT NULL,
    "execution_attempt_id" TEXT NOT NULL,
    "audit_event_id" TEXT,
    "provider_trace_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positive_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tool_registry_tenant_id_capability_code_certification_statu_idx" ON "tool_registry"("tenant_id", "capability_code", "certification_status");

-- CreateIndex
CREATE UNIQUE INDEX "tool_registry_tenant_id_tool_code_tool_version_key" ON "tool_registry"("tenant_id", "tool_code", "tool_version");

-- CreateIndex
CREATE INDEX "action_policy_rules_tenant_id_capability_code_idx" ON "action_policy_rules"("tenant_id", "capability_code");

-- CreateIndex
CREATE UNIQUE INDEX "action_policy_rules_tenant_id_capability_code_tool_code_too_key" ON "action_policy_rules"("tenant_id", "capability_code", "tool_code", "tool_version");

-- CreateIndex
CREATE INDEX "tool_execution_attempts_tenant_id_capability_code_created_a_idx" ON "tool_execution_attempts"("tenant_id", "capability_code", "created_at");

-- CreateIndex
CREATE INDEX "tool_execution_attempts_tenant_id_tool_code_tool_version_cr_idx" ON "tool_execution_attempts"("tenant_id", "tool_code", "tool_version", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "positive_actions_execution_attempt_id_key" ON "positive_actions"("execution_attempt_id");

-- CreateIndex
CREATE INDEX "positive_actions_tenant_id_capability_code_created_at_idx" ON "positive_actions"("tenant_id", "capability_code", "created_at");

-- CreateIndex
CREATE INDEX "positive_actions_tenant_id_tool_code_tool_version_created_a_idx" ON "positive_actions"("tenant_id", "tool_code", "tool_version", "created_at");

-- AddForeignKey
ALTER TABLE "tool_registry" ADD CONSTRAINT "tool_registry_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_policy_rules" ADD CONSTRAINT "action_policy_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_policy_rules" ADD CONSTRAINT "action_policy_rules_tenant_id_tool_code_tool_version_fkey" FOREIGN KEY ("tenant_id", "tool_code", "tool_version") REFERENCES "tool_registry"("tenant_id", "tool_code", "tool_version") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_execution_attempts" ADD CONSTRAINT "tool_execution_attempts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_execution_attempts" ADD CONSTRAINT "tool_execution_attempts_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_execution_attempts" ADD CONSTRAINT "tool_execution_attempts_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_execution_attempts" ADD CONSTRAINT "tool_execution_attempts_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_execution_attempts" ADD CONSTRAINT "tool_execution_attempts_tenant_id_tool_code_tool_version_fkey" FOREIGN KEY ("tenant_id", "tool_code", "tool_version") REFERENCES "tool_registry"("tenant_id", "tool_code", "tool_version") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positive_actions" ADD CONSTRAINT "positive_actions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positive_actions" ADD CONSTRAINT "positive_actions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positive_actions" ADD CONSTRAINT "positive_actions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positive_actions" ADD CONSTRAINT "positive_actions_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positive_actions" ADD CONSTRAINT "positive_actions_execution_attempt_id_fkey" FOREIGN KEY ("execution_attempt_id") REFERENCES "tool_execution_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positive_actions" ADD CONSTRAINT "positive_actions_provider_trace_id_fkey" FOREIGN KEY ("provider_trace_id") REFERENCES "llm_traces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

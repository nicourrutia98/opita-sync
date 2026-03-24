CREATE TYPE "AssistantRunStatus" AS ENUM ('queued', 'running', 'completed', 'error', 'cancelled');

CREATE TYPE "AssistantRunPhase" AS ENUM ('thinking', 'reasoning', 'using_tool', 'reading_context', 'drafting', 'completed', 'error', 'cancelled');

ALTER TABLE "ConversationMessage" ADD COLUMN "runId" TEXT;

CREATE TABLE "AssistantRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userMessageId" TEXT,
    "assistantMessageId" TEXT,
    "status" "AssistantRunStatus" NOT NULL DEFAULT 'queued',
    "phase" "AssistantRunPhase" NOT NULL DEFAULT 'thinking',
    "provider" TEXT,
    "model" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    CONSTRAINT "AssistantRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AssistantRun_tenantId_conversationId_updatedAt_idx" ON "AssistantRun"("tenantId", "conversationId", "updatedAt");

ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AssistantRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AssistantRun" ADD CONSTRAINT "AssistantRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssistantRun" ADD CONSTRAINT "AssistantRun_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

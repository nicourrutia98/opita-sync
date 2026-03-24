ALTER TABLE "Conversation" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "Conversation_tenantId_userId_archivedAt_updatedAt_idx"
ON "Conversation"("tenantId", "userId", "archivedAt", "updatedAt");

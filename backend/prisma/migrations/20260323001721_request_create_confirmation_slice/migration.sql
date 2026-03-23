-- CreateEnum
CREATE TYPE "ConfirmationRequestStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "confirmation_requests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "case_id" TEXT,
    "actor_user_id" TEXT NOT NULL,
    "capability_code" TEXT NOT NULL,
    "tool_code" TEXT NOT NULL,
    "tool_version" TEXT NOT NULL,
    "confirmation_code" TEXT NOT NULL,
    "status" "ConfirmationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requested_payload_json" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "confirmed_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "confirmation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "confirmation_requests_tenant_id_capability_code_created_at_idx" ON "confirmation_requests"("tenant_id", "capability_code", "created_at");

-- CreateIndex
CREATE INDEX "confirmation_requests_tenant_id_status_expires_at_idx" ON "confirmation_requests"("tenant_id", "status", "expires_at");

-- AddForeignKey
ALTER TABLE "confirmation_requests" ADD CONSTRAINT "confirmation_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_requests" ADD CONSTRAINT "confirmation_requests_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_requests" ADD CONSTRAINT "confirmation_requests_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_requests" ADD CONSTRAINT "confirmation_requests_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_requests" ADD CONSTRAINT "confirmation_requests_confirmed_by_user_id_fkey" FOREIGN KEY ("confirmed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

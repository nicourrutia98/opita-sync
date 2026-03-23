ALTER TABLE "users"
ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'es-CO',
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Bogota',
ADD COLUMN "accessibility_overrides_json" JSONB;

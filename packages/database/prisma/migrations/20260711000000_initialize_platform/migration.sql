-- Infrastructure-only baseline. Business tables are intentionally absent.
CREATE TABLE "platform_metadata" (
    "key" VARCHAR(100) NOT NULL,
    "value" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "platform_metadata_pkey" PRIMARY KEY ("key")
);

COMMENT ON TABLE "platform_metadata" IS 'Non-business metadata used to validate the platform lifecycle.';

-- CreateTable
CREATE TABLE "log_entries" (
    "id" SERIAL NOT NULL,
    "log" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" JSONB,

    CONSTRAINT "log_entries_pkey" PRIMARY KEY ("id")
);

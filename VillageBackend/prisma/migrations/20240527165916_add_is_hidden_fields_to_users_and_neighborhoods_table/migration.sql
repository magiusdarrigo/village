-- AlterTable
ALTER TABLE "neighborhoods" ADD COLUMN     "is_hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_hidden" BOOLEAN NOT NULL DEFAULT false;

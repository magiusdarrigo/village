-- AlterTable
ALTER TABLE "users" ADD COLUMN     "selected_neighborhoods" JSONB[] DEFAULT ARRAY[]::JSONB[];

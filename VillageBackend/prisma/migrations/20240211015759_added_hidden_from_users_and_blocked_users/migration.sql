-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "hidden_from_users" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "blocked_users" JSONB;

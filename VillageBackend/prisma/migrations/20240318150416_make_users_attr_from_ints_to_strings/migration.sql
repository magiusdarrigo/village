-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "hidden_from_users" SET DATA TYPE TEXT[];

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "blocked_users" SET DATA TYPE TEXT[];

/*
  Warnings:

  - The `hidden_from_users` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `blocked_users` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "hidden_from_users",
ADD COLUMN     "hidden_from_users" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "blocked_users",
ADD COLUMN     "blocked_users" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

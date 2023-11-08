/*
  Warnings:

  - Added the required column `user_id_reporting` to the `reported_posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reported_posts" ADD COLUMN     "user_id_reporting" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "reported_posts" ADD CONSTRAINT "reported_posts_user_id_reporting_fkey" FOREIGN KEY ("user_id_reporting") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

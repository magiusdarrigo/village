/*
  Warnings:

  - A unique constraint covering the columns `[follower_user_id,following_user_id]` on the table `user_following` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "idx_userfollowing_relationship";

-- CreateIndex
CREATE UNIQUE INDEX "user_following_follower_user_id_following_user_id_key" ON "user_following"("follower_user_id", "following_user_id");

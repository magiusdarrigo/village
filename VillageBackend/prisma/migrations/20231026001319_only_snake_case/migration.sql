/*
  Warnings:

  - You are about to drop the column `createdAt` on the `buildings` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhoodID` on the `buildings` table. All the data in the column will be lost.
  - You are about to drop the column `buildingID` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `commentID` on the `comment_likes` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `comment_likes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `likesCount` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `parentCommentID` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `postID` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `neighborhoods` table. All the data in the column will be lost.
  - You are about to drop the column `postID` on the `post_likes` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `post_likes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `imageURL` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `likesCount` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhoodID` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user_following` table. All the data in the column will be lost.
  - You are about to drop the column `followerUserID` on the `user_following` table. All the data in the column will be lost.
  - You are about to drop the column `followingUserID` on the `user_following` table. All the data in the column will be lost.
  - You are about to drop the column `buildingID` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `followersCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `followingCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhoodID` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,comment_id]` on the table `comment_likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,post_id]` on the table `post_likes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `neighborhood_id` to the `buildings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `building_id` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text_content` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `comment_id` to the `comment_likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `comment_likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text_content` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_id` to the `post_likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `post_likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood_id` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `follower_user_id` to the `user_following` table without a default value. This is not possible if the table is not empty.
  - Added the required column `following_user_id` to the `user_following` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "buildings" DROP CONSTRAINT "buildings_neighborhoodID_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_buildingID_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_userID_fkey";

-- DropForeignKey
ALTER TABLE "comment_likes" DROP CONSTRAINT "comment_likes_commentID_fkey";

-- DropForeignKey
ALTER TABLE "comment_likes" DROP CONSTRAINT "comment_likes_userID_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parentCommentID_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_postID_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userID_fkey";

-- DropForeignKey
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_postID_fkey";

-- DropForeignKey
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_userID_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_neighborhoodID_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_userID_fkey";

-- DropForeignKey
ALTER TABLE "user_following" DROP CONSTRAINT "user_following_followerUserID_fkey";

-- DropForeignKey
ALTER TABLE "user_following" DROP CONSTRAINT "user_following_followingUserID_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_buildingID_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_neighborhoodID_fkey";

-- DropIndex
DROP INDEX "comment_likes_userID_commentID_key";

-- DropIndex
DROP INDEX "idx_comment_parent_comment";

-- DropIndex
DROP INDEX "idx_comment_post_likes";

-- DropIndex
DROP INDEX "post_likes_userID_postID_key";

-- DropIndex
DROP INDEX "idx_post_neighborhood_createdat";

-- DropIndex
DROP INDEX "idx_post_user_createdat";

-- DropIndex
DROP INDEX "idx_userfollowing_relationship";

-- AlterTable
ALTER TABLE "buildings" DROP COLUMN "createdAt",
DROP COLUMN "neighborhoodID",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "neighborhood_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "buildingID",
DROP COLUMN "createdAt",
DROP COLUMN "textContent",
DROP COLUMN "userID",
ADD COLUMN     "building_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "text_content" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "comment_likes" DROP COLUMN "commentID",
DROP COLUMN "userID",
ADD COLUMN     "comment_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "createdAt",
DROP COLUMN "likesCount",
DROP COLUMN "parentCommentID",
DROP COLUMN "postID",
DROP COLUMN "textContent",
DROP COLUMN "userID",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "likes_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parent_comment_id" INTEGER,
ADD COLUMN     "post_id" INTEGER NOT NULL,
ADD COLUMN     "text_content" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "neighborhoods" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "post_likes" DROP COLUMN "postID",
DROP COLUMN "userID",
ADD COLUMN     "post_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "createdAt",
DROP COLUMN "imageURL",
DROP COLUMN "likesCount",
DROP COLUMN "neighborhoodID",
DROP COLUMN "textContent",
DROP COLUMN "userID",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image_url" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "likes_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "neighborhood_id" INTEGER NOT NULL,
ADD COLUMN     "text_content" TEXT,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_following" DROP COLUMN "createdAt",
DROP COLUMN "followerUserID",
DROP COLUMN "followingUserID",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "follower_user_id" INTEGER NOT NULL,
ADD COLUMN     "following_user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "buildingID",
DROP COLUMN "createdAt",
DROP COLUMN "followersCount",
DROP COLUMN "followingCount",
DROP COLUMN "isVerified",
DROP COLUMN "neighborhoodID",
ADD COLUMN     "building_id" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "followers_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "following_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "neighborhood_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "comment_likes_user_id_comment_id_key" ON "comment_likes"("user_id", "comment_id");

-- CreateIndex
CREATE INDEX "idx_comment_post_likes" ON "comments"("post_id", "likes_count");

-- CreateIndex
CREATE INDEX "idx_comment_parent_comment" ON "comments"("parent_comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_user_id_post_id_key" ON "post_likes"("user_id", "post_id");

-- CreateIndex
CREATE INDEX "idx_post_neighborhood_created_at" ON "posts"("neighborhood_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_post_user_created_at" ON "posts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_userfollowing_relationship" ON "user_following"("follower_user_id", "following_user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhoods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhoods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhoods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_following" ADD CONSTRAINT "user_following_follower_user_id_fkey" FOREIGN KEY ("follower_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_following" ADD CONSTRAINT "user_following_following_user_id_fkey" FOREIGN KEY ("following_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

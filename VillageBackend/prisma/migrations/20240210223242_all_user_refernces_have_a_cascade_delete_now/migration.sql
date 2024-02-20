-- DropForeignKey
ALTER TABLE "account_deletion_requests" DROP CONSTRAINT "account_deletion_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_likes" DROP CONSTRAINT "comment_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reported_comments" DROP CONSTRAINT "reported_comments_user_id_reporting_fkey";

-- DropForeignKey
ALTER TABLE "reported_posts" DROP CONSTRAINT "reported_posts_user_id_reporting_fkey";

-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_following" DROP CONSTRAINT "user_following_follower_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_following" DROP CONSTRAINT "user_following_following_user_id_fkey";

-- AlterTable
ALTER TABLE "account_deletion_requests" ADD COLUMN     "username" TEXT;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reported_posts" ADD CONSTRAINT "reported_posts_user_id_reporting_fkey" FOREIGN KEY ("user_id_reporting") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reported_comments" ADD CONSTRAINT "reported_comments_user_id_reporting_fkey" FOREIGN KEY ("user_id_reporting") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_following" ADD CONSTRAINT "user_following_follower_user_id_fkey" FOREIGN KEY ("follower_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_following" ADD CONSTRAINT "user_following_following_user_id_fkey" FOREIGN KEY ("following_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

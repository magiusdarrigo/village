-- AlterTable
ALTER TABLE "comment_likes" ADD COLUMN     "is_dislike" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "post_likes" ADD COLUMN     "is_dislike" BOOLEAN NOT NULL DEFAULT false;

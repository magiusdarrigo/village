-- DropIndex
DROP INDEX "idx_comment_post";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentCommentID" INTEGER;

-- CreateIndex
CREATE INDEX "idx_comment_post_likes" ON "Comment"("postID", "likesCount");

-- CreateIndex
CREATE INDEX "idx_comment_parent_comment" ON "Comment"("parentCommentID");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentID_fkey" FOREIGN KEY ("parentCommentID") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

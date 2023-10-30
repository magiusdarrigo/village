-- CreateIndex
CREATE INDEX "idx_comment_post" ON "Comment"("postID");

-- CreateIndex
CREATE INDEX "idx_post_createdat_neighborhood" ON "Post"("createdAt", "neighborhoodID");

-- CreateIndex
CREATE INDEX "idx_userfollowing_relationship" ON "UserFollowing"("followerUserID", "followingUserID");

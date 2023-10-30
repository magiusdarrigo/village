-- DropIndex
DROP INDEX "idx_post_createdat_neighborhood";

-- CreateIndex
CREATE INDEX "idx_post_neighborhood_createdat" ON "Post"("neighborhoodID", "createdAt");

-- CreateIndex
CREATE INDEX "idx_post_user_createdat" ON "Post"("userID", "createdAt");

-- CreateIndex
CREATE INDEX "idx_notification_for_user_created_at" ON "notifications"("for_user_id", "created_at");

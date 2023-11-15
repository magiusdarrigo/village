-- CreateTable
CREATE TABLE "reported_comments" (
    "id" SERIAL NOT NULL,
    "comment_id" INTEGER NOT NULL,
    "user_id_reporting" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" JSONB,

    CONSTRAINT "reported_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reported_comments" ADD CONSTRAINT "reported_comments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reported_comments" ADD CONSTRAINT "reported_comments_user_id_reporting_fkey" FOREIGN KEY ("user_id_reporting") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "reported_posts" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" JSONB,

    CONSTRAINT "reported_posts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reported_posts" ADD CONSTRAINT "reported_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

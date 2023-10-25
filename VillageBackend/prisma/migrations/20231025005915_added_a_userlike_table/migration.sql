-- CreateTable
CREATE TABLE "UserLike" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "postID" INTEGER NOT NULL,

    CONSTRAINT "UserLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLike_userID_postID_key" ON "UserLike"("userID", "postID");

-- AddForeignKey
ALTER TABLE "UserLike" ADD CONSTRAINT "UserLike_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLike" ADD CONSTRAINT "UserLike_postID_fkey" FOREIGN KEY ("postID") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

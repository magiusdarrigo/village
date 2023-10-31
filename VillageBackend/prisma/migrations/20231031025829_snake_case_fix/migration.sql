/*
  Warnings:

  - You are about to drop the column `phoneToken` on the `tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone_token]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tokens_phoneToken_key";

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "phoneToken",
ADD COLUMN     "phone_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_phone_token_key" ON "tokens"("phone_token");

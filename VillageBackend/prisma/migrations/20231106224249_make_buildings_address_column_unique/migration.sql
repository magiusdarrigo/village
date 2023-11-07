/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `buildings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "buildings_address_key" ON "buildings"("address");

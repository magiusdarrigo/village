/*
  Warnings:

  - Made the column `reason` on table `account_deletion_requests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `account_deletion_requests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `building_id` on table `account_deletion_requests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_number` on table `account_deletion_requests` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "account_deletion_requests" DROP CONSTRAINT "account_deletion_requests_building_id_fkey";

-- AlterTable
ALTER TABLE "account_deletion_requests" ALTER COLUMN "reason" SET NOT NULL,
ALTER COLUMN "reason" SET DEFAULT '',
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "building_id" SET NOT NULL,
ALTER COLUMN "phone_number" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "account_deletion_requests" ADD CONSTRAINT "account_deletion_requests_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

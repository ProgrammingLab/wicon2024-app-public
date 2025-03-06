/*
  Warnings:

  - You are about to drop the column `cropVarietyId` on the `CustomTask` table. All the data in the column will be lost.
  - Added the required column `cropGroupId` to the `CustomTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomTask" DROP CONSTRAINT "CustomTask_cropVarietyId_fkey";

-- AlterTable
ALTER TABLE "CustomTask" DROP COLUMN "cropVarietyId",
ADD COLUMN     "cropGroupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CustomTask" ADD CONSTRAINT "CustomTask_cropGroupId_fkey" FOREIGN KEY ("cropGroupId") REFERENCES "CropGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

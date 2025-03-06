/*
  Warnings:

  - The `pesticideRegistrationNumber` column on the `Diary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `averageSeasonType` on the `DiaryPack` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SeasonType" AS ENUM ('warm', 'cool', 'average');

-- AlterTable
ALTER TABLE "Diary" DROP COLUMN "pesticideRegistrationNumber",
ADD COLUMN     "pesticideRegistrationNumber" INTEGER;

-- AlterTable
ALTER TABLE "DiaryPack" DROP COLUMN "averageSeasonType",
ADD COLUMN     "averageSeasonType" "SeasonType" NOT NULL;

-- DropEnum
DROP TYPE "warmOrCool";

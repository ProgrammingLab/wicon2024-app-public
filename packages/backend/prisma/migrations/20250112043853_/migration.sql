-- CreateEnum
CREATE TYPE "Country" AS ENUM ('Japan', 'others');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin', 'user');

-- CreateEnum
CREATE TYPE "warmOrCool" AS ENUM ('warm', 'cool');

-- CreateEnum
CREATE TYPE "DiaryType" AS ENUM ('record', 'schedule');

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "antenna_x_offset" INTEGER NOT NULL,
    "antenna_y_offset" INTEGER NOT NULL,
    "antenna_z_offset" INTEGER NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "country" "Country" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupUserRole" (
    "userId" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "GroupUserRole_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "Ntripcaster" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "mountpoint" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "Ntripcaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryPack" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "averageSeasonType" "warmOrCool" NOT NULL,
    "groupId" INTEGER NOT NULL,
    "cropId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,

    CONSTRAINT "DiaryPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diary" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" INTEGER NOT NULL,
    "diaryPackId" INTEGER NOT NULL,
    "pesticideRegistrationNumber" TEXT,
    "fertilizerRegistrationNumber" TEXT,
    "pesticideAmount" DOUBLE PRECISION,
    "fertilizerAmount" DOUBLE PRECISION,
    "workerId" TEXT NOT NULL,
    "registrerId" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "type" "DiaryType" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Diary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PesticideRegistrationNumberBookmark" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pesticideRegistrationNumber" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "PesticideRegistrationNumberBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizerRegistrationNumberBookmark" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fertilizerRegistrationNumber" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "FertilizerRegistrationNumberBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryTemplateWeather" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateWeatherId" INTEGER NOT NULL,
    "diaryId" INTEGER NOT NULL,

    CONSTRAINT "DiaryTemplateWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateWeather" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TemplateWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryCustomWeather" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "diaryId" INTEGER NOT NULL,
    "customWeatherId" INTEGER NOT NULL,

    CONSTRAINT "DiaryCustomWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomWeather" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "CustomWeather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryTemplateTask" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateTaskId" INTEGER NOT NULL,
    "diaryId" INTEGER NOT NULL,

    CONSTRAINT "DiaryTemplateTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateTask" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TemplateTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryCustomTask" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customTaskId" INTEGER NOT NULL,
    "diaryId" INTEGER NOT NULL,

    CONSTRAINT "DiaryCustomTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTask" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "cropVarietyId" INTEGER NOT NULL,

    CONSTRAINT "CustomTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropGroup" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "CropGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "cropGroupId" INTEGER NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Field" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "coordinate" polygon NOT NULL,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Road" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "coordinates" path NOT NULL,

    CONSTRAINT "Road_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiaryTemplateWeather_diaryId_key" ON "DiaryTemplateWeather"("diaryId");

-- CreateIndex
CREATE UNIQUE INDEX "DiaryCustomWeather_diaryId_key" ON "DiaryCustomWeather"("diaryId");

-- CreateIndex
CREATE UNIQUE INDEX "DiaryTemplateTask_diaryId_key" ON "DiaryTemplateTask"("diaryId");

-- CreateIndex
CREATE UNIQUE INDEX "DiaryCustomTask_diaryId_key" ON "DiaryCustomTask"("diaryId");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupUserRole" ADD CONSTRAINT "GroupUserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupUserRole" ADD CONSTRAINT "GroupUserRole_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ntripcaster" ADD CONSTRAINT "Ntripcaster_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryPack" ADD CONSTRAINT "DiaryPack_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryPack" ADD CONSTRAINT "DiaryPack_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryPack" ADD CONSTRAINT "DiaryPack_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_diaryPackId_fkey" FOREIGN KEY ("diaryPackId") REFERENCES "DiaryPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesticideRegistrationNumberBookmark" ADD CONSTRAINT "PesticideRegistrationNumberBookmark_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerRegistrationNumberBookmark" ADD CONSTRAINT "FertilizerRegistrationNumberBookmark_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryTemplateWeather" ADD CONSTRAINT "DiaryTemplateWeather_templateWeatherId_fkey" FOREIGN KEY ("templateWeatherId") REFERENCES "TemplateWeather"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryTemplateWeather" ADD CONSTRAINT "DiaryTemplateWeather_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryCustomWeather" ADD CONSTRAINT "DiaryCustomWeather_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryCustomWeather" ADD CONSTRAINT "DiaryCustomWeather_customWeatherId_fkey" FOREIGN KEY ("customWeatherId") REFERENCES "CustomWeather"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomWeather" ADD CONSTRAINT "CustomWeather_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryTemplateTask" ADD CONSTRAINT "DiaryTemplateTask_templateTaskId_fkey" FOREIGN KEY ("templateTaskId") REFERENCES "TemplateTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryTemplateTask" ADD CONSTRAINT "DiaryTemplateTask_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryCustomTask" ADD CONSTRAINT "DiaryCustomTask_customTaskId_fkey" FOREIGN KEY ("customTaskId") REFERENCES "CustomTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryCustomTask" ADD CONSTRAINT "DiaryCustomTask_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTask" ADD CONSTRAINT "CustomTask_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTask" ADD CONSTRAINT "CustomTask_cropVarietyId_fkey" FOREIGN KEY ("cropVarietyId") REFERENCES "CropGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropGroup" ADD CONSTRAINT "CropGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_cropGroupId_fkey" FOREIGN KEY ("cropGroupId") REFERENCES "CropGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Road" ADD CONSTRAINT "Road_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Road" ADD CONSTRAINT "Road_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

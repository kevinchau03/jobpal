/*
  Warnings:

  - The `status` column on the `Contact` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CONTACT_STATUS" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "JOB_TYPE" AS ENUM ('PART_TIME', 'FULL_TIME', 'INTERNSHIP', 'CONTRACT');

-- CreateEnum
CREATE TYPE "JOB_STATUS" AS ENUM ('SAVED', 'APPLIED', 'SCREEN', 'INTERVIEWING', 'OFFER', 'WITHDRAWN', 'GHOSTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "status",
ADD COLUMN     "status" "CONTACT_STATUS" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "jobType" "JOB_TYPE",
ADD COLUMN     "location" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "JOB_STATUS" NOT NULL DEFAULT 'SAVED';

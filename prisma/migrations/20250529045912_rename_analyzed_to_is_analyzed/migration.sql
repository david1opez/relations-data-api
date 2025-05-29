/*
  Warnings:

  - You are about to drop the column `analyzed` on the `Call` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Call" DROP COLUMN "analyzed",
ADD COLUMN     "isAnalyzed" BOOLEAN NOT NULL DEFAULT false;

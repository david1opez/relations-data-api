/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "departmentID" INTEGER,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "userID" SERIAL NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userID");

-- CreateTable
CREATE TABLE "Department" (
    "departmentID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("departmentID")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "logID" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("logID")
);

-- CreateTable
CREATE TABLE "Client" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "Project" (
    "projectID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("projectID")
);

-- CreateTable
CREATE TABLE "UserProject" (
    "userID" INTEGER NOT NULL,
    "projectID" INTEGER NOT NULL,
    "projectRole" TEXT,

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("userID","projectID")
);

-- CreateTable
CREATE TABLE "Call" (
    "callID" SERIAL NOT NULL,
    "title" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "summary" TEXT,
    "projectID" INTEGER NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("callID")
);

-- CreateTable
CREATE TABLE "InternalCallParticipants" (
    "userID" INTEGER NOT NULL,
    "callID" INTEGER NOT NULL,

    CONSTRAINT "InternalCallParticipants_pkey" PRIMARY KEY ("userID","callID")
);

-- CreateTable
CREATE TABLE "ExternalCallParticipants" (
    "clientEmail" TEXT NOT NULL,
    "callID" INTEGER NOT NULL,

    CONSTRAINT "ExternalCallParticipants_pkey" PRIMARY KEY ("clientEmail","callID")
);

-- CreateTable
CREATE TABLE "Report" (
    "reportID" SERIAL NOT NULL,
    "reportType" TEXT,
    "generatedAt" TIMESTAMP(3),
    "fileURL" TEXT,
    "format" TEXT,
    "projectID" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("reportID")
);

-- CreateTable
CREATE TABLE "ReportCall" (
    "reportID" INTEGER NOT NULL,
    "callID" INTEGER NOT NULL,
    "callType" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),

    CONSTRAINT "ReportCall_pkey" PRIMARY KEY ("reportID","callID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentID_fkey" FOREIGN KEY ("departmentID") REFERENCES "Department"("departmentID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalCallParticipants" ADD CONSTRAINT "InternalCallParticipants_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalCallParticipants" ADD CONSTRAINT "InternalCallParticipants_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCallParticipants" ADD CONSTRAINT "ExternalCallParticipants_clientEmail_fkey" FOREIGN KEY ("clientEmail") REFERENCES "Client"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCallParticipants" ADD CONSTRAINT "ExternalCallParticipants_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCall" ADD CONSTRAINT "ReportCall_reportID_fkey" FOREIGN KEY ("reportID") REFERENCES "Report"("reportID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCall" ADD CONSTRAINT "ReportCall_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE RESTRICT ON UPDATE CASCADE;

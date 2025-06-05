/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "ActivityLog" (
    "activityLogID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectID" INTEGER,
    "callID" INTEGER,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("activityLogID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE CASCADE ON UPDATE CASCADE;

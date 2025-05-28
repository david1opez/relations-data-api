-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userID_fkey";

-- DropForeignKey
ALTER TABLE "Call" DROP CONSTRAINT "Call_projectID_fkey";

-- DropForeignKey
ALTER TABLE "ExternalCallParticipants" DROP CONSTRAINT "ExternalCallParticipants_callID_fkey";

-- DropForeignKey
ALTER TABLE "ExternalCallParticipants" DROP CONSTRAINT "ExternalCallParticipants_clientEmail_fkey";

-- DropForeignKey
ALTER TABLE "InternalCallParticipants" DROP CONSTRAINT "InternalCallParticipants_callID_fkey";

-- DropForeignKey
ALTER TABLE "InternalCallParticipants" DROP CONSTRAINT "InternalCallParticipants_userID_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientEmail_fkey";

-- DropForeignKey
ALTER TABLE "ReportCall" DROP CONSTRAINT "ReportCall_callID_fkey";

-- DropForeignKey
ALTER TABLE "ReportCall" DROP CONSTRAINT "ReportCall_reportID_fkey";

-- DropForeignKey
ALTER TABLE "UserProject" DROP CONSTRAINT "UserProject_projectID_fkey";

-- DropForeignKey
ALTER TABLE "UserProject" DROP CONSTRAINT "UserProject_userID_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "userID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Call" ALTER COLUMN "projectID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientEmail_fkey" FOREIGN KEY ("clientEmail") REFERENCES "Client"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalCallParticipants" ADD CONSTRAINT "InternalCallParticipants_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalCallParticipants" ADD CONSTRAINT "InternalCallParticipants_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCallParticipants" ADD CONSTRAINT "ExternalCallParticipants_clientEmail_fkey" FOREIGN KEY ("clientEmail") REFERENCES "Client"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCallParticipants" ADD CONSTRAINT "ExternalCallParticipants_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCall" ADD CONSTRAINT "ReportCall_reportID_fkey" FOREIGN KEY ("reportID") REFERENCES "Report"("reportID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCall" ADD CONSTRAINT "ReportCall_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE CASCADE ON UPDATE CASCADE;

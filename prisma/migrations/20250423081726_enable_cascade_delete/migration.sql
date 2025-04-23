-- DropForeignKey
ALTER TABLE "Call" DROP CONSTRAINT "Call_projectID_fkey";

-- DropForeignKey
ALTER TABLE "ExternalCallParticipants" DROP CONSTRAINT "ExternalCallParticipants_callID_fkey";

-- DropForeignKey
ALTER TABLE "InternalCallParticipants" DROP CONSTRAINT "InternalCallParticipants_callID_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_projectID_fkey";

-- DropForeignKey
ALTER TABLE "ReportCall" DROP CONSTRAINT "ReportCall_callID_fkey";

-- DropForeignKey
ALTER TABLE "ReportCall" DROP CONSTRAINT "ReportCall_reportID_fkey";

-- DropForeignKey
ALTER TABLE "UserProject" DROP CONSTRAINT "UserProject_projectID_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalCallParticipants" ADD CONSTRAINT "InternalCallParticipants_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCallParticipants" ADD CONSTRAINT "ExternalCallParticipants_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCall" ADD CONSTRAINT "ReportCall_reportID_fkey" FOREIGN KEY ("reportID") REFERENCES "Report"("reportID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCall" ADD CONSTRAINT "ReportCall_callID_fkey" FOREIGN KEY ("callID") REFERENCES "Call"("callID") ON DELETE CASCADE ON UPDATE CASCADE;

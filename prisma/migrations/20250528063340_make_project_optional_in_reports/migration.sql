-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_projectID_fkey";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "projectID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("projectID") ON DELETE SET NULL ON UPDATE CASCADE;

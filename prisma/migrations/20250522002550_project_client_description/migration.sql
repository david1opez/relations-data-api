-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "clientEmail" TEXT,
ADD COLUMN     "problemDescription" TEXT,
ADD COLUMN     "reqFuncionales" TEXT,
ADD COLUMN     "reqNoFuncionales" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientEmail_fkey" FOREIGN KEY ("clientEmail") REFERENCES "Client"("email") ON DELETE SET NULL ON UPDATE CASCADE;

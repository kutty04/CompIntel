-- AlterTable
ALTER TABLE "SalaryEntry" ADD COLUMN     "normalizedLevel" TEXT,
ADD COLUMN     "rawLevel" TEXT;

-- CreateIndex
CREATE INDEX "SalaryEntry_companyId_idx" ON "SalaryEntry"("companyId");

-- CreateIndex
CREATE INDEX "SalaryEntry_userId_idx" ON "SalaryEntry"("userId");

-- CreateIndex
CREATE INDEX "SalaryEntry_role_idx" ON "SalaryEntry"("role");

-- CreateIndex
CREATE INDEX "SalaryEntry_level_idx" ON "SalaryEntry"("level");

-- CreateIndex
CREATE INDEX "SalaryEntry_normalizedLevel_idx" ON "SalaryEntry"("normalizedLevel");

-- CreateIndex
CREATE INDEX "SalaryEntry_rawLevel_idx" ON "SalaryEntry"("rawLevel");

-- CreateIndex
CREATE INDEX "SalaryEntry_location_idx" ON "SalaryEntry"("location");

-- CreateIndex
CREATE INDEX "SalaryEntry_role_level_idx" ON "SalaryEntry"("role", "level");

-- CreateIndex
CREATE INDEX "SalaryEntry_totalCompensation_idx" ON "SalaryEntry"("totalCompensation");

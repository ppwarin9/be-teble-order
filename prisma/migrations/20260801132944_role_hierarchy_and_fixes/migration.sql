-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('SUPERADMIN', 'ADMIN', 'STAFF');

-- AlterTable
ALTER TABLE "menu_category" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "role" DROP COLUMN "code",
ADD COLUMN     "code" "RoleCode" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "dinning_table_table_number_key" ON "dinning_table"("table_number");

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "role"("code");


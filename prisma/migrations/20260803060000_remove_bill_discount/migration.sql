-- DropForeignKey
ALTER TABLE "bill_discount" DROP CONSTRAINT "bill_discount_bill_id_fkey";

-- DropTable
DROP TABLE "bill_discount";

-- DropEnum
DROP TYPE "DiscountType";

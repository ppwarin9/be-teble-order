-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "SplitMethod" AS ENUM ('EQUAL', 'SINGLE_PAYER');

-- CreateEnum
CREATE TYPE "OrderRoundStatus" AS ENUM ('SUBMITTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'COOKING', 'SERVED');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('OPEN', 'SETTLED', 'VOID');

-- CreateEnum
CREATE TYPE "BillShareStatus" AS ENUM ('UNPAID', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethodCode" AS ENUM ('PROMPTPAY', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'NOTIFIED', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateTable
CREATE TABLE "store_setting" (
    "id" TEXT NOT NULL,
    "enable_vat" BOOLEAN NOT NULL DEFAULT false,
    "vat_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.07,
    "enable_service_charge" BOOLEAN NOT NULL DEFAULT false,
    "service_charge_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Bangkok',
    "default_split_method" "SplitMethod" NOT NULL DEFAULT 'SINGLE_PAYER',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_user" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "staff_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dinning_table" (
    "id" TEXT NOT NULL,
    "table_number" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "qr_generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "dinning_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "menu_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_by" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "estimated_cooking_minutes" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menu_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "line_user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "picture_url" TEXT NOT NULL,
    "is_oa_friend" BOOLEAN NOT NULL DEFAULT false,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_session" (
    "id" TEXT NOT NULL,
    "dining_table_id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'OPEN',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "table_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_member" (
    "id" TEXT NOT NULL,
    "table_session_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" TEXT NOT NULL,
    "table_session_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_round" (
    "id" TEXT NOT NULL,
    "table_session_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "status" "OrderRoundStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" TEXT NOT NULL,
    "order_round_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_snapshot" INTEGER NOT NULL,
    "name_snapshot" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "estimated_minutes" INTEGER NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill" (
    "id" TEXT NOT NULL,
    "table_session_id" TEXT NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'OPEN',
    "split_method" "SplitMethod" NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discount_amount" INTEGER NOT NULL,
    "service_charge_rete_snapshot" DOUBLE PRECISION NOT NULL,
    "service_charge_amount" INTEGER NOT NULL,
    "vat_rate_snapshot" DOUBLE PRECISION NOT NULL,
    "vat_amount" INTEGER NOT NULL,
    "grand_total" INTEGER NOT NULL,
    "currency_snapshot" TEXT NOT NULL DEFAULT 'THB ',
    "issued_by" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settled_at" TIMESTAMP(3),

    CONSTRAINT "bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_discount" (
    "id" TEXT NOT NULL,
    "bill_id" TEXT NOT NULL,
    "amount_snapshot" INTEGER NOT NULL,

    CONSTRAINT "bill_discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_share" (
    "id" TEXT NOT NULL,
    "bill_id" TEXT NOT NULL,
    "session_member_id" TEXT NOT NULL,
    "amount_due" INTEGER NOT NULL,
    "status" "BillShareStatus" NOT NULL DEFAULT 'UNPAID',

    CONSTRAINT "bill_share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "bill_share_id" TEXT NOT NULL,
    "method" "PaymentMethodCode" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "confirmed_by" TEXT,
    "marked_by" TEXT,
    "gateway_ref" TEXT,
    "notified_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_email_key" ON "staff_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "dinning_table_qr_token_key" ON "dinning_table"("qr_token");

-- CreateIndex
CREATE INDEX "menu_item_category_id_idx" ON "menu_item"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_line_user_id_key" ON "customer"("line_user_id");

-- CreateIndex
CREATE INDEX "table_session_dining_table_id_status_idx" ON "table_session"("dining_table_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "session_member_session_token_key" ON "session_member"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "session_member_table_session_id_customer_id_key" ON "session_member"("table_session_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_table_session_id_key" ON "cart"("table_session_id");

-- CreateIndex
CREATE INDEX "cart_item_cart_id_idx" ON "cart_item"("cart_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_round_table_session_id_round_number_key" ON "order_round"("table_session_id", "round_number");

-- CreateIndex
CREATE INDEX "order_item_order_round_id_idx" ON "order_item"("order_round_id");

-- CreateIndex
CREATE INDEX "bill_table_session_id_status_idx" ON "bill"("table_session_id", "status");

-- CreateIndex
CREATE INDEX "bill_discount_bill_id_idx" ON "bill_discount"("bill_id");

-- CreateIndex
CREATE INDEX "bill_share_bill_id_idx" ON "bill_share"("bill_id");

-- CreateIndex
CREATE INDEX "payment_bill_share_id_idx" ON "payment"("bill_share_id");

-- AddForeignKey
ALTER TABLE "staff_user" ADD CONSTRAINT "staff_user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_session" ADD CONSTRAINT "table_session_dining_table_id_fkey" FOREIGN KEY ("dining_table_id") REFERENCES "dinning_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_member" ADD CONSTRAINT "session_member_table_session_id_fkey" FOREIGN KEY ("table_session_id") REFERENCES "table_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_member" ADD CONSTRAINT "session_member_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_table_session_id_fkey" FOREIGN KEY ("table_session_id") REFERENCES "table_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "session_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_round" ADD CONSTRAINT "order_round_table_session_id_fkey" FOREIGN KEY ("table_session_id") REFERENCES "table_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_round_id_fkey" FOREIGN KEY ("order_round_id") REFERENCES "order_round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "session_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill" ADD CONSTRAINT "bill_table_session_id_fkey" FOREIGN KEY ("table_session_id") REFERENCES "table_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill" ADD CONSTRAINT "bill_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_discount" ADD CONSTRAINT "bill_discount_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_share" ADD CONSTRAINT "bill_share_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_share" ADD CONSTRAINT "bill_share_session_member_id_fkey" FOREIGN KEY ("session_member_id") REFERENCES "session_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_bill_share_id_fkey" FOREIGN KEY ("bill_share_id") REFERENCES "bill_share"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_marked_by_fkey" FOREIGN KEY ("marked_by") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

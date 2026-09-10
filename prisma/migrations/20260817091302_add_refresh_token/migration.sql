-- CreateTable
CREATE TABLE "refresh_token" (
    "id" TEXT NOT NULL,
    "staff_user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_staff_user_id_idx" ON "refresh_token"("staff_user_id");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "staff_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;


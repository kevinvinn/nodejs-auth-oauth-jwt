-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('unverified', 'verified');

-- CreateTable
CREATE TABLE "Users" (
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_is_active" "UserStatus" NOT NULL DEFAULT 'unverified',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "otp_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "otp_expires_at" TIMESTAMP(3) NOT NULL,
    "otp_is_used" BOOLEAN NOT NULL DEFAULT false,
    "otp_request_count" INTEGER NOT NULL DEFAULT 0,
    "otp_request_reset_at" TIMESTAMP(3),
    "last_otp_requested_at" TIMESTAMP(3),

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("otp_id")
);

-- CreateTable
CREATE TABLE "Password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_user_email_key" ON "Users"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_user_id_key" ON "Otp"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Password_reset_tokens_token_key" ON "Password_reset_tokens"("token");

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Password_reset_tokens" ADD CONSTRAINT "Password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

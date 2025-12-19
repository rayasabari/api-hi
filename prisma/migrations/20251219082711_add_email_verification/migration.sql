-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" VARCHAR(255),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

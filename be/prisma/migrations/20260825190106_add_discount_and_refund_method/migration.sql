-- AlterTable
ALTER TABLE "Exchange" ADD COLUMN     "refundMethod" TEXT;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0;

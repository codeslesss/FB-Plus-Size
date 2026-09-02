-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "installments" INTEGER NOT NULL DEFAULT 1;

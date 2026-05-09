ALTER TABLE "grades" ADD COLUMN "is_accepted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "grades" DROP COLUMN "score";
ALTER TABLE "grades" DROP COLUMN "max_score";

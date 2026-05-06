-- Add CASCADE to ProjectMember → Project
ALTER TABLE "project_members" DROP CONSTRAINT IF EXISTS "project_members_project_id_fkey";
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;

-- Add CASCADE to Stage → Project
ALTER TABLE "stages" DROP CONSTRAINT IF EXISTS "stages_project_id_fkey";
ALTER TABLE "stages" ADD CONSTRAINT "stages_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;

-- Add SET NULL to Stage → parent Stage (self-reference)
ALTER TABLE "stages" DROP CONSTRAINT IF EXISTS "stages_parent_stage_id_fkey";
ALTER TABLE "stages" ADD CONSTRAINT "stages_parent_stage_id_fkey"
  FOREIGN KEY ("parent_stage_id") REFERENCES "stages"("id") ON DELETE SET NULL;

-- Add CASCADE to StageResult → Stage
ALTER TABLE "stage_results" DROP CONSTRAINT IF EXISTS "stage_results_stage_id_fkey";
ALTER TABLE "stage_results" ADD CONSTRAINT "stage_results_stage_id_fkey"
  FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE CASCADE;

-- Add CASCADE to Grade → StageResult
ALTER TABLE "grades" DROP CONSTRAINT IF EXISTS "grades_stage_result_id_fkey";
ALTER TABLE "grades" ADD CONSTRAINT "grades_stage_result_id_fkey"
  FOREIGN KEY ("stage_result_id") REFERENCES "stage_results"("id") ON DELETE CASCADE;

-- Add CASCADE to FileAttachment → StageResult
ALTER TABLE "file_attachments" DROP CONSTRAINT IF EXISTS "file_attachments_stage_result_id_fkey";
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_stage_result_id_fkey"
  FOREIGN KEY ("stage_result_id") REFERENCES "stage_results"("id") ON DELETE CASCADE;

-- Add CASCADE to FinalGrade → Project
ALTER TABLE "final_grades" DROP CONSTRAINT IF EXISTS "final_grades_project_id_fkey";
ALTER TABLE "final_grades" ADD CONSTRAINT "final_grades_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;

-- Cascade on Project delete
ALTER TABLE "project_members" DROP CONSTRAINT IF EXISTS "project_members_project_id_fkey";
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;

ALTER TABLE "stages" DROP CONSTRAINT IF EXISTS "stages_project_id_fkey";
ALTER TABLE "stages" ADD CONSTRAINT "stages_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;

ALTER TABLE "stages" DROP CONSTRAINT IF EXISTS "stages_parent_stage_id_fkey";
ALTER TABLE "stages" ADD CONSTRAINT "stages_parent_stage_id_fkey"
  FOREIGN KEY ("parent_stage_id") REFERENCES "stages"("id") ON DELETE SET NULL;

ALTER TABLE "final_grades" DROP CONSTRAINT IF EXISTS "final_grades_project_id_fkey";
ALTER TABLE "final_grades" ADD CONSTRAINT "final_grades_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;

-- Cascade on Stage delete
ALTER TABLE "stage_results" DROP CONSTRAINT IF EXISTS "stage_results_stage_id_fkey";
ALTER TABLE "stage_results" ADD CONSTRAINT "stage_results_stage_id_fkey"
  FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE CASCADE;

-- Cascade on StageResult delete
ALTER TABLE "grades" DROP CONSTRAINT IF EXISTS "grades_stage_result_id_fkey";
ALTER TABLE "grades" ADD CONSTRAINT "grades_stage_result_id_fkey"
  FOREIGN KEY ("stage_result_id") REFERENCES "stage_results"("id") ON DELETE CASCADE;

ALTER TABLE "file_attachments" DROP CONSTRAINT IF EXISTS "file_attachments_stage_result_id_fkey";
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_stage_result_id_fkey"
  FOREIGN KEY ("stage_result_id") REFERENCES "stage_results"("id") ON DELETE CASCADE;

-- Cascade on User delete
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_teacher_id_fkey";
ALTER TABLE "projects" ADD CONSTRAINT "projects_teacher_id_fkey"
  FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "project_members" DROP CONSTRAINT IF EXISTS "project_members_user_id_fkey";
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "stage_results" DROP CONSTRAINT IF EXISTS "stage_results_student_id_fkey";
ALTER TABLE "stage_results" ADD CONSTRAINT "stage_results_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "grades" DROP CONSTRAINT IF EXISTS "grades_graded_by_fkey";
ALTER TABLE "grades" ADD CONSTRAINT "grades_graded_by_fkey"
  FOREIGN KEY ("graded_by") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "final_grades" DROP CONSTRAINT IF EXISTS "final_grades_student_id_fkey";
ALTER TABLE "final_grades" ADD CONSTRAINT "final_grades_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "final_grades" DROP CONSTRAINT IF EXISTS "final_grades_graded_by_fkey";
ALTER TABLE "final_grades" ADD CONSTRAINT "final_grades_graded_by_fkey"
  FOREIGN KEY ("graded_by") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_user_id_fkey";
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_user_id_fkey";
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

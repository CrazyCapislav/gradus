import finalGradeController from "../controllers/finalGrade.controller.js";
import express from "express";
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, finalGradeController.createFinalGrade);
router.get("/", authenticate, finalGradeController.getFinalGrades);
router.put("/:studentId", authenticate, finalGradeController.updateFinalGrade);

export default router;


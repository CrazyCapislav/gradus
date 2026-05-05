import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import gradeController from "../controllers/grade.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, gradeController.createGrade);
router.get("/", authenticate, gradeController.getGrade);
router.put("/", authenticate, gradeController.updateGrade);

export default router;
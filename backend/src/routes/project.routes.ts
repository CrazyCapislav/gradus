import express from "express";
import projectController from "../controllers/project.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();
router.post("/", authenticate, projectController.createProject);
router.get("/all", authenticate, requireRole("Admin"), projectController.getAllProjects);
router.get("/", authenticate, projectController.getProjects);
router.get("/:id", authenticate, projectController.getProjectById);
router.put("/:id", authenticate, projectController.updateProject);
router.delete("/:id", authenticate, projectController.deleteProject);
router.post("/:id/members", authenticate, projectController.addMember);
router.delete("/:id/members", authenticate, projectController.removeMember);
router.post("/:id/submit", authenticate, projectController.submitProject);

export default router;

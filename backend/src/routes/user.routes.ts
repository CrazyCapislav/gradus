import userController from "../controllers/user.controller.js";
import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/search", authenticate, userController.searchUser);
router.get("/", authenticate, requireRole("Admin"), userController.listUsers);
router.delete("/:id", authenticate, requireRole("Admin"), userController.deleteUser);

export default router;

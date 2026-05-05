import express from "express";
import authController from "../controllers/auth.controller.js";


const router = express.Router();
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshTokens);
router.post("/register", authController.register);
router.get("/verify-email", authController.verifyEmail);

export default router;
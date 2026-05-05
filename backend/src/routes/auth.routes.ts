import express from "express";
import authController from "../controllers/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshTokens);
router.post("/register", authController.register);
router.get("/verify-email", authController.verifyEmail);
router.get("/google", authController.googleRedirect);
router.get("/google/callback", authController.googleCallback);
router.get("/itmo", authController.itmoRedirect);
router.get("/itmo/callback", authController.itmoCallback);
router.get("/me", authenticate, authController.getMe);

export default router;

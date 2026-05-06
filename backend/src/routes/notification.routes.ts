import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import notificationController from "../controllers/notification.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, notificationController.getNotifications);
router.put("/read-all", authenticate, notificationController.markAllAsRead);
router.put("/:id/read", authenticate, notificationController.markAsRead);
router.delete("/:id", authenticate, notificationController.deleteNotification);

export default router;
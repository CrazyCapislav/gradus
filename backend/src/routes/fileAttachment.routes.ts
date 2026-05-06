import fileAttachmentController from "../controllers/fileAttachment.controller.js";
import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, upload.single("file"), fileAttachmentController.uploadFile);
router.get("/", authenticate, fileAttachmentController.getFileAttachments);
router.get("/:fileAttachmentId/download", authenticate, fileAttachmentController.downloadFileAttachment);
router.delete("/:fileAttachmentId", authenticate, fileAttachmentController.deleteFileAttachment);

export default router;
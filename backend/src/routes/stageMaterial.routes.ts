import express from "express";
import stageMaterialController from "../controllers/stageMaterial.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, stageMaterialController.getMaterials);
router.post("/", authenticate, upload.single("file"), stageMaterialController.uploadMaterial);
router.get("/:materialId/download", authenticate, stageMaterialController.downloadMaterial);
router.delete("/:materialId", authenticate, stageMaterialController.deleteMaterial);

export default router;

import express from "express";
import stageController from "../controllers/stage.controller.js";
import authenticate from "../middleware/auth.middleware.js";
const router = express.Router({ mergeParams: true });

router.post("/", authenticate, stageController.createStage);
router.get("/", authenticate, stageController.getStages);
router.put("/:stageId", authenticate, stageController.updateStage);
router.delete("/:stageId", authenticate, stageController.deleteStage);

export default router;
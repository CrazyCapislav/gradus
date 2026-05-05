import express from "express";
import stageResultController from "../controllers/stageResult.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, stageResultController.submitStageResult);
router.get("/my", authenticate, stageResultController.getMyResult);
router.put("/my", authenticate, stageResultController.updateMyResult);
router.get("/", authenticate, stageResultController.getStageResults);
router.get("/:resultId", authenticate, stageResultController.getStageResultById);
router.put("/:resultId", authenticate, stageResultController.updateStageResult);

export default router;
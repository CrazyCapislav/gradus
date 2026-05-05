import type { Request, Response } from "express";
import StageResultService from "../services/stageResult.service.js";

async function submitStageResult(req: Request<{stageId: string}>, res: Response): Promise<void> {
    const { stageId } = req.params;
    const { contentText } = req.body;
    try {
        const stageResult = await StageResultService.createStageResult(stageId, req.user!.userId, contentText);
        res.status(201).json(stageResult);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error submitting stage result" });
    }
}

async function getStageResults(req: Request<{stageId: string}>, res: Response): Promise<void> {
    const { stageId } = req.params;
    try {
        const stageResults = await StageResultService.getStageResults(stageId);
        res.status(200).json(stageResults);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching stage results" });
    }
}

async function getStageResultById(req: Request<{stageResultId: string}>, res: Response): Promise<void> {
    const { stageResultId } = req.params;
    try {
        const stageResult = await StageResultService.getStageResultById(stageResultId);
        if (!stageResult) {
            res.status(404).json({ message: "Stage result not found" });
            return;
        }
        res.status(200).json(stageResult);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching stage result" });
    }
}

async function updateStageResult(req: Request<{stageResultId: string}>, res: Response): Promise<void> {
    const { stageResultId } = req.params;
    const { contentText, status, feedback } = req.body;
    try {
        const stageResult = await StageResultService.updateStageResult(stageResultId, { contentText, status, feedback });
        res.status(200).json(stageResult);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error updating stage result" });
    }
}



export default {
    submitStageResult,
    getStageResults,
    getStageResultById,
    updateStageResult
};
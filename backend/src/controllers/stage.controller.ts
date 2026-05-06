import StageService from "../services/stage.service.js";
import type { Request, Response } from "express";

async function createStage(req: Request<{projectId: string}>, res: Response): Promise<void> {
    const { projectId } = req.params;
    const { title, stageOrder, softDeadline, hardDeadline, parentStageId, description } = req.body;
    try {
        const stage = await StageService.createStage(projectId, {
            title,
            stageOrder,
            description,
            parentStageId,
            softDeadline: softDeadline ? new Date(softDeadline) : undefined,
            hardDeadline: hardDeadline ? new Date(hardDeadline) : undefined,
        });
        res.status(201).json(stage);
    } catch (error) {
        console.error("[createStage]", error);
        res.status(500).json({ message: error instanceof Error ? error.message : "Error creating stage" });
    }
}

async function getStageById(req: Request<{stageId: string}>, res: Response): Promise<void> {
    const { stageId } = req.params;
    try {
        const stage = await StageService.getStageById(stageId);
        res.status(200).json(stage);
    } catch (error) {
        res.status(404).json({ message: error instanceof Error ? error.message : "Stage not found" });
    }
}

async function getStages(req: Request<{projectId: string}>, res: Response): Promise<void> {
    const { projectId } = req.params;
    try {
        const stages = await StageService.getStages(projectId);
        res.status(200).json(stages);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching stages" });
    }
}

async function updateStage(req: Request<{stageId: string}>, res: Response): Promise<void> {
    const { stageId } = req.params;
    const { title, description, softDeadline, hardDeadline, status } = req.body;
    try {
        const stage = await StageService.updateStage(stageId, {
            title,
            description,
            status,
            softDeadline: softDeadline ? new Date(softDeadline) : undefined,
            hardDeadline: hardDeadline ? new Date(hardDeadline) : undefined,
        });
        res.status(200).json(stage);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error updating stage" });
    }
}

async function deleteStage(req: Request<{stageId: string}>, res: Response): Promise<void> {
    const { stageId } = req.params;
    try {
        await StageService.deleteStage(stageId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error deleting stage" });
    }
}

export default {
    createStage,
    getStageById,
    getStages,
    updateStage,
    deleteStage
};
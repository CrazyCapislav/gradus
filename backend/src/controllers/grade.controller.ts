import type { Request, Response } from "express";
import GradeService from "../services/grade.service.js";

async function createGrade(req: Request<{ stageResultId: string }>, res: Response): Promise<void> {
    const { stageResultId } = req.params;
    const { isAccepted, feedback } = req.body;
    try {
        const grade = await GradeService.createGrade(stageResultId, isAccepted, req.user!.userId, feedback);
        res.status(201).json(grade);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error creating grade" });
    }
}

async function getGrade(req: Request<{ stageResultId: string }>, res: Response): Promise<void> {
    const { stageResultId } = req.params;
    try {
        const grade = await GradeService.getGrade(stageResultId);
        if (!grade) {
            res.status(404).json({ message: "Grade not found" });
            return;
        }
        res.status(200).json(grade);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching grade" });
    }
}

async function updateGrade(req: Request<{ stageResultId: string }>, res: Response): Promise<void> {
    const { stageResultId } = req.params;
    const { isAccepted, feedback } = req.body;
    try {
        const grade = await GradeService.updateGrade(stageResultId, { isAccepted, feedback });
        res.status(200).json(grade);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error updating grade" });
    }
}

export default {
    createGrade,
    getGrade,
    updateGrade
};
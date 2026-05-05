import finalGradeService from "../services/finalGrade.service.js";
import type { Request, Response } from "express";

async function createFinalGrade(req: Request<{ projectId: string }>, res: Response): Promise<void> {
    const { projectId } = req.params;
    const { studentId, score, feedback } = req.body;
    const gradedById = req.user!.userId;
    try {
        const finalGrade = await finalGradeService.createFinalGrade(projectId, studentId, score, gradedById, feedback);
        res.status(201).json(finalGrade);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error creating final grade" });
    }
}

async function getFinalGrades(req: Request<{ projectId: string }>, res: Response): Promise<void> {
    const { projectId } = req.params;
    try {
        const finalGrades = await finalGradeService.getFinalGrades(projectId);
        res.status(200).json(finalGrades);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching final grades" });
    }
}

async function updateFinalGrade(req: Request<{ projectId: string, studentId: string }>, res: Response): Promise<void> {
    const { projectId, studentId } = req.params;
    const { score, feedback } = req.body;
    try {
        const updatedGrade = await finalGradeService.updateFinalGrade(projectId, studentId, { score, feedback });
        res.status(200).json(updatedGrade);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error updating final grade" });
    }
}

export default {
    createFinalGrade,
    getFinalGrades,
    updateFinalGrade
};
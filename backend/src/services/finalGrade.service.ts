import {prisma} from "../prisma/prisma.js";
import type { FinalGradeModel } from "../generated/prisma/models.js";

async function createFinalGrade(projectId: string, studentId: string, score: number, gradedById: string, feedback?: string): Promise<FinalGradeModel> {
    return await prisma.finalGrade.create({
        data: {
            projectId,
            studentId,
            score,
            gradedById,
            ...(feedback !== undefined && { feedback })
        }
    });
}

async function getFinalGrades(projectId: string): Promise<FinalGradeModel[]> {
    return await prisma.finalGrade.findMany({
        where: { projectId }
    });
}

async function updateFinalGrade(projectId: string, studentId: string, data: { score?: number, feedback?: string }): Promise<FinalGradeModel> {
    return await prisma.finalGrade.update({
        where: { projectId_studentId: { projectId, studentId} },
        data: data
    });
}

export default {
    createFinalGrade,
    getFinalGrades,
    updateFinalGrade
};
import {prisma} from "../prisma/prisma.js";
import type { GradeModel } from "../generated/prisma/models.js";

async function createGrade(stageResultId: string, score: number, maxScore: number, gradedById: string, feedback: string| undefined): Promise<GradeModel> {
    return await prisma.grade.create({
        data: {
            stageResultId, score, maxScore, gradedById,
            ...(feedback !== undefined && { feedback})
        }
    });

}

async function getGrade(stageResultId: string) {
    return await prisma.grade.findUnique({
        where: { stageResultId }
    });
}


async function updateGrade(stageResultId: string, data: { score?: number; feedback?: string }) {
    return await prisma.grade.update({
        where: { stageResultId },
        data: data
    });
}

export default {
    createGrade,
    getGrade,
    updateGrade
};
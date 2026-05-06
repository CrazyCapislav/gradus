import {prisma} from "../prisma/prisma.js";
import type { GradeModel } from "../generated/prisma/models.js";

async function createGrade(stageResultId: string, score: number, maxScore: number, gradedById: string, feedback: string| undefined): Promise<GradeModel> {
    const stageResult = await prisma.stageResult.findUnique({
        where: { id: stageResultId },
        select: { studentId: true, stage: { select: { title: true } } }
    });

    const grade = await prisma.grade.create({
        data: {
            stageResultId, score, maxScore, gradedById,
            ...(feedback !== undefined && { feedback})
        }
    });

    if (stageResult) {
        await prisma.notification.create({
            data: {
                userId: stageResult.studentId,
                type: "GradeReceived",
                message: `Your submission for stage "${stageResult.stage.title}" has been graded: ${score}/${maxScore}.`,
                referenceId: grade.id,
                referenceType: "Grade"
            }
        });
    }

    return grade;
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
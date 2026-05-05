import {prisma} from "../prisma/prisma.js";
import type { StageResultModel } from "../generated/prisma/models.js";
import { StageResultStatus } from "../generated/prisma/enums.js";

async function createStageResult(stageId: string, studentId: string, contentText?: string): Promise<StageResultModel> {
    const stage = await prisma.stage.findUnique({
        where: { id: stageId },
        select: { hardDeadline: true, project: { select: { teacherId: true, title: true } } }
    });
    const now = new Date();
    const isLate = stage?.hardDeadline ? now > stage.hardDeadline : false;
    const result = await prisma.stageResult.create({
        data: {
            stageId,
            studentId,
            submittedAt: now,
            isLate,
            ...(contentText !== undefined && { contentText })
        }
    });
    if (stage?.project) {
        await prisma.notification.create({
            data: {
                userId: stage.project.teacherId,
                type: "StageSubmitted",
                message: `New stage result submitted for project "${stage.project.title}".`,
                referenceId: result.id,
                referenceType: "StageResult"
            }
        });
    }
    return result;
}

async function getMyResult(stageId: string, studentId: string): Promise<StageResultModel | null> {
    return await prisma.stageResult.findUnique({
        where: { stageId_studentId: { stageId, studentId } }
    });
}

async function updateMyResult(stageId: string, studentId: string, contentText: string): Promise<StageResultModel> {
    const stage = await prisma.stage.findUnique({
        where: { id: stageId },
        select: { hardDeadline: true }
    });
    const editedAfterDeadline = stage?.hardDeadline ? new Date() > stage.hardDeadline : false;

    return await prisma.stageResult.update({
        where: { stageId_studentId: { stageId, studentId } },
        data: { contentText, isEdited: true, editedAfterDeadline }
    });
}

async function getStageResults(stageId: string): Promise<StageResultModel[]> {
    return await prisma.stageResult.findMany({
        where: { stageId }
    });
}

async function getStageResultById(stageResultId: string): Promise<StageResultModel | null> {
    return await prisma.stageResult.findUnique({
        where: { id: stageResultId }
    });
}

async function updateStageResult(stageResultId: string, data: { contentText?: string, status?: StageResultStatus, feedback?: string }): Promise<StageResultModel> {
    return await prisma.stageResult.update({
        where: { id: stageResultId },
        data: data
    });
}


export default {
    createStageResult,
    getMyResult,
    updateMyResult,
    getStageResults,
    getStageResultById,
    updateStageResult
};

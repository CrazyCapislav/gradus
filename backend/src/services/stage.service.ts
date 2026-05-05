import {prisma} from "../prisma/prisma.js";
import type { StageModel } from "../generated/prisma/models.js";
import { StageStatus } from "../generated/prisma/enums.js";

async function createStage(projectId: string, data: { title: string; stageOrder: number; softDeadline?: Date; hardDeadline?: Date; parentStageId?: string; description?: string }): Promise<StageModel> {
    return await prisma.stage.create({
        data: {
            projectId,
            title: data.title,
            stageOrder: data.stageOrder,
            ...(data.description !== undefined && { description: data.description }),
            ...(data.parentStageId !== undefined && { parentStageId: data.parentStageId }),
            ...(data.softDeadline !== undefined && { softDeadline: data.softDeadline }),
            ...(data.hardDeadline !== undefined && { hardDeadline: data.hardDeadline })
        }
    });
}

async function getStages(projectId: string): Promise<StageModel[]> {
    return await prisma.stage.findMany({
        where: { projectId }
    });
}

async function updateStage(stageId: string, data: { title?: string; description?: string, softDeadline?: Date, hardDeadline?: Date, status?: StageStatus }): Promise<StageModel> {
    return await prisma.stage.update({
        where: { id: stageId },
        data: data
    });
}

async function deleteStage(stageId: string): Promise<void> {
    await prisma.stage.delete({
        where: { id: stageId }
    });
}

export default {
    createStage,
    getStages,
    updateStage,
    deleteStage
};
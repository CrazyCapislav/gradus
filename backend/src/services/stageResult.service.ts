import {prisma} from "../prisma/prisma.js";
import type { StageResultModel } from "../generated/prisma/models.js";
import { StageResultStatus } from "../generated/prisma/enums.js";
import { sendStageSubmittedEmail } from "./email.service.js";

async function createStageResult(stageId: string, studentId: string, contentText?: string): Promise<StageResultModel> {
    const stage = await prisma.stage.findUnique({
        where: { id: stageId },
        select: { title: true, hardDeadline: true, project: { select: { teacherId: true, title: true } } }
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
                message: JSON.stringify({ key: "notif_stageSubmitted", params: { projectTitle: stage.project.title } }),
                referenceId: result.id,
                referenceType: "StageResult"
            }
        });

        const [teacher, student] = await Promise.all([
            prisma.user.findUnique({ where: { id: stage.project.teacherId }, select: { email: true, firstName: true } }),
            prisma.user.findUnique({ where: { id: studentId }, select: { firstName: true, lastName: true } }),
        ]);
        if (teacher) {
            const studentName = student ? `${student.firstName} ${student.lastName}` : "Студент";
            sendStageSubmittedEmail(teacher.email, teacher.firstName, studentName, stage.title, stage.project.title).catch(() => {});
        }
    }
    return result;
}

async function getMyResult(stageId: string, studentId: string) {
    return await prisma.stageResult.findUnique({
        where: { stageId_studentId: { stageId, studentId } },
        include: { fileAttachments: true }
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
        data: { contentText, isEdited: true, editedAt: new Date(), editedAfterDeadline }
    });
}

async function getStageResults(stageId: string) {
    return await prisma.stageResult.findMany({
        where: { stageId },
        include: {
            fileAttachments: true,
            student: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
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

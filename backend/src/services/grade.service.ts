import {prisma} from "../prisma/prisma.js";
import type { GradeModel } from "../generated/prisma/models.js";
import { sendGradeReceivedEmail } from "./email.service.js";

async function createGrade(stageResultId: string, isAccepted: boolean, gradedById: string, feedback: string | undefined): Promise<GradeModel> {
    const stageResult = await prisma.stageResult.findUnique({
        where: { id: stageResultId },
        select: {
            studentId: true,
            stage: { select: { title: true } },
            student: { select: { email: true, firstName: true } }
        }
    });

    const grade = await prisma.grade.create({
        data: {
            stageResultId, isAccepted, gradedById,
            ...(feedback !== undefined && { feedback })
        }
    });

    if (stageResult) {
        const status = isAccepted ? "принята" : "не принята";
        await prisma.notification.create({
            data: {
                userId: stageResult.studentId,
                type: "GradeReceived",
                message: JSON.stringify({ key: "notif_gradeReceived", params: { stageTitle: stageResult.stage.title, status } }),
                referenceId: grade.id,
                referenceType: "Grade"
            }
        });

        if (stageResult.student) {
            sendGradeReceivedEmail(
                stageResult.student.email,
                stageResult.student.firstName,
                stageResult.stage.title,
                isAccepted,
                feedback
            ).catch(() => {});
        }
    }

    return grade;
}

async function getGrade(stageResultId: string) {
    return await prisma.grade.findUnique({
        where: { stageResultId }
    });
}


async function updateGrade(stageResultId: string, data: { isAccepted?: boolean; feedback?: string }) {
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
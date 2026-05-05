import cron from "node-cron";
import { prisma } from "../prisma/prisma.js";
import { sendDeadlineEmail } from "../services/email.service.js";

async function notifyDeadline(type: "soft" | "hard") {
    const notifiedField = type === "soft" ? "softDeadlineNotified" : "hardDeadlineNotified";
    const deadlineField = type === "soft" ? "softDeadline" : "hardDeadline";
    const notifType = type === "soft" ? "soft_deadline_passed" : "hard_deadline_passed";

    const stages = await prisma.stage.findMany({
        where: {
            [deadlineField]: { lte: new Date(), not: null },
            [notifiedField]: false,
        },
        include: {
            project: {
                include: {
                    members: { include: { user: true } },
                    teacher: true,
                }
            }
        }
    });

    for (const stage of stages) {
        const { project } = stage;
        const students = project.members.map(m => m.user);
        const teacher = project.teacher;
        const recipients = [...students, { ...teacher, isTeacher: true }];

        for (const recipient of recipients) {
            const isTeacher = recipient.id === project.teacherId;
            const message = type === "soft"
                ? `Мягкий дедлайн этапа «${stage.title}» прошёл`
                : `Жёсткий дедлайн этапа «${stage.title}» прошёл`;

            await prisma.notification.create({
                data: {
                    userId: recipient.id,
                    type: notifType,
                    message,
                    referenceId: stage.id,
                    referenceType: "Stage",
                }
            }).catch(() => {});

            if (process.env.RESEND_API_KEY) {
                await sendDeadlineEmail(
                    recipient.email,
                    recipient.firstName,
                    stage.title,
                    project.title,
                    type,
                    isTeacher
                ).catch(err => console.error(`Deadline email failed for ${recipient.email}:`, err));
            }
        }

        await prisma.stage.update({
            where: { id: stage.id },
            data: { [notifiedField]: true }
        });

        console.log(`[deadline-job] ${type} deadline notifications sent for stage "${stage.title}"`);
    }
}

export function startDeadlineJob() {
    // Run every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
        await notifyDeadline("soft").catch(console.error);
        await notifyDeadline("hard").catch(console.error);
    });
    console.log("[deadline-job] Deadline checker started (every 5 min)");
}

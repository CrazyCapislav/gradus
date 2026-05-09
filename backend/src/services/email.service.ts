import { Resend } from "resend";

const FROM = "Gradus <noreply@gradus-apm.ru>";

function getResend() {
    return new Resend(process.env.RESEND_API_KEY);
}

export async function sendDeadlineEmail(
    to: string,
    firstName: string,
    stageTitle: string,
    projectTitle: string,
    deadlineType: "soft" | "hard",
    isTeacher: boolean
) {
    const isSoft = deadlineType === "soft";
    const deadlineLabel = isSoft ? "мягкий дедлайн" : "жёсткий дедлайн";
    const subjectLabel = isSoft ? "Мягкий дедлайн" : "Жёсткий дедлайн";
    const color = isSoft ? "#E3B341" : "#F85149";
    const teacherNote = isTeacher
        ? `<p>Как преподаватель проекта, вы получаете это уведомление, чтобы быть в курсе состояния этапа.</p>`
        : isSoft
            ? `<p>Обратите внимание на этот этап — у вас ещё есть время сдать работу до наступления жёсткого дедлайна.</p>`
            : `<p>Вы ещё можете сдать работу, однако она будет отмечена как просроченная.</p>`;

    await getResend().emails.send({
        from: FROM,
        to,
        subject: `${subjectLabel} прошёл — ${stageTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0D1117; color: #CDD6F4; padding: 32px; border-radius: 12px;">
                <h2 style="color: ${color}; margin-top: 0;">Истёк ${deadlineLabel}</h2>
                <p>Привет, ${firstName}!</p>
                <p>У этапа <strong>«${stageTitle}»</strong> в проекте <strong>«${projectTitle}»</strong> истёк ${deadlineLabel}.</p>
                ${teacherNote}
                <p style="color: #8B949E; font-size: 13px;">Это автоматическое уведомление от Gradus.</p>
            </div>
        `,
    });
}

export async function sendStageSubmittedEmail(
    to: string,
    teacherFirstName: string,
    studentName: string,
    stageTitle: string,
    projectTitle: string
) {
    await getResend().emails.send({
        from: FROM,
        to,
        subject: `Новая работа — ${stageTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0D1117; color: #CDD6F4; padding: 32px; border-radius: 12px;">
                <h2 style="color: #58A6FF; margin-top: 0;">Студент сдал работу</h2>
                <p>Привет, ${teacherFirstName}!</p>
                <p>Студент <strong>${studentName}</strong> сдал работу по этапу <strong>«${stageTitle}»</strong> в проекте <strong>«${projectTitle}»</strong>.</p>
                <p>Зайдите в Gradus, чтобы проверить и оценить работу.</p>
                <p style="color: #8B949E; font-size: 13px;">Это автоматическое уведомление от Gradus.</p>
            </div>
        `,
    });
}

export async function sendGradeReceivedEmail(
    to: string,
    studentFirstName: string,
    stageTitle: string,
    score: number,
    maxScore: number,
    feedback?: string
) {
    const feedbackBlock = feedback
        ? `<p><strong>Комментарий преподавателя:</strong> ${feedback}</p>`
        : "";

    await getResend().emails.send({
        from: FROM,
        to,
        subject: `Получена оценка — ${stageTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0D1117; color: #CDD6F4; padding: 32px; border-radius: 12px;">
                <h2 style="color: #3FB950; margin-top: 0;">Вам выставлена оценка</h2>
                <p>Привет, ${studentFirstName}!</p>
                <p>Преподаватель оценил ваш этап <strong>«${stageTitle}»</strong>.</p>
                <p style="font-size: 22px; font-weight: 700; color: #58A6FF;">${score} / ${maxScore}</p>
                ${feedbackBlock}
                <p style="color: #8B949E; font-size: 13px;">Это автоматическое уведомление от Gradus.</p>
            </div>
        `,
    });
}

export async function sendProjectInvitationEmail(
    to: string,
    invitedFirstName: string,
    teacherName: string,
    projectTitle: string
) {
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

    await getResend().emails.send({
        from: FROM,
        to,
        subject: `Приглашение в проект — ${projectTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0D1117; color: #CDD6F4; padding: 32px; border-radius: 12px;">
                <h2 style="color: #58A6FF; margin-top: 0;">Вас пригласили в проект</h2>
                <p>Привет, ${invitedFirstName}!</p>
                <p>Преподаватель <strong>${teacherName}</strong> приглашает вас присоединиться к проекту <strong>«${projectTitle}»</strong>.</p>
                <p>Откройте Gradus, чтобы принять или отклонить приглашение.</p>
                <a href="${frontendUrl}/projects" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background: #58A6FF; color: #0D1117; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Перейти в Gradus
                </a>
                <p style="color: #8B949E; font-size: 13px;">Это автоматическое уведомление от Gradus.</p>
            </div>
        `,
    });
}

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    const link = `${frontendUrl}/verify-email?token=${token}`;

    await getResend().emails.send({
        from: FROM,
        to,
        subject: "Подтвердите вашу почту — Gradus",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0D1117; color: #CDD6F4; padding: 32px; border-radius: 12px;">
                <h2 style="color: #58A6FF; margin-top: 0;">Добро пожаловать в Gradus</h2>
                <p>Привет, ${firstName}!</p>
                <p>Для завершения регистрации подтвердите ваш адрес электронной почты:</p>
                <a href="${link}" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background: #58A6FF; color: #0D1117; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Подтвердить Email
                </a>
                <p style="color: #8B949E; font-size: 13px;">Ссылка действительна 24 часа. Если вы не регистрировались в Gradus, просто проигнорируйте это письмо.</p>
            </div>
        `,
    });
}

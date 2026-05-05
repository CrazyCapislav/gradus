import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    const link = `${frontendUrl}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
        to,
        subject: "Подтвердите вашу почту — Gradus LMS",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0D1117; color: #CDD6F4; padding: 32px; border-radius: 12px;">
                <h2 style="color: #58A6FF; margin-top: 0;">Добро пожаловать в Gradus LMS</h2>
                <p>Привет, ${firstName}!</p>
                <p>Для завершения регистрации подтвердите ваш адрес электронной почты:</p>
                <a href="${link}" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background: #58A6FF; color: #0D1117; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Подтвердить Email
                </a>
                <p style="color: #8B949E; font-size: 13px;">Ссылка действительна 24 часа. Если вы не регистрировались в Gradus LMS, просто проигнорируйте это письмо.</p>
            </div>
        `,
    });
}

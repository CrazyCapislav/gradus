import bcrypt from "bcryptjs";
import {prisma} from "../prisma/prisma.js";
import type { UserModel } from "../generated/prisma/models.js";
import { Role } from "../generated/prisma/enums.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "./email.service.js";
import { getGoogleUser } from "./google.service.js";
import { getItmoUser } from "./itmo.service.js";

async function register(email: string, password: string, firstName: string, lastName: string, role: Role): Promise<UserModel> {
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
        throw new Error("Email exists");
    }

    const user = await prisma.user.create({
        data: {
            email, passwordHash, firstName, lastName, role: role
        }
    });

    const smtpReady = !!process.env.RESEND_API_KEY;

    if (smtpReady) {
        const token = jwt.sign(
            { userId: user.id, type: "email-verification" },
            process.env.JWT_SECRET!,
            { expiresIn: "24h" }
        );
        try {
            await sendVerificationEmail(email, firstName, token);
        } catch (err) {
            console.error("Email send failed, auto-confirming:", err);
            await prisma.user.update({ where: { id: user.id }, data: { isConfirmedEmail: true } });
        }
    } else {
        await prisma.user.update({ where: { id: user.id }, data: { isConfirmedEmail: true } });
    }

    return user;
}

async function verifyEmail(token: string): Promise<void> {
    let payload: { userId: string; type: string };
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; type: string };
    } catch {
        throw new Error("Invalid or expired verification link");
    }

    if (payload.type !== "email-verification") {
        throw new Error("Invalid token type");
    }

    await prisma.user.update({
        where: { id: payload.userId },
        data: { isConfirmedEmail: true }
    });
}

async function login(email: string, password: string): Promise<{accessToken: string, refreshToken: string, user: Omit<UserModel, "passwordHash">}> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    if (!user.isConfirmedEmail) {
        throw new Error("Email not confirmed");
    }

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { accessToken, refreshToken, user: userWithoutPassword };
}

async function logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

async function refreshTokens(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    const { userId, role } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string, role: Role };
    const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken) {
        throw new Error("Invalid refresh token");
    }
    const expiresAt = storedToken.expiresAt;
    if (expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { token: refreshToken } });
        throw new Error("Refresh token expired");
    }

    const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    await prisma.refreshToken.create({
        data: {
            userId,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    return { accessToken, refreshToken: newRefreshToken };
}


async function loginWithOAuth(
    provider: string,
    oauthId: string,
    email: string,
    firstName: string,
    lastName: string
): Promise<{ accessToken: string; refreshToken: string; user: Omit<UserModel, "passwordHash"> }> {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                passwordHash: "",
                firstName,
                lastName,
                role: Role.Student,
                isConfirmedEmail: true,
                oauthProvider: provider,
                oauthId,
            },
        });
    } else if (!user.oauthId) {
        user = await prisma.user.update({
            where: { id: user.id },
            data: { oauthProvider: provider, oauthId, isConfirmedEmail: true },
        });
    }

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
}

async function loginWithGoogle(code: string) {
    const u = await getGoogleUser(code);
    return loginWithOAuth("google", u.id, u.email, u.firstName, u.lastName);
}

async function loginWithItmo(code: string) {
    const u = await getItmoUser(code);
    return loginWithOAuth("itmo", u.id, u.email, u.firstName, u.lastName);
}

async function getMe(userId: string): Promise<Omit<UserModel, "passwordHash"> | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isConfirmedEmail: true, createdAt: true, updatedAt: true, patronymic: true, avatarUrl: true, oauthProvider: true, oauthId: true },
    });
    return user as Omit<UserModel, "passwordHash"> | null;
}

export default {
    register,
    verifyEmail,
    login,
    loginWithGoogle,
    loginWithItmo,
    getMe,
    logout,
    refreshTokens
};

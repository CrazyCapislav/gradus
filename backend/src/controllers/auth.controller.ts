import type { Request, Response } from "express";
import authService from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validation/auth.schemas.js";
import { getGoogleAuthUrl } from "../services/google.service.js";
import { getItmoAuthUrl } from "../services/itmo.service.js";

async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid email or password format" });
        return;
    }

    try {
        const result = await authService.login(email, password);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ accessToken: result.accessToken, user: result.user });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error logging in";
        const status = message === "Invalid credentials" ? 401 : message === "Email not confirmed" ? 403 : 500;
        res.status(status).json({ message });
    }
}

async function logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    try {
        if (refreshToken) {
            await authService.logout(refreshToken);
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });
        }
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error logging out" });
    }
}

async function refreshTokens(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: "No refresh token provided" });
        return;
    }
    try {
        const result = await authService.refreshTokens(refreshToken);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ accessToken: result.accessToken });
    } catch (error) {
        res.status(401).json({ message: error instanceof Error ? error.message : "Invalid refresh token" });
    }
}

async function register(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName } = req.body;
    const parsed = registerSchema.safeParse({ email, password, firstName, lastName });
    if (!parsed.success) {
        res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
        return;
    }
    try {
        const result = await authService.register(email, password, firstName, lastName, "Student");
        const userWithoutPassword = { ...result, passwordHash: undefined };
        res.status(201).json({ message: "User registered successfully", user: userWithoutPassword });
    }
    catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : "Error registering user" });
    }
}

async function verifyEmail(req: Request, res: Response): Promise<void> {
    const token = req.query.token as string;
    if (!token) {
        res.status(400).json({ message: "Token is required" });
        return;
    }
    try {
        await authService.verifyEmail(token);
        res.status(200).json({ message: "Email confirmed successfully" });
    } catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : "Verification failed" });
    }
}

async function googleRedirect(_req: Request, res: Response): Promise<void> {
    res.redirect(getGoogleAuthUrl());
}

async function googleCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code as string;
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

    if (!code) {
        res.redirect(`${frontendUrl}/login?error=google_failed`);
        return;
    }
    try {
        const result = await authService.loginWithGoogle(code);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
    } catch (error) {
        res.redirect(`${frontendUrl}/login?error=google_failed`);
    }
}

async function getMe(req: Request, res: Response): Promise<void> {
    try {
        const user = await authService.getMe(req.user!.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching user" });
    }
}

async function itmoRedirect(_req: Request, res: Response): Promise<void> {
    res.redirect(getItmoAuthUrl());
}

async function itmoCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code as string;
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

    if (!code) {
        res.redirect(`${frontendUrl}/login?error=itmo_failed`);
        return;
    }
    try {
        const result = await authService.loginWithItmo(code);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
    } catch (error) {
        res.redirect(`${frontendUrl}/login?error=itmo_failed`);
    }
}

export default {
    login,
    logout,
    refreshTokens,
    register,
    verifyEmail,
    googleRedirect,
    googleCallback,
    itmoRedirect,
    itmoCallback,
    getMe
};

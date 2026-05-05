import {describe, it, expect, vi, beforeEach} from "vitest";
import authService from "../src/services/auth.service.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn()
        },
        refreshToken: {
        create: vi.fn(),
        delete: vi.fn(),
        findFirst: vi.fn(),
        deleteMany: vi.fn(),
        findUnique: vi.fn()
    }
    },
}
));
beforeEach(() => {
    vi.clearAllMocks();
});

vi.mock("bcryptjs", () => ({
    default: {
        compare: vi.fn(),
        hash: vi.fn()
    }
}));   

process.env.JWT_SECRET = "testjwtsecret";
process.env.JWT_REFRESH_SECRET = "testjwtrefreshsecret";

describe("authService.register", () => {
    it("should throw error if user already exists", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "1"} as any);
        await expect(authService.register( "user1@test.com", "123", "User1", "Lastname1", "Student"))
            .rejects
            .toThrow("Email exists");
    });
    it("should create user if email is not in use", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue({ id: "1", email: "user1@test.com" } as any);
        await expect(authService.register( "user1@test.com", "123", "User1", "Lastname1", "Student"))
            .resolves
            .toEqual({ id: "1", email: "user1@test.com" });
    });
});

describe("authService.login", () => {
    it("should throw error if user not found", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        await expect(authService.login( "user1@test.com", "123"))
            .rejects
            .toThrow("Invalid credentials");
    });
    it("should throw error if password is incorrect", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "1", passwordHash: "$invalidhash" } as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
        await expect(authService.login( "user1@test.com", "123"))
            .rejects
            .toThrow("Invalid credentials");
    });

    it("should return tokens and user data if credentials are correct", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "1", email: "user1@test.com", passwordHash: "$validhash" } as any);
        vi.mocked(prisma.refreshToken.create).mockResolvedValue({ token: "refreshtoken" } as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
        const result = await authService.login( "user1@test.com", "123");
        expect(result).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            user: expect.objectContaining({
                id: "1"
            })
        });

    });
});

describe("authService.logout", () => {
    it("should delete refresh token", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue(undefined as never);
        await authService.logout("refreshtoken");
        expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: "refreshtoken" } });
    });
});

describe("authService.refreshTokens", () => {
    const token = jwt.sign({userId: "1", role: "Student" }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
    it("should throw error if refresh token is invalid", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);
        await expect(authService.refreshTokens(token)).rejects.toThrow("Invalid refresh token");
    });

    it("should return new access token if refresh token is valid", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({ token, userId: "1", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "1", email: "user1@test.com" } as any);
        const result = await authService.refreshTokens(token);
        expect(result).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String)
        });
    });
});


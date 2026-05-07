import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";

vi.mock("../src/services/email.service.js", () => ({
    sendVerificationEmail: vi.fn(),
    sendDeadlineEmail: vi.fn(),
}));

process.env.JWT_SECRET = "testjwtsecret";
process.env.JWT_REFRESH_SECRET = "testrefreshsecret";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        refreshToken: {
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        }
    }
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn().mockResolvedValue("hashedpassword"),
        compare: vi.fn()
    }
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("POST /api/auth/register", () => {
    it("should return 201 on valid registration", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue({
            id: "1", email: "test@mail.ru", firstName: "Test", lastName: "User",
            role: "Student", passwordHash: "hashedpassword", createdAt: new Date()
        } as any);
        vi.mocked(prisma.user.update).mockResolvedValue({ id: "1", isConfirmedEmail: true } as any);

        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "test@mail.ru", password: "password123", firstName: "Test", lastName: "User", role: "Student" });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User registered successfully");
    });

    it("should return 400 on short password", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "test@mail.ru", password: "123", firstName: "Test", lastName: "User", role: "Student" });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it("should return 400 on invalid email", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "notanemail", password: "password123", firstName: "Test", lastName: "User", role: "Student" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/login", () => {
    it("should return 200 and accessToken on valid credentials", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const bcrypt = await import("bcryptjs");
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "1", email: "test@mail.ru", passwordHash: "hashedpassword",
            firstName: "Test", lastName: "User", role: "Student", createdAt: new Date(), isConfirmedEmail: true
        } as any);
        vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never);
        vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@mail.ru", password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBeDefined();
    });

    it("should return 401 on wrong password", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const bcrypt = await import("bcryptjs");
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "1", email: "test@mail.ru", passwordHash: "hashedpassword",
            firstName: "Test", lastName: "User", role: "Student", createdAt: new Date()
        } as any);
        vi.mocked(bcrypt.default.compare).mockResolvedValue(false as never);

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@mail.ru", password: "wrongpassword" });

        expect(res.status).toBe(401);
    });

    it("should return 400 on missing fields", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@mail.ru" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/logout", () => {
    it("should return 200", async () => {
        const res = await request(app)
            .post("/api/auth/logout");

        expect(res.status).toBe(200);
    });
});

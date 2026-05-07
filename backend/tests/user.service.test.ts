import userService from "../src/services/user.service.js";
import {describe, it, expect, vi, beforeEach} from "vitest";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            delete: vi.fn(),
        }
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("user service get user", () => {
    it("should return user by email", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockUser = { id: "1", email: "somemail"};
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        const result = await userService.findUserByEmail("somemail");
        expect(result).toEqual(mockUser);
    });
});

describe("userService.listUsers", () => {
    it("should return all non-admin users", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockUsers = [{ id: "1", email: "a@test.ru", role: "Student" }, { id: "2", email: "b@test.ru", role: "Teacher" }];
        vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
        const result = await userService.listUsers();
        expect(result).toEqual(mockUsers);
        expect(prisma.user.findMany).toHaveBeenCalledOnce();
    });
});

describe("userService.deleteUser", () => {
    it("should delete user by id", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.user.delete).mockResolvedValue({} as any);
        await userService.deleteUser("1");
        expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    });
});
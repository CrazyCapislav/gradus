import userService from "../src/services/user.service.js";
import {describe, it, expect, vi, beforeEach} from "vitest";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        user: {
            findUnique: vi.fn()
        }
    },
}
));

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
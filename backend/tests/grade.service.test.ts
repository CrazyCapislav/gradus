import gradeService from "../src/services/grade.service.js";
import {describe, it, expect, vi, beforeEach} from "vitest";

vi.mock("../src/services/email.service.js", () => ({
    sendGradeReceivedEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        grade: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        stageResult: {
            findUnique: vi.fn()
        },
        notification: {
            create: vi.fn()
        }
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("gradeService.createGrade", () => {
    it("should create a new grade", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockGrade = { stageResultId: "1", score: 90, maxScore: 100, gradedById: "teacher1", feedback: "Good job!" };
        vi.mocked(prisma.stageResult.findUnique).mockResolvedValue({ studentId: "student1", stage: { title: "Stage 1" }, student: { email: "s@test.ru", firstName: "Ivan" } } as any);
        vi.mocked(prisma.grade.create).mockResolvedValue(mockGrade as any);
        vi.mocked(prisma.notification.create).mockResolvedValue({} as any);
        const result = await gradeService.createGrade("1", 90, 100, "teacher1", "Good job!");
        expect(result).toEqual(mockGrade);
    });
});

describe("gradeService.getGrade", () => {
    it("should return a grade by stage result ID", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockGrade = { stageResultId: "1", score: 90, maxScore: 100, gradedById: "teacher1", feedback: "Good job!" };
        vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
        const result = await gradeService.getGrade("1");
        expect(result).toEqual(mockGrade);
    });
});

describe("gradeService.updateGrade", () => {
    it("should update a grade", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockGrade = { stageResultId: "1", score: 95, maxScore: 100, gradedById: "teacher1", feedback: "Excellent improvement!" };
        vi.mocked(prisma.grade.update).mockResolvedValue(mockGrade as any);
        const result = await gradeService.updateGrade("1", { score: 95, feedback: "Excellent improvement!" });
        expect(result).toEqual(mockGrade);
    });
});


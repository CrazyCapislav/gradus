import finalGradeService from "../src/services/finalGrade.service.js";
import {describe, it, expect, vi, beforeEach} from "vitest";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        finalGrade: {
            create: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn()
        }
    },
}
));

beforeEach(() => {
    vi.clearAllMocks();
});


describe("finalGradeService.createFinalGrade", () => {
    it("should create a new final grade", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockFinalGrade = { projectId: "someProjectId", studentId:"someStudentId", score: 90, teacherId: "someTeacherId", feedback: "somefeedback"};
        vi.mocked(prisma.finalGrade.create).mockResolvedValue(mockFinalGrade as any);
        const result = await finalGradeService.createFinalGrade("someProjectId", "someStudentId", 90, "someTeacherId", "somefeedback");
        expect(result).toEqual(mockFinalGrade);
    });
});

describe("gradeService.getFinalGrade", () => {
    it("should return a final grade by project id", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockFinalGrade = { projectId: "someProjectId", studentId:"someStudentId", score: 90, teacherId: "someTeacherId", feedback: "somefeedback"};
        vi.mocked(prisma.finalGrade.findMany).mockResolvedValue(mockFinalGrade as any);
        const result = await finalGradeService.getFinalGrades("someProjectId");
        expect(result).toEqual(mockFinalGrade);
    });
});

describe("gradeService.updateGrade", () => {
    it("should update a final grade", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockFinalGrade = { projectId: "someProjectId", studentId:"someStudentId", score: 90, teacherId: "someTeacherId", feedback: "somefeedback"};
        vi.mocked(prisma.finalGrade.update).mockResolvedValue(mockFinalGrade as any);
        const result = await finalGradeService.updateFinalGrade("someProjectId", "someStudentId", {score: 90, feedback: "somefeedback"});
        expect(result).toEqual(mockFinalGrade);
    });
});

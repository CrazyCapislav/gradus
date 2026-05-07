import stageResultService from "../src/services/stageResult.service.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        stage: { findUnique: vi.fn() },
        stageResult: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        notification: { create: vi.fn() }
    }
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("stageResultService.createStageResult", () => {
    it("should create a stage result and send notification", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockStage = { hardDeadline: null, project: { teacherId: "teacher1", title: "Project A" } };
        const mockResult = { id: "result1", stageId: "stage1", studentId: "student1", isLate: false };
        vi.mocked(prisma.stage.findUnique).mockResolvedValue(mockStage as any);
        vi.mocked(prisma.stageResult.create).mockResolvedValue(mockResult as any);
        vi.mocked(prisma.notification.create).mockResolvedValue({} as any);
        const result = await stageResultService.createStageResult("stage1", "student1", "my answer");
        expect(result).toEqual(mockResult);
        expect(prisma.notification.create).toHaveBeenCalledOnce();
    });

    it("should mark result as late if past hardDeadline", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const pastDate = new Date(Date.now() - 1000 * 60 * 60);
        const mockStage = { hardDeadline: pastDate, project: { teacherId: "teacher1", title: "Project A" } };
        const mockResult = { id: "result1", stageId: "stage1", studentId: "student1", isLate: true };
        vi.mocked(prisma.stage.findUnique).mockResolvedValue(mockStage as any);
        vi.mocked(prisma.stageResult.create).mockResolvedValue(mockResult as any);
        vi.mocked(prisma.notification.create).mockResolvedValue({} as any);
        const result = await stageResultService.createStageResult("stage1", "student1");
        expect(result.isLate).toBe(true);
    });
});

describe("stageResultService.getStageResults", () => {
    it("should return all results for a stage", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockResults = [{ id: "r1", stageId: "stage1" }, { id: "r2", stageId: "stage1" }];
        vi.mocked(prisma.stageResult.findMany).mockResolvedValue(mockResults as any);
        const result = await stageResultService.getStageResults("stage1");
        expect(result).toEqual(mockResults);
        expect(prisma.stageResult.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { stageId: "stage1" } }));
    });
});

describe("stageResultService.getStageResultById", () => {
    it("should return a stage result by id", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockResult = { id: "result1", stageId: "stage1", studentId: "student1" };
        vi.mocked(prisma.stageResult.findUnique).mockResolvedValue(mockResult as any);
        const result = await stageResultService.getStageResultById("result1");
        expect(result).toEqual(mockResult);
    });
});

describe("stageResultService.updateStageResult", () => {
    it("should update a stage result", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockResult = { id: "result1", contentText: "updated answer" };
        vi.mocked(prisma.stageResult.update).mockResolvedValue(mockResult as any);
        const result = await stageResultService.updateStageResult("result1", { contentText: "updated answer" });
        expect(result).toEqual(mockResult);
    });
});

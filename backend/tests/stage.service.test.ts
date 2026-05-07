import stageService from "../src/services/stage.service.js";
import {describe, it, expect, vi, beforeEach} from "vitest";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        stage: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        }
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});


describe("stageService.createStage", () => {
    it("should create a new stage", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockStage = { projectId: "1", data: {title: "sometitle",  stageOrder: 1}};
        vi.mocked(prisma.stage.create).mockResolvedValue(mockStage as any);
        const result = await stageService.createStage("1", {title: "sometitle",  stageOrder: 1});
        expect(result).toEqual(mockStage);
    });
});

describe("stageService.getStages", () => {
    it("should return all stages by projectId", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockStage = { projectId: "1", data: {title: "sometitle",  stageOrder: 1}};
        vi.mocked(prisma.stage.findMany).mockResolvedValue(mockStage as any);
        const result = await stageService.getStages("1");
        expect(result).toEqual(mockStage);
    });
});

describe("stageService.updateStage", () => {
    it("should update stage", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockStage = { projectId: "1", data: {title: "sometitle",  stageOrder: 1}};
        vi.mocked(prisma.stage.update).mockResolvedValue(mockStage as any);
        const result = await stageService.updateStage("1", {title: "sometitle"});
        expect(result).toEqual(mockStage);
    });
});

describe("stageService.deleteStage", () => {
    it("should delete stage", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.stage.delete).mockResolvedValue({} as any);
        await stageService.deleteStage("1");
        expect(prisma.stage.delete).toHaveBeenCalledWith({where: {id: "1"}})
    });
});

describe("stageService.getStageById", () => {
    it("should return stage by id", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockStage = { id: "1", title: "Stage 1", projectId: "p1" };
        vi.mocked(prisma.stage.findUnique).mockResolvedValue(mockStage as any);
        const result = await stageService.getStageById("1");
        expect(result).toEqual(mockStage);
    });

    it("should throw if stage not found", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.stage.findUnique).mockResolvedValue(null);
        await expect(stageService.getStageById("missing")).rejects.toThrow("Stage not found");
    });
});
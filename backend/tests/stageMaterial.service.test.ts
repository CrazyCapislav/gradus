import stageMaterialService from "../src/services/stageMaterial.service.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        stageMaterial: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        }
    }
}));

vi.mock("fs/promises", () => ({
    default: { unlink: vi.fn().mockResolvedValue(undefined) }
}));

beforeEach(() => { vi.clearAllMocks(); });

describe("stageMaterialService.uploadMaterial", () => {
    it("should create a material record", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockMaterial = { id: "m1", stageId: "s1", originalName: "file.pdf", filePath: "uploads/file.pdf", fileSize: 1024, mimeType: "application/pdf" };
        vi.mocked(prisma.stageMaterial.create).mockResolvedValue(mockMaterial as any);
        const file = { originalname: "file.pdf", path: "uploads/file.pdf", size: 1024, mimetype: "application/pdf" } as Express.Multer.File;
        const result = await stageMaterialService.uploadMaterial(file, "s1");
        expect(result).toEqual(mockMaterial);
        expect(prisma.stageMaterial.create).toHaveBeenCalledOnce();
    });
});

describe("stageMaterialService.getMaterials", () => {
    it("should return materials for a stage", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockMaterials = [{ id: "m1", stageId: "s1" }, { id: "m2", stageId: "s1" }];
        vi.mocked(prisma.stageMaterial.findMany).mockResolvedValue(mockMaterials as any);
        const result = await stageMaterialService.getMaterials("s1");
        expect(result).toEqual(mockMaterials);
        expect(prisma.stageMaterial.findMany).toHaveBeenCalledWith({ where: { stageId: "s1" } });
    });
});

describe("stageMaterialService.getMaterialById", () => {
    it("should return a material by id", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockMaterial = { id: "m1", stageId: "s1", filePath: "uploads/file.pdf" };
        vi.mocked(prisma.stageMaterial.findUnique).mockResolvedValue(mockMaterial as any);
        const result = await stageMaterialService.getMaterialById("m1");
        expect(result).toEqual(mockMaterial);
    });

    it("should return null if not found", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.stageMaterial.findUnique).mockResolvedValue(null);
        const result = await stageMaterialService.getMaterialById("missing");
        expect(result).toBeNull();
    });
});

describe("stageMaterialService.deleteMaterial", () => {
    it("should delete material and file if found", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const fs = await import("fs/promises");
        const mockMaterial = { id: "m1", filePath: "uploads/file.pdf" };
        vi.mocked(prisma.stageMaterial.findUnique).mockResolvedValue(mockMaterial as any);
        vi.mocked(prisma.stageMaterial.delete).mockResolvedValue(mockMaterial as any);
        await stageMaterialService.deleteMaterial("m1");
        expect(fs.default.unlink).toHaveBeenCalledWith("uploads/file.pdf");
        expect(prisma.stageMaterial.delete).toHaveBeenCalledWith({ where: { id: "m1" } });
    });

    it("should do nothing if material not found", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.stageMaterial.findUnique).mockResolvedValue(null);
        await stageMaterialService.deleteMaterial("missing");
        expect(prisma.stageMaterial.delete).not.toHaveBeenCalled();
    });
});

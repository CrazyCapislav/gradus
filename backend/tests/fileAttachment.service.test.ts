import fileAttachmentService from "../src/services/fileAttachment.service.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        fileAttachment: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn()
        }
    }
}));

vi.mock("fs/promises", () => ({
    default: { unlink: vi.fn().mockResolvedValue(undefined) }
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("fileAttachmentService.saveFileAttachment", () => {
    it("should save a file attachment", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockFile = { originalname: "test.pdf", path: "/uploads/test.pdf", size: 1024, mimetype: "application/pdf" } as Express.Multer.File;
        const mockAttachment = { id: "att1", originalName: "test.pdf", stageResultId: "result1" };
        vi.mocked(prisma.fileAttachment.create).mockResolvedValue(mockAttachment as any);
        const result = await fileAttachmentService.saveFileAttachment(mockFile, "result1");
        expect(result).toEqual(mockAttachment);
        expect(prisma.fileAttachment.create).toHaveBeenCalledWith({
            data: {
                originalName: "test.pdf",
                filePath: "/uploads/test.pdf",
                fileSize: 1024,
                stageResultId: "result1",
                mimeType: "application/pdf"
            }
        });
    });
});

describe("fileAttachmentService.getFileAttachments", () => {
    it("should return all attachments for a stage result", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockAttachments = [{ id: "att1" }, { id: "att2" }];
        vi.mocked(prisma.fileAttachment.findMany).mockResolvedValue(mockAttachments as any);
        const result = await fileAttachmentService.getFileAttachments("result1");
        expect(result).toEqual(mockAttachments);
        expect(prisma.fileAttachment.findMany).toHaveBeenCalledWith({ where: { stageResultId: "result1" } });
    });
});

describe("fileAttachmentService.deleteFileAttachment", () => {
    it("should delete file from disk and database", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const fs = await import("fs/promises");
        const mockAttachment = { id: "att1", filePath: "/uploads/test.pdf" };
        vi.mocked(prisma.fileAttachment.findUnique).mockResolvedValue(mockAttachment as any);
        vi.mocked(prisma.fileAttachment.delete).mockResolvedValue(mockAttachment as any);
        await fileAttachmentService.deleteFileAttachment("att1");
        expect(fs.default.unlink).toHaveBeenCalledWith("/uploads/test.pdf");
        expect(prisma.fileAttachment.delete).toHaveBeenCalledWith({ where: { id: "att1" } });
    });

    it("should do nothing if attachment not found", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.fileAttachment.findUnique).mockResolvedValue(null);
        await fileAttachmentService.deleteFileAttachment("nonexistent");
        expect(prisma.fileAttachment.delete).not.toHaveBeenCalled();
    });
});

import {prisma} from "../prisma/prisma.js";
import type { FileAttachmentModel } from "../generated/prisma/models.js";
import fs from "fs/promises";

async function saveFileAttachment(file: Express.Multer.File, stageResultId: string): Promise<FileAttachmentModel> {
    return await prisma.fileAttachment.create({
        data: {
            originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
            filePath: file.path,
            fileSize: file.size,
            stageResultId,
            mimeType: file.mimetype
        }
    });
}

async function getFileAttachments(stageResultId: string): Promise<FileAttachmentModel[]> {
    return await prisma.fileAttachment.findMany({
        where: { stageResultId }
    });
}


async function deleteFileAttachment(fileAttachmentId: string): Promise<void> {
    const fileAttachment = await prisma.fileAttachment.findUnique({
        where: { id: fileAttachmentId }
    });
    if (fileAttachment) {
        await fs.unlink(fileAttachment.filePath).catch(() => {
            console.error(`Failed to delete file at ${fileAttachment.filePath}`);
        });
        await prisma.fileAttachment.delete({
            where: { id: fileAttachmentId }
        });
    }
}


export default {
    saveFileAttachment,
    getFileAttachments,
    deleteFileAttachment,
};


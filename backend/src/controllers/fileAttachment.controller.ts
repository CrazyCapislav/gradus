import fileAttachmentService from "../services/fileAttachment.service.js";
import type { Request, Response } from "express";

async function uploadFile(req: Request<{ stageResultId: string }>, res: Response): Promise<void> {
    const { stageResultId } = req.params;
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    try {
        const fileAttachment = await fileAttachmentService.saveFileAttachment(req.file, stageResultId);
        res.status(201).json(fileAttachment);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error uploading file" });
    }
}

async function getFileAttachments(req: Request<{ stageResultId: string }>, res: Response): Promise<void> {
    const { stageResultId } = req.params;
    try {
        const attachments = await fileAttachmentService.getFileAttachments(stageResultId);
        res.status(200).json(attachments);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching file attachments" });
    }
}

async function deleteFileAttachment(req: Request<{ fileAttachmentId: string }>, res: Response): Promise<void> {
    const { fileAttachmentId } = req.params;
    try {
        await fileAttachmentService.deleteFileAttachment(fileAttachmentId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error deleting file attachment" });
    }
}

async function downloadFileAttachment(req: Request<{ fileAttachmentId: string }>, res: Response): Promise<void> {
    const { fileAttachmentId } = req.params;
    try {
        const attachment = await fileAttachmentService.getFileAttachmentById(fileAttachmentId);
        if (!attachment) {
            res.status(404).json({ message: "File not found" });
            return;
        }
        res.download(attachment.filePath, attachment.originalName);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error downloading file" });
    }
}

export default {
    uploadFile,
    getFileAttachments,
    downloadFileAttachment,
    deleteFileAttachment,
};

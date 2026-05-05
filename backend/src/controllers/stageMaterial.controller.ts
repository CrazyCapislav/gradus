import stageMaterialService from "../services/stageMaterial.service.js";
import type { Request, Response } from "express";
import path from "path";

async function uploadMaterial(req: Request<{ stageId: string }>, res: Response): Promise<void> {
    const { stageId } = req.params;
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    try {
        const material = await stageMaterialService.uploadMaterial(req.file, stageId);
        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error uploading material" });
    }
}

async function getMaterials(req: Request<{ stageId: string }>, res: Response): Promise<void> {
    const { stageId } = req.params;
    try {
        const materials = await stageMaterialService.getMaterials(stageId);
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching materials" });
    }
}

async function downloadMaterial(req: Request<{ stageId: string; materialId: string }>, res: Response): Promise<void> {
    const { materialId } = req.params;
    try {
        const material = await stageMaterialService.getMaterialById(materialId);
        if (!material) {
            res.status(404).json({ message: "Material not found" });
            return;
        }
        res.download(path.resolve(material.filePath), material.originalName);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error downloading material" });
    }
}

async function deleteMaterial(req: Request<{ stageId: string; materialId: string }>, res: Response): Promise<void> {
    const { materialId } = req.params;
    try {
        await stageMaterialService.deleteMaterial(materialId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error deleting material" });
    }
}

export default { uploadMaterial, getMaterials, downloadMaterial, deleteMaterial };

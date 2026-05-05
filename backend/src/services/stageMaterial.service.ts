import { prisma } from "../prisma/prisma.js";
import type { StageMaterialModel } from "../generated/prisma/models.js";
import fs from "fs/promises";

async function uploadMaterial(file: Express.Multer.File, stageId: string): Promise<StageMaterialModel> {
    return await prisma.stageMaterial.create({
        data: {
            stageId,
            originalName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
        },
    });
}

async function getMaterials(stageId: string): Promise<StageMaterialModel[]> {
    return await prisma.stageMaterial.findMany({ where: { stageId } });
}

async function getMaterialById(materialId: string): Promise<StageMaterialModel | null> {
    return await prisma.stageMaterial.findUnique({ where: { id: materialId } });
}

async function deleteMaterial(materialId: string): Promise<void> {
    const material = await prisma.stageMaterial.findUnique({ where: { id: materialId } });
    if (material) {
        await fs.unlink(material.filePath).catch(() => {});
        await prisma.stageMaterial.delete({ where: { id: materialId } });
    }
}

export default { uploadMaterial, getMaterials, getMaterialById, deleteMaterial };

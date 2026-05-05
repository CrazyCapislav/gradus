import client from "./client";
import type { StageMaterial } from "../types";

export const getMaterials = async (projectId: string, stageId: string): Promise<StageMaterial[]> => {
    const response = await client.get(`/projects/${projectId}/stages/${stageId}/materials`);
    return response.data;
};

export const uploadMaterial = async (projectId: string, stageId: string, file: File): Promise<StageMaterial> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await client.post(`/projects/${projectId}/stages/${stageId}/materials`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteMaterial = async (projectId: string, stageId: string, materialId: string): Promise<void> => {
    await client.delete(`/projects/${projectId}/stages/${stageId}/materials/${materialId}`);
};

export const getMaterialDownloadUrl = (projectId: string, stageId: string, materialId: string): string => {
    return `/api/projects/${projectId}/stages/${stageId}/materials/${materialId}/download`;
};

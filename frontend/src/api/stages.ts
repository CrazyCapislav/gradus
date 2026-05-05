import client from "./client";
import type { Stage } from "../types";

export const getStages = async (projectId: string): Promise<Stage[]> => {
    const response = await client.get(`/projects/${projectId}/stages`);
    return response.data;
};

export const createStage = async (
    projectId: string,
    title: string,
    description: string,
    stageOrder: number = 1,
    softDeadline?: string,
    hardDeadline?: string
): Promise<Stage> => {
    const response = await client.post(`/projects/${projectId}/stages`, {
        title, description, stageOrder,
        ...(softDeadline && { softDeadline }),
        ...(hardDeadline && { hardDeadline }),
    });
    return response.data;
}


export const getStageById = async (projectId: string, stageId: string): Promise<Stage> => {
    const response = await client.get(`/projects/${projectId}/stages/${stageId}`);
    return response.data;
};
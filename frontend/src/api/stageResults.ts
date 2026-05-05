import client from './client';
import type { StageResult } from '../types';

export const submitStageResult = async (projectId: string, stageId: string, contentText: string): Promise<StageResult> => {
    const response = await client.post(`/projects/${projectId}/stages/${stageId}/results`, { contentText });
    return response.data;
}

export const getStageResults = async (projectId: string, stageId: string): Promise<StageResult[]> => {
    const response = await client.get(`/projects/${projectId}/stages/${stageId}/results`);
    return response.data;
}

export const getMyResult = async (projectId: string, stageId: string): Promise<StageResult | null> => {
    const response = await client.get(`/projects/${projectId}/stages/${stageId}/results/my`);
    return response.data;
}

export const updateMyResult = async (projectId: string, stageId: string, contentText: string): Promise<StageResult> => {
    const response = await client.put(`/projects/${projectId}/stages/${stageId}/results/my`, { contentText });
    return response.data;
}
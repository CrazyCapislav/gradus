import client from './client';
import type { StageResult } from '../types';


export const gradeStageResult = async (stageResultId: string, score: number, feedback?: string): Promise<StageResult> => {
    const response = await client.post(`/results/${stageResultId}/grade`, { score, feedback });
    return response.data;
}
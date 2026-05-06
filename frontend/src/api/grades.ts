import client from './client';
import type { StageResult } from '../types';


export const gradeStageResult = async (stageResultId: string, score: number, maxScore: number, feedback?: string): Promise<StageResult> => {
    const response = await client.post(`/results/${stageResultId}/grade`, { score, maxScore, feedback });
    return response.data;
}
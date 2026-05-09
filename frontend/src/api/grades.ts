import client from './client';
import type { Grade } from '../types';

export const gradeStageResult = async (stageResultId: string, isAccepted: boolean, feedback?: string): Promise<Grade> => {
    const response = await client.post(`/results/${stageResultId}/grade`, { isAccepted, feedback });
    return response.data;
}
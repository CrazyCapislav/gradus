import client from "./client";

export const uploadFile = async (stageResultId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await client.post(`/results/${stageResultId}/files`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}
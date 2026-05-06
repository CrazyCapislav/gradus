import client from "./client";

export const uploadFile = async (stageResultId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await client.post(`/results/${stageResultId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}

export const downloadAttachment = async (stageResultId: string, fileAttachmentId: string, fileName: string): Promise<void> => {
    const response = await client.get(`/results/${stageResultId}/files/${fileAttachmentId}/download`, {
        responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
import client from './client';
import type {Project} from "../types";

export const getProjects = async (): Promise<Project[]> => {
    const response = await client.get('/projects');
    return response.data;
};

export const getAllProjects = async (): Promise<Project[]> => {
    const response = await client.get('/projects/all');
    return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
    const response = await client.get(`/projects/${id}`);
    return response.data;
}

export const createProject = async (title: string, description: string): Promise<Project> => {
    const response = await client.post('/projects', { title, description });
    return response.data;
}

export const updateProject = async (id: string, data: { title?: string; description?: string; status?: string }): Promise<Project> => {
    const response = await client.put(`/projects/${id}`, data);
    return response.data;
}

export const deleteProject = async (id: string): Promise<void> => {
    await client.delete(`/projects/${id}`);
}

export const addMember = async (projectId: string, userId: string): Promise<void> => {
    await client.post(`/projects/${projectId}/members`, { userId });
}

export const inviteUser = async (projectId: string, userId: string): Promise<void> => {
    await client.post(`/projects/${projectId}/invite`, { userId });
}

export const acceptInvitation = async (projectId: string): Promise<void> => {
    await client.post(`/projects/${projectId}/invitations/accept`);
}

export const declineInvitation = async (projectId: string): Promise<void> => {
    await client.post(`/projects/${projectId}/invitations/decline`);
}

export const removeMember = async (projectId: string, userId: string): Promise<void> => {
    await client.delete(`/projects/${projectId}/members`, { data: { userId } });
}

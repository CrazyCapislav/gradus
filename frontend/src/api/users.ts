import client from './client';
import type { User } from '../types/index';

export const searchUserByEmail = async (email: string): Promise<User> => {
    const response = await client.get(`/users/search`, { params: { email } });
    return response.data;
}

export const listUsers = async (): Promise<User[]> => {
    const response = await client.get(`/users`);
    return response.data;
}

export const deleteUser = async (userId: string): Promise<void> => {
    await client.delete(`/users/${userId}`);
}

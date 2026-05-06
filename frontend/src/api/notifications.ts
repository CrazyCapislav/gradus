import client from './client';
import type { Notification } from '../types';


export const getNotifications = async (): Promise<Notification[]> => {
    const response = await client.get('/notifications');
    return response.data;
};

export const markAsRead = async (id: string): Promise<void> => {
    await client.put(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: string): Promise<void> => {
    await client.delete(`/notifications/${id}`);
};
import notificationService from "../services/notification.service.js";
import type { Request, Response } from "express";

async function getNotifications(req: Request, res: Response): Promise<void> {
    try {
        const notifications = await notificationService.getNotifications(req.user!.userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching notifications" });
    }
}
async function markAsRead(req: Request<{ id: string }>, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const notification = await notificationService.markAsRead(id);
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error marking notification as read" });
    }
}

async function markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
        await notificationService.markAllAsRead(req.user!.userId);
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error marking all notifications as read" });
    }
}

async function deleteNotification(req: Request<{ id: string }>, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        await notificationService.deleteNotification(id, req.user!.userId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error deleting notification" });
    }
}

export default {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
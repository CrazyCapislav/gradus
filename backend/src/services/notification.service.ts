import {prisma} from "../prisma/prisma.js";
import type { NotificationModel } from "../generated/prisma/models.js";

async function getNotifications(userId: string): Promise<NotificationModel[]> {
    return prisma.notification.findMany({
        where: {
            userId
        }
    });
}


async function markAsRead(notificationId: string): Promise<NotificationModel> {
    return prisma.notification.update({
        where: {
            id: notificationId
        },
        data: {
            isRead: true
        }
    });
}

async function markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false
        },
        data: {
            isRead: true
        }
    });
}

export default {
    getNotifications,
    markAsRead,
    markAllAsRead
};
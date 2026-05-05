import notificationService from "../src/services/notification.service.js";
import {describe, it, expect, vi, beforeEach} from "vitest";

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        notification:{
            findMany: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn()
        }
    },
}
));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("notificationService.getNotifications", () => {
    it("should return all notifications by userId", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockNotifications = {userId:'1'}
        vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifications as any);
        const result = await notificationService.getNotifications("1")
        expect(result).toEqual(mockNotifications)
    });
});

describe("notificationService.markAsRead", () => {
    it("should mark notification as read", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.notification.update).mockResolvedValue({id:"1", isRead: true} as any);
        const result = await notificationService.markAsRead("1")
        expect(result).toMatchObject({isRead: true})
    });
});

describe("notificationService.markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.notification.updateMany).mockResolvedValue({count: 42} as any);
        await notificationService.markAllAsRead("1");
        expect(prisma.notification.updateMany).toHaveBeenCalledWith({
            where: {userId: "1", isRead: false},
            data: {isRead: true}
        });
    });
});
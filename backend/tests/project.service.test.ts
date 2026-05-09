import projectService from "../src/services/project.service.js";
import {describe, it, expect, vi, beforeEach} from "vitest";

vi.mock("../src/services/email.service.js", () => ({
    sendProjectInvitationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/prisma/prisma.js", () => ({
    prisma: {
        project: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        projectMember: {
            create: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
        },
        notification: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        }
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("projectService.createProject", () => {
    it("should create a new project", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockProject = { id: "1", name: "Test Project", description: "A test project", ownerId: "user1" };
        vi.mocked(prisma.project.create).mockResolvedValue(mockProject as any);
        const result = await projectService.createProject("user1", "Test Project", "test description");
        expect(result).toEqual(mockProject);
    });
});

describe("projectService.getProjects", () => {
    it("should return projects for a user", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockProjects = [
            { id: "1", name: "Test Project 1", description: "A test project", ownerId: "user1" },
            { id: "2", name: "Test Project 2", description: "Another test project", ownerId: "user1" }
        ];
        vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
        const result = await projectService.getProjects("user1");
        expect(result).toEqual(mockProjects);
    });
});


describe("projectService.getProjectById", () => {
    it("should return a project by ID", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockProject = { id: "1", name: "Test Project", description: "A test project", ownerId: "user1" };
        vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
        const result = await projectService.getProjectById("1");
        expect(result).toEqual(mockProject);
    });
});

describe("projectService.updateProject", () => {
    it("should update a project", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockProject = { id: "1", name: "Updated Project", description: "An updated test project", ownerId: "user1" };
        vi.mocked(prisma.project.update).mockResolvedValue(mockProject as any);
        const result = await projectService.updateProject("1", {title: "Updated Project"});
        expect(result).toEqual(mockProject);
    }
);
});

describe("projectService.deleteProject", () => {
    it("should delete a project", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        const mockProject = { id: "1", name: "Test Project", description: "A test project", ownerId: "user1" };
        vi.mocked(prisma.project.delete).mockResolvedValue(mockProject as any);
        await projectService.deleteProject("1");
        expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    });
});

describe("projectService.addMember", () => {
    it("should add a member to project", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.projectMember.create).mockResolvedValue({} as any)
        await projectService.addMember("1", "user1");
        expect(prisma.projectMember.create).toHaveBeenCalledWith({
            data:{projectId: "1", userId: "user1"}
        });
    });
});

describe("projectService.removeMember", () => {
    it("should remove member from project", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.projectMember.delete).mockResolvedValue({} as any);
        await projectService.removeMember("1", "user1");
        expect(prisma.projectMember.delete).toHaveBeenCalledWith({
            where: { projectId_userId: { projectId: "1", userId: "user1" } }
        });
    });
});


describe("projectService.submitProject", () => {
    it("should set project status to ReadyForGrade", async () => {
        const {prisma} = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.project.update).mockResolvedValue({} as any);
        await projectService.submitProject("1");
        expect(prisma.project.update).toHaveBeenCalledWith({
            where: { id: "1" },
            data: { status: "ReadyForGrade" }
        });
    });
});

describe("projectService.getAllProjects", () => {
    it("should return all projects", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        const mockProjects = [{ id: "1" }, { id: "2" }];
        vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
        const result = await projectService.getAllProjects();
        expect(result).toEqual(mockProjects);
    });
});

describe("projectService.inviteUser", () => {
    it("should create invitation notification", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.notification.findFirst).mockResolvedValue(null);
        vi.mocked(prisma.notification.create).mockResolvedValue({} as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: "u@test.ru", firstName: "User" } as any);
        await projectService.inviteUser("p1", "u1", "Teacher Name", "Project A");
        expect(prisma.notification.create).toHaveBeenCalledOnce();
    });

    it("should throw if invitation already sent", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.notification.findFirst).mockResolvedValue({ id: "n1" } as any);
        await expect(projectService.inviteUser("p1", "u1", "Teacher", "Project A")).rejects.toThrow("Invitation already sent");
    });
});

describe("projectService.acceptInvitation", () => {
    it("should add member and mark notification as read", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.notification.findFirst).mockResolvedValue({ id: "n1" } as any);
        vi.mocked(prisma.projectMember.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.projectMember.create).mockResolvedValue({} as any);
        vi.mocked(prisma.notification.update).mockResolvedValue({} as any);
        await projectService.acceptInvitation("p1", "u1");
        expect(prisma.projectMember.create).toHaveBeenCalledOnce();
        expect(prisma.notification.update).toHaveBeenCalledOnce();
    });
});

describe("projectService.declineInvitation", () => {
    it("should mark invitation notification as read", async () => {
        const { prisma } = await import("../src/prisma/prisma.js");
        vi.mocked(prisma.notification.findFirst).mockResolvedValue({ id: "n1" } as any);
        vi.mocked(prisma.notification.update).mockResolvedValue({} as any);
        await projectService.declineInvitation("p1", "u1");
        expect(prisma.notification.update).toHaveBeenCalledWith({ where: { id: "n1" }, data: { isRead: true } });
    });
});
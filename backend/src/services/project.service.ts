import {prisma} from "../prisma/prisma.js";
import type { ProjectModel } from "../generated/prisma/models.js";
import { ProjectStatus } from "../generated/prisma/enums.js";
async function createProject(teacherId: string, title: string, description: string| undefined): Promise<ProjectModel> {
    return await prisma.project.create({
        data: {
            teacherId, title, 
            ... (description !== undefined && { description })
        }
    });
}

async function getProjects(userId: string) {
    return await prisma.project.findMany({
        where: { OR:[{ members: { some: { userId } } }, { teacherId: userId }] },
        include: { members: true }
    });
}

async function getAllProjects() {
    return await prisma.project.findMany({
        include: { members: true },
        orderBy: { createdAt: "desc" }
    });
}

async function getProjectById(projectId: string) {
    return await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true }
    });
}

async function updateProject(projectId: string, data: { title?: string; description?: string; status?: ProjectStatus }) {
    return await prisma.project.update({
        where: { id: projectId },
        data: data
    });
}

async function deleteProject(projectId: string) {
    await prisma.project.delete({
        where: { id: projectId }
    });
}

async function addMember(projectId: string, userId: string) {
    await prisma.projectMember.create({
        data: { projectId, userId }
    });
}

async function inviteUser(projectId: string, invitedUserId: string, teacherName: string, projectTitle: string) {
    const existing = await prisma.notification.findFirst({
        where: { userId: invitedUserId, type: "project_invitation", referenceId: projectId, isRead: false }
    });
    if (existing) throw new Error("Invitation already sent");

    await prisma.notification.create({
        data: {
            userId: invitedUserId,
            type: "project_invitation",
            message: JSON.stringify({ key: "notif_projectInvitation", params: { teacherName, projectTitle } }),
            referenceId: projectId,
            referenceType: "Project",
        }
    });
}

async function acceptInvitation(projectId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
        where: { userId, type: "project_invitation", referenceId: projectId }
    });
    const alreadyMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } }
    });
    if (!alreadyMember) {
        await prisma.projectMember.create({ data: { projectId, userId } });
    }
    if (notification) {
        await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } });
    }
}

async function declineInvitation(projectId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
        where: { userId, type: "project_invitation", referenceId: projectId }
    });
    if (notification) {
        await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } });
    }
}

async function removeMember(projectId: string, userId: string) {
    await prisma.projectMember.delete({
        where: { projectId_userId: { projectId, userId } }
    });
}

async function submitProject(projectId: string) {
    await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.ReadyForGrade }
    });
}

export default {
    createProject,
    getProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    inviteUser,
    acceptInvitation,
    declineInvitation,
    removeMember,
    submitProject
};


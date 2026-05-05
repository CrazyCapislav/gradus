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
        data: {
            projectId, userId
        }
    });
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
    removeMember,
    submitProject
};


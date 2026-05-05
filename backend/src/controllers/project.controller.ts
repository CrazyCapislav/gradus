import ProjectService from "../services/project.service.js";
import type { Request, Response } from "express";

async function createProject(req: Request, res: Response): Promise<void> {
    const { title, description } = req.body;
    try {
        const project = await ProjectService.createProject(req.user!.userId, title, description);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error creating project" });
    }
}

async function getProjects(req: Request, res: Response): Promise<void> {
    try {
        const projects = await ProjectService.getProjects(req.user!.userId);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching projects" });
    }
}

async function getAllProjects(_req: Request, res: Response): Promise<void> {
    try {
        const projects = await ProjectService.getAllProjects();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching projects" });
    }
}

async function getProjectById(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        const project = await ProjectService.getProjectById(id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error fetching project" });
    }
}

async function updateProject(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, description, status } = req.body;
    try {
        const project = await ProjectService.updateProject(id, { title, description, status });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error updating project" });
    }
}

async function deleteProject(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        await ProjectService.deleteProject(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error deleting project" });
    }
}

async function addMember(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        await ProjectService.addMember(id, userId);
        res.status(200).json({ message: "Member added successfully" });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error adding member" });
    }
}

async function inviteUser(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const project = await ProjectService.getProjectById(id);
        if (!project) { res.status(404).json({ message: "Project not found" }); return; }
        const teacher = req.user!;
        const teacherRecord = await import("../prisma/prisma.js").then(m =>
            m.prisma.user.findUnique({ where: { id: teacher.userId }, select: { firstName: true, lastName: true } })
        );
        const teacherName = teacherRecord ? `${teacherRecord.firstName} ${teacherRecord.lastName}` : "Преподаватель";
        await ProjectService.inviteUser(id, userId, teacherName, project.title);
        res.status(200).json({ message: "Invitation sent" });
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Error sending invitation";
        res.status(msg === "Invitation already sent" ? 409 : 500).json({ message: msg });
    }
}

async function acceptInvitation(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        await ProjectService.acceptInvitation(id, req.user!.userId);
        res.status(200).json({ message: "Invitation accepted" });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error accepting invitation" });
    }
}

async function declineInvitation(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        await ProjectService.declineInvitation(id, req.user!.userId);
        res.status(200).json({ message: "Invitation declined" });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error declining invitation" });
    }
}

async function removeMember(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        await ProjectService.removeMember(id, userId);
        res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error removing member" });
    }
}

async function submitProject(req: Request<{id: string}>, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        await ProjectService.submitProject(id);
        res.status(200).json({ message: "Project submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error submitting project" });
    }
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
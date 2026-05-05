import UserService from "../services/user.service.js";
import type { Request, Response } from "express";

async function searchUser(req: Request, res: Response): Promise<void> {
    const email = req.query.email as string;
    if (!email) {
        res.status(400).json({ message: "Email query parameter is required" });
        return;
    }
    try {
        const user = await UserService.findUserByEmail(email);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error searching for user" });
    }
}

async function listUsers(_req: Request, res: Response): Promise<void> {
    try {
        const users = await UserService.listUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error listing users" });
    }
}

async function deleteUser(req: Request<{ id: string }>, res: Response): Promise<void> {
    const { id } = req.params;
    try {
        await UserService.deleteUser(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Error deleting user" });
    }
}

export default {
    searchUser,
    listUsers,
    deleteUser
};

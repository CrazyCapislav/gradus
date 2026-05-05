import type { Role } from "../generated/prisma/enums.js";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: Role;
            };
        }
    }
}

function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    const token = authHeader.slice("Bearer ".length);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: Role };
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}

export default authenticate;
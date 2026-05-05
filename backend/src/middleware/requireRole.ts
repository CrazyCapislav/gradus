import type { Request, Response, NextFunction } from "express";
import type { Role } from "../generated/prisma/enums.js";

export function requireRole(...roles: Role[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        next();
    };
}

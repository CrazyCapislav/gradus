import bcrypt from "bcryptjs";
import { prisma } from "./prisma/prisma.js";

export async function seedAdmin() {
    const existing = await prisma.user.findUnique({ where: { email: "admin@gradus.app" } });
    if (!existing) {
        const passwordHash = await bcrypt.hash("admin123456", 10);
        await prisma.user.create({
            data: {
                email: "admin@gradus.app",
                passwordHash,
                firstName: "Admin",
                lastName: "Gradus",
                role: "Admin",
                isConfirmedEmail: true
            }
        });
        console.log("Admin account created: admin@gradus.app / admin123456");
    }
}

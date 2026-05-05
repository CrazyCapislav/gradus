import {prisma} from "../prisma/prisma.js";


async function findUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });
}

async function listUsers() {
    return await prisma.user.findMany({
        where: { role: { not: "Admin" } },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
        orderBy: { createdAt: "asc" }
    });
}

async function deleteUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
}

export default {
    findUserByEmail,
    listUsers,
    deleteUser
};

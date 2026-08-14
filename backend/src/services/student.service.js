const prisma = require("../config/prisma");

const getAllStudents = async () => {
    return prisma.student.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            }
        },
        orderBy: {
            id: "desc"
        }
    });
};

const getStudentById = async (id) => {
    return prisma.student.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            }
        }
    });
};

const getStudentByUserId = async (userId) => {
    return prisma.student.findUnique({
        where: {
            userId: Number(userId)
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            }
        }
    });
};

module.exports = {
    getAllStudents,
    getStudentById,
    getStudentByUserId
};
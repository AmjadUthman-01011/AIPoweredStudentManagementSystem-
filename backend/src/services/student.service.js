const prisma = require("../config/prisma");

const getAllStudents = async ({
    page = 1,
    limit = 10,
    firstName,
    lastName,
    email,
    phone
    }) => {

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        limit = 10;
    }

    if (limit > 100) {
        limit = 100;
    }

    const skip = (page - 1) * limit;

    // =========================
    // Build filters
    // =========================

    const where = {};

    if (firstName) {
        where.firstName = {
            contains: firstName.trim()
        };
    }

    if (lastName) {
        where.lastName = {
            contains: lastName.trim()
        };
    }

    if (phone) {
        where.phone = {
            contains: phone.trim()
        };
    }

    // Email belongs to User
    if (email) {
        where.user = {
            email: {
                contains: email.trim()
            }
        };
    }

    // =========================
    // Query
    // =========================

    const [students, total] = await prisma.$transaction([

        prisma.student.findMany({
            where,

            skip,
            take: limit,

            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            },

            orderBy: {
                id: "desc"
            }
        }),

        prisma.student.count({
            where
        })
    ]);

    return {
        students,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
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

const updateStudent = async (id, data) => {

    const studentId = Number(id);

    if (!Number.isInteger(studentId)) {
        throw new Error("Invalid student ID");
    }

    const existingStudent = await prisma.student.findUnique({
        where: {
            id: studentId
        },
        include: {
            user: true
        }
    });

    if (!existingStudent) {
        throw new Error("Student not found");
    }

    // Check email uniqueness
    if (
        data.email !== undefined &&
        data.email !== existingStudent.user.email
    ) {
        const emailExists = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (emailExists) {
            throw new Error("Email already exists");
        }
    }

    const result = await prisma.$transaction(async (tx) => {

        // Update User information
        if (data.email !== undefined) {
            await tx.user.update({
                where: {
                    id: existingStudent.userId
                },
                data: {
                    email: data.email
                }
            });
        }

        // Update Student information
        const student = await tx.student.update({
            where: {
                id: studentId
            },
            data: {

                ...(data.firstName !== undefined && {
                    firstName: data.firstName
                }),

                ...(data.lastName !== undefined && {
                    lastName: data.lastName
                }),

                ...(data.dateOfBirth !== undefined && {
                    dateOfBirth: data.dateOfBirth
                        ? new Date(
                            `${data.dateOfBirth}T00:00:00.000Z`
                        )
                        : null
                }),

                ...(data.phone !== undefined && {
                    phone: data.phone
                }),

                ...(data.address !== undefined && {
                    address: data.address
                })
            },

            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true
                    }
                }
            }
        });

        return student;
    });

    return result;
};

const deleteStudent = async (id) => {

    const studentId = Number(id);

    if (!Number.isInteger(studentId)) {
        throw new Error("Invalid student ID");
    }

    const student = await prisma.student.findUnique({
        where: {
            id: studentId
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    await prisma.user.delete({
        where: {
            id: student.userId
        }
    });

    return true;
};

const searchStudents = async (search) => {

    const keyword = search?.trim();

    if (!keyword) {
        return [];
    }

    return prisma.student.findMany({
        where: {
            OR: [
                {
                    firstName: {
                        contains: keyword
                    }
                },
                {
                    lastName: {
                        contains: keyword
                    }
                },
                {
                    phone: {
                        contains: keyword
                    }
                },
                {
                    user: {
                        email: {
                            contains: keyword
                        }
                    }
                }
            ]
        },

        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true
                }
            }
        },

        orderBy: {
            id: "desc"
        }
    });
};

const getStudentCourses = async (studentId) => {

    const id = Number(studentId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid student ID");
    }

    const student = await prisma.student.findUnique({
        where: {
            id
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    return prisma.enrollment.findMany({
        where: {
            studentId: id
        },
        select: {
            id: true,
            enrolledAt: true,
            status: true,

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    description: true,
                    credits: true,

                    teacher: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        },

        orderBy: {
            enrolledAt: "desc"
        }
    });
};

const getStudentGrades = async (studentId) => {

    const id = Number(studentId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid student ID");
    }

    const student = await prisma.student.findUnique({
        where: {
            id
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    return prisma.grade.findMany({
        where: {
            studentId: id
        },

        select: {
            id: true,
            score: true,
            grade: true,
            semester: true,
            createdAt: true,
            updatedAt: true,

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    credits: true
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }
    });
};

const getStudentAttendance = async (studentId) => {

    const id = Number(studentId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid student ID");
    }

    const student = await prisma.student.findUnique({
        where: {
            id
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    return prisma.attendance.findMany({
        where: {
            studentId: id
        },

        select: {
            id: true,
            date: true,
            status: true,
            createdAt: true,

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true
                }
            }
        },

        orderBy: {
            date: "desc"
        }
    });
};

const getStudentAssignments = async (studentId) => {

    const id = Number(studentId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid student ID");
    }

    const student = await prisma.student.findUnique({
        where: {
            id
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    return prisma.assignment.findMany({
        where: {
            course: {
                enrollments: {
                    some: {
                        studentId: id
                    }
                }
            }
        },

        select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            maxScore: true,
            createdAt: true,

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true
                }
            },

            submissions: {
                where: {
                    studentId: id
                },

                select: {
                    id: true,
                    submittedAt: true,
                    fileUrl: true,
                    score: true,
                    feedback: true
                }
            }
        },

        orderBy: {
            dueDate: "asc"
        }
    });
};

module.exports = {
    getAllStudents,
    getStudentById,
    getStudentByUserId,
    updateStudent,
    deleteStudent,
    searchStudents,
    getStudentCourses,
    getStudentGrades,
    getStudentAttendance,
    getStudentAssignments,
};
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const createTeacher = async (data) => {
    const {
        email,
        password,
        firstName,
        lastName,
        phone,
        department
    } = data;

    if (!email || !password || !firstName || !lastName) {
        throw new Error(
            "Email, password, first name and last name are required"
        );
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {

        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "TEACHER"
            }
        });

        const teacher = await tx.teacher.create({
            data: {
                userId: user.id,
                firstName,
                lastName,
                phone,
                department
            }
        });

        return {
            id: teacher.id,
            userId: user.id,
            email: user.email,
            role: user.role,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            phone: teacher.phone,
            department: teacher.department
        };
    });

    return result;
};

const updateTeacher = async (id, data) => {
    const teacherId = Number(id);

    if (!Number.isInteger(teacherId)) {
        throw new Error("Invalid teacher ID");
    }

    const existingTeacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId
        },
        include: {
            user: true
        }
    });

    if (!existingTeacher) {
        throw new Error("Teacher not found");
    }

    // Check email uniqueness
    if (
        data.email !== undefined &&
        data.email !== existingTeacher.user.email
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

        // Update User
        const user = await tx.user.update({
            where: {
                id: existingTeacher.userId
            },
            data: {
                ...(data.email !== undefined && {
                    email: data.email
                })
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true
            }
        });

        // Update Teacher
        const teacher = await tx.teacher.update({
            where: {
                id: teacherId
            },
            data: {
                ...(data.firstName !== undefined && {
                    firstName: data.firstName
                }),

                ...(data.lastName !== undefined && {
                    lastName: data.lastName
                }),

                ...(data.phone !== undefined && {
                    phone: data.phone
                }),

                ...(data.department !== undefined && {
                    department: data.department
                })
            }
        });

        return {
            ...user,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            phone: teacher.phone,
            department: teacher.department
        };
    });

    return result;
};

const deleteTeacher = async (id) => {
    const teacherId = Number(id);

    if (!Number.isInteger(teacherId)) {
        throw new Error("Invalid teacher ID");
    }

    const teacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId
        },
        include: {
            user: true
        }
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    // Delete the User.
    // Teacher will be deleted automatically because
    // User -> Teacher uses onDelete: Cascade.
    await prisma.user.delete({
        where: {
            id: teacher.userId
        }
    });

    return true;
};

const getTeacherById = async (id) => {
    const teacherId = Number(id);

    if (!Number.isInteger(teacherId)) {
        throw new Error("Invalid teacher ID");
    }

    return prisma.teacher.findUnique({
        where: {
            id: teacherId
        },
        select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            phone: true,
            department: true,
            createdAt: true,
            updatedAt: true,

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
};

const getTeacherByUserId = async (userId) => {
    const id = Number(userId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid user ID");
    }

    return prisma.teacher.findUnique({
        where: {
            userId: id
        },
        select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            phone: true,
            department: true,
            createdAt: true,
            updatedAt: true,

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
};

const searchTeachers = async (search) => {
    const keyword = search?.trim();

    if (!keyword) {
        return [];
    }

    return prisma.teacher.findMany({
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
                    department: {
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

        select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            phone: true,
            department: true,
            createdAt: true,

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

const assignTeacherToCourse = async (teacherId, courseId) => {
    const teacherIdNumber = Number(teacherId);
    const courseIdNumber = Number(courseId);

    if (
        !Number.isInteger(teacherIdNumber) ||
        !Number.isInteger(courseIdNumber)
    ) {
        throw new Error("Invalid teacher ID or course ID");
    }

    // Check teacher
    const teacher = await prisma.teacher.findUnique({
        where: {
            id: teacherIdNumber
        }
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    // Check course
    const course = await prisma.course.findUnique({
        where: {
            id: courseIdNumber
        }
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Assign teacher
    const updatedCourse = await prisma.course.update({
        where: {
            id: courseIdNumber
        },
        data: {
            teacherId: teacherIdNumber
        },
        select: {
            id: true,
            code: true,
            name: true,
            description: true,
            credits: true,
            teacherId: true,

            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    department: true
                }
            }
        }
    });

    return updatedCourse;
};

const getTeacherCourses = async (teacherId) => {
    const id = Number(teacherId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid teacher ID");
    }

    const teacher = await prisma.teacher.findUnique({
        where: {
            id
        }
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    return prisma.course.findMany({
        where: {
            teacherId: id
        },
        select: {
            id: true,
            code: true,
            name: true,
            description: true,
            credits: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            id: "desc"
        }
    });
};

const getMyCourses = async (userId) => {
    const id = Number(userId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid user ID");
    }

    const teacher = await prisma.teacher.findUnique({
        where: {
            userId: id
        }
    });

    if (!teacher) {
        throw new Error("Teacher profile not found");
    }

    return prisma.course.findMany({
        where: {
            teacherId: teacher.id
        },
        select: {
            id: true,
            code: true,
            name: true,
            description: true,
            credits: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            id: "desc"
        }
    });
};

const getTeacherStudents = async (teacherId) => {
    const id = Number(teacherId);

    if (!Number.isInteger(id)) {
        throw new Error("Invalid teacher ID");
    }

    // Check teacher exists
    const teacher = await prisma.teacher.findUnique({
        where: {
            id
        }
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    const students = await prisma.student.findMany({
        where: {
            enrollments: {
                some: {
                    course: {
                        teacherId: id
                    }
                }
            }
        },

        select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            phone: true,

            user: {
                select: {
                    email: true,
                    isActive: true
                }
            },

            enrollments: {
                where: {
                    course: {
                        teacherId: id
                    }
                },
                select: {
                    id: true,
                    status: true,
                    enrolledAt: true,

                    course: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    }
                }
            }
        },

        orderBy: {
            id: "desc"
        }
    });

    return students;
};

module.exports = {
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherById,
    searchTeachers,
    assignTeacherToCourse,
    getTeacherCourses,
    getMyCourses,
    getTeacherStudents
};
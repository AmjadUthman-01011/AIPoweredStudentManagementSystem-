const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs")

const getAllUsers = async ({ page = 1, limit = 10 }) => {

    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            skip,
            take: limit,

            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,

                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },

                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            },

            orderBy: {
                id: "desc"
            }
        }),

        prisma.user.count()
    ]);

    return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

const getUserById = async (id) => {
    return prisma.user.findUnique({
        where: {
            id: Number(id)
        },

        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,

            student: {
                select: {
                    id: true,
                    studentCode: true,
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    phone: true,
                    address: true
                }
            },

            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }
        }
    });
};


const createUser = async (data) => {

    // Validate role
    if (!["STUDENT", "TEACHER"].includes(data.role)) {
        throw new Error("Invalid role");
    }
    const {email, password, role, isActive} = data;
    // Check existing email
    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User + Student/Teacher atomically
    const result = await prisma.$transaction(async (tx) => {

        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                isActive: true
            }
        });

        let profile;

        if (role === "STUDENT") {

            profile = await tx.student.create({
                data: {
                    userId: user.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    dateOfBirth: data.dob
                        ? new Date(`${data.dob}T00:00:00.000Z`)
                        : null,
                    phone: data.phone || null,
                    address: data.address || null
                }
            });

        } else if (role === "TEACHER") {

            profile = await tx.teacher.create({
                data: {
                    userId: user.id,
                    firstName:data.firstName,
                    lastName:data.lastName,
                    phone: data.phone || null,
                    department: data.department
                }
            });
        }

        return {
            user,
            profile
        };
    });

    return {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        isActive: result.user.isActive,
        profile: result.profile
    };
};

const updateUser = async (id, data) => {
    

    const userId = Number(id);

    if (!Number.isInteger(userId)) {
        throw new Error("Invalid user ID");
    }

    // Find user
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            student: true,
            teacher: true
        }
    });
    //console.log( existingUser);
    //return;

    if (!existingUser) {
        throw new Error("User not found");
    }

    // Check email uniqueness
    if (data.email && data.email !== existingUser.email) {

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
                id: userId
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

        // =========================
        // STUDENT
        // =========================

        if (existingUser.role === "STUDENT") {

            if (!existingUser.student) {
                throw new Error("Student profile not found");
            }

            await tx.student.update({
                where: {
                    userId: userId
                },
                data: {
                    ...(data.firstName !== undefined && {
                        firstName: data.firstName
                    }),

                    ...(data.lastName !== undefined && {
                        lastName: data.lastName
                    }),

                    ...(data.dob !== undefined && {
                        dateOfBirth: data.dob
                            ? new Date(`${data.dob}T00:00:00.000Z`)
                            : null
                    }),

                    ...(data.phone !== undefined && {
                        phone: data.phone
                    }),

                    ...(data.address !== undefined && {
                        address: data.address
                    })
                }
            });
        }

        // =========================
        // TEACHER
        // =========================

        if (existingUser.role === "TEACHER") {

            if (!existingUser.teacher) {
                throw new Error("Teacher profile not found");
            }

            await tx.teacher.update({
                where: {
                    userId: userId
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
                    }),
                }
            });
        }

        return user;
    });

    return result;
};

const deleteUser = async (id) => {

    const userId = Number(id);

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Delete user
    await prisma.user.delete({
        where: {
            id: userId
        }
    });

    return true;
};

const searchUsers = async (search) => {

    const keyword = search?.trim();

    if (!keyword) {
        return [];
    }

    return prisma.user.findMany({
        where: {
            OR: [
                {
                    email: {
                        contains: keyword
                    }
                },
                {
                    student: {
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
                            }
                        ]
                    }
                },
                {
                    teacher: {
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
                            }
                        ]
                    }
                }
            ]
        },

        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,

            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },

            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                }
            }
        },

        orderBy: {
            id: "desc"
        }
    });
};

const getUsersByRole = async (role) => {

    const validRoles = ["TEACHER", "STUDENT"];

    if (!validRoles.includes(role)) {
        throw new Error("Invalid role");
    }

    return prisma.user.findMany({
        where: {
            role: role
        },

        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,

            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },

            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                }
            }
        },

        orderBy: {
            id: "desc"
        }
    });
};

const updateUserStatus = async (id, isActive) => {

    const userId = Number(id);

    if (!Number.isInteger(userId)) {
        throw new Error("Invalid user ID");
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!existingUser) {
        throw new Error("User not found");
    }

    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            isActive
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            updatedAt: true
        }
    });

    return user;
};

const updatePassword = async (id, currentPassword, newPassword) => {

    const userId = Number(id);

    if (!Number.isInteger(userId)) {
        throw new Error("Invalid user ID");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!passwordMatch) {
        throw new Error("Current password is incorrect");
    }

    // Prevent same password
    const samePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (samePassword) {
        throw new Error(
            "New password must be different from current password"
        );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
        newPassword,
        12
    );

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: hashedPassword
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            updatedAt: true
        }
    });

    return updatedUser;
};

const updateUserRole = async (id, newRole) => {

    const userId = Number(id);

    if (!Number.isInteger(userId)) {
        throw new Error("Invalid user ID");
    }

    const validRoles = [
        "TEACHER",
        "STUDENT"
    ];

    if (!validRoles.includes(newRole)) {
        throw new Error("Invalid role");
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            student: true,
            teacher: true
        }
    });

    if (!existingUser) {
        throw new Error("User not found");
    }

    // Nothing to change
    if (existingUser.role === newRole) {
        throw new Error("User already has this role");
    }

    const result = await prisma.$transaction(async (tx) => {

        // =====================================
        // STUDENT → TEACHER
        // =====================================

        if (
            existingUser.role === "STUDENT" &&
            newRole === "TEACHER"
        ) {

            // Delete Student profile
            if (existingUser.student) {
                await tx.student.delete({
                    where: {
                        userId: userId
                    }
                });
            }

            // Create Teacher profile
            await tx.teacher.create({
                data: {
                    userId: userId,
                    firstName: existingUser.student?.firstName || "",
                    lastName: existingUser.student?.lastName || "",
                    phone: existingUser.student?.phone,
                    department: existingUser.student?.department
                }
            });
        }

        // =====================================
        // TEACHER → STUDENT
        // =====================================

        if (
            existingUser.role === "TEACHER" &&
            newRole === "STUDENT"
        ) {

            // Delete Teacher profile
            if (existingUser.teacher) {
                await tx.teacher.delete({
                    where: {
                        userId: userId
                    }
                });
            }

            // Create Student profile
            await tx.student.create({
                data: {
                    userId: userId,
                    firstName: existingUser.teacher?.firstName || "",
                    lastName: existingUser.teacher?.lastName || "",
                    phone: existingUser.teacher?.phone,
                    address: existingUser.teacher?.address
                }
            });
        }

        // =====================================
        // UPDATE ROLE
        // =====================================

        const user = await tx.user.update({
            where: {
                id: userId
            },
            data: {
                role: newRole
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true
            }
        });

        return user;
    });

    return result;
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser, 
    searchUsers,
    getUsersByRole,
    updateUserStatus,
    updatePassword,
    updateUserRole
};
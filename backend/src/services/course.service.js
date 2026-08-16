const prisma = require("../config/prisma");

const getAllCourses = async ({
    page = 1,
    limit = 10,
    search,
    teacherId,
    credits
}) => {

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        limit = 10;
    }

    // Prevent extremely large requests
    if (limit > 100) {
        limit = 100;
    }

    const skip = (page - 1) * limit;

    const where = {};

    // =========================
    // SEARCH
    // =========================

    if (search && search.trim()) {

        const keyword = search.trim();

        where.OR = [
            {
                code: {
                    contains: keyword
                }
            },
            {
                name: {
                    contains: keyword
                }
            },
            {
                description: {
                    contains: keyword
                }
            }
        ];
    }

    // =========================
    // FILTER BY TEACHER
    // =========================

    if (teacherId !== undefined) {

        const id = Number(teacherId);

        if (!Number.isInteger(id)) {
            throw new Error("Invalid teacher ID");
        }

        where.teacherId = id;
    }

    // =========================
    // FILTER BY CREDITS
    // =========================

    if (credits !== undefined) {

        const courseCredits = Number(credits);

        if (!Number.isInteger(courseCredits)) {
            throw new Error("Invalid credits value");
        }

        where.credits = courseCredits;
    }

    // =========================
    // GET COURSES + TOTAL
    // =========================

    const [courses, total] = await prisma.$transaction([
        prisma.course.findMany({
            where,

            skip,
            take: limit,

            select: {
                id: true,
                code: true,
                name: true,
                description: true,
                credits: true,
                teacherId: true,
                createdAt: true,
                updatedAt: true,

                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,

                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                },

                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                        grades: true,
                        attendances: true
                    }
                }
            },

            orderBy: {
                id: "desc"
            }
        }),

        prisma.course.count({
            where
        })
    ]);

    return {
        courses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

const getCourseById = async (id) => {
    const courseId = Number(id);

    if (!Number.isInteger(courseId)) {
        throw new Error("Invalid course ID");
    }

    const course = await prisma.course.findUnique({
        where: {
            id: courseId
        },

        select: {
            id: true,
            code: true,
            name: true,
            description: true,
            credits: true,
            teacherId: true,
            createdAt: true,
            updatedAt: true,

            // Teacher
            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,

                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            },

            // Enrolled students
            enrollments: {
                select: {
                    id: true,
                    status: true,
                    enrolledAt: true,

                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,

                            user: {
                                select: {
                                    email: true,
                                    isActive: true
                                }
                            }
                        }
                    }
                },

                orderBy: {
                    id: "desc"
                }
            },

            // Statistics
            _count: {
                select: {
                    enrollments: true,
                    assignments: true,
                    grades: true,
                    attendances: true
                }
            }
        }
    });

    return course;
};

const createCourse = async (data) => {

    const {
        code,
        name,
        description,
        credits,
        teacherId
    } = data;

    // Validate required fields
    if (!code || !name || !teacherId) {
        throw new Error(
            "Code, name and teacherId are required"
        );
    }

    const teacher = await prisma.teacher.findUnique({
        where: {
            id: Number(teacherId)
        }
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    // Check course code
    const existingCourse = await prisma.course.findUnique({
        where: {
            code
        }
    });

    if (existingCourse) {
        throw new Error("Course code already exists");
    }

    const course = await prisma.course.create({
        data: {
            code,
            name,
            description: description || null,
            credits: credits !== undefined
                ? Number(credits)
                : 3,
            teacherId: Number(teacherId)
        },

        include: {
            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }
        }
    });

    return course;
};

const updateCourse = async (id, data) => {
    const courseId = Number(id);

    if (!Number.isInteger(courseId)) {
        throw new Error("Invalid course ID");
    }

    // Check course exists
    const existingCourse = await prisma.course.findUnique({
        where: {
            id: courseId
        }
    });

    if (!existingCourse) {
        throw new Error("Course not found");
    }

    // Check course code uniqueness
    if (
        data.code !== undefined &&
        data.code !== existingCourse.code
    ) {
        const existingCode = await prisma.course.findUnique({
            where: {
                code: data.code
            }
        });

        if (existingCode) {
            throw new Error("Course code already exists");
        }
    }

    // Check teacher if teacherId is being changed
    if (data.teacherId !== undefined) {

        const teacherId = Number(data.teacherId);

        if (!Number.isInteger(teacherId)) {
            throw new Error("Invalid teacher ID");
        }

        const teacher = await prisma.teacher.findUnique({
            where: {
                id: teacherId
            }
        });

        if (!teacher) {
            throw new Error("Teacher not found");
        }
    }

    const course = await prisma.course.update({
        where: {
            id: courseId
        },

        data: {
            ...(data.code !== undefined && {
                code: data.code
            }),

            ...(data.name !== undefined && {
                name: data.name
            }),

            ...(data.description !== undefined && {
                description: data.description
            }),

            ...(data.credits !== undefined && {
                credits: Number(data.credits)
            }),

            ...(data.teacherId !== undefined && {
                teacherId: Number(data.teacherId)
            })
        },

        select: {
            id: true,
            code: true,
            name: true,
            description: true,
            credits: true,
            teacherId: true,
            createdAt: true,
            updatedAt: true,

            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,

                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            }
        }
    });

    return course;
};

const deleteCourse = async (id) => {

    const courseId = Number(id);

    if (!Number.isInteger(courseId)) {
        throw new Error("Invalid course ID");
    }

    // Check course exists
    const course = await prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            id: true,
            code: true,
            name: true
        }
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Delete course
    await prisma.course.delete({
        where: {
            id: courseId
        }
    });

    return course;
};

const assignTeacher = async (courseId, teacherId) => {
    courseId = Number(courseId);
    teacherId = Number(teacherId);

    if (!Number.isInteger(courseId)) {
        throw new Error("Invalid course ID");
    }

    if (!Number.isInteger(teacherId)) {
        throw new Error("Invalid teacher ID");
    }

    // Check course
    const course = await prisma.course.findUnique({
        where: {
            id: courseId
        }
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Check teacher
    const teacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId
        }
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    // Assign teacher
    const updatedCourse = await prisma.course.update({
        where: {
            id: courseId
        },

        data: {
            teacherId
        },

        select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            teacherId: true,

            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,

                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            }
        }
    });

    return updatedCourse;
};

const getCourseStudents = async (courseId) => {

    courseId = Number(courseId);

    if (!Number.isInteger(courseId)) {
        throw new Error("Invalid course ID");
    }

    // Check course exists
    const course = await prisma.course.findUnique({
        where: {
            id: courseId
        },
        select: {
            id: true,
            code: true,
            name: true
        }
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const enrollments = await prisma.enrollment.findMany({
        where: {
            courseId
        },

        select: {
            id: true,
            status: true,
            enrolledAt: true,

            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,

                    user: {
                        select: {
                            id: true,
                            email: true,
                            isActive: true
                        }
                    }
                }
            }
        },

        orderBy: {
            id: "desc"
        }
    });

    return {
        course,
        count: enrollments.length,
        students: enrollments
    };
};

const enrollStudent = async (courseId, studentId) => {

    courseId = Number(courseId);
    studentId = Number(studentId);

    if (!Number.isInteger(courseId)) {
        throw new Error("Invalid course ID");
    }

    if (!Number.isInteger(studentId)) {
        throw new Error("Invalid student ID");
    }

    // Check course
    const course = await prisma.course.findUnique({
        where: {
            id: courseId
        }
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Check student
    const student = await prisma.student.findUnique({
        where: {
            id: studentId
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    // Check existing enrollment
    const existingEnrollment =
        await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

    if (existingEnrollment) {
        throw new Error("Student is already enrolled in this course");
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            studentId,
            courseId,
            status: "ACTIVE"
        },

        select: {
            id: true,
            enrolledAt: true,
            status: true,

            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },

            course: {
                select: {
                    id: true,
                    code: true,
                    name: true
                }
            }
        }
    });

    return enrollment;
};

const removeStudent = async (courseId, studentId) => {

    courseId = Number(courseId);
    studentId = Number(studentId);

    if (!Number.isInteger(courseId)) {
        throw new Error("Invalid course ID");
    }

    if (!Number.isInteger(studentId)) {
        throw new Error("Invalid student ID");
    }

    const enrollment =
        await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });

    if (!enrollment) {
        throw new Error(
            "Student is not enrolled in this course"
        );
    }

    await prisma.enrollment.delete({
        where: {
            studentId_courseId: {
                studentId,
                courseId
            }
        }
    });

    return true;
};


module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    assignTeacher,
    getCourseStudents,
    enrollStudent,
    removeStudent
}
const prisma = require("../config/prisma");

// =====================================================
// VALIDATE ATTENDANCE
// =====================================================

const validateAttendance = ({ studentId, courseId, date, status }) => {

    if (!studentId) {
        throw new Error("Student ID is required");
    }

    if (!courseId) {
        throw new Error("Course ID is required");
    }

    if (!date) {
        throw new Error("Attendance date is required");
    }

    const validStatuses = [
        "PRESENT",
        "ABSENT",
        "LATE",
        "EXCUSED"
    ];

    if (!validStatuses.includes(status)) {
        throw new Error("Invalid attendance status");
    }

    const attendanceDate = new Date(date);

    if (Number.isNaN(attendanceDate.getTime())) {
        throw new Error("Invalid attendance date");
    }

    return true;
};


// =====================================================
// CHECK TEACHER COURSE AUTHORIZATION
// =====================================================

const authorizeTeacherCourse = async (userId, courseId) => {

    const teacher = await prisma.teacher.findUnique({
        where: {
            userId: Number(userId)
        }
    });

    if (!teacher) {
        throw new Error("Teacher profile not found");
    }

    const course = await prisma.course.findFirst({
        where: {
            id: Number(courseId),
            teacherId: teacher.id
        }
    });

    if (!course) {
        throw new Error(
            "You are not authorized to manage attendance for this course"
        );
    }

    return course;
};


// =====================================================
// CREATE ATTENDANCE
// =====================================================

const createAttendance = async (data, user) => {

    const {
        studentId,
        courseId,
        date,
        status
    } = data;

    validateAttendance(data);

    const student = await prisma.student.findUnique({
        where: {
            id: Number(studentId)
        }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    const course = await prisma.course.findUnique({
        where: {
            id: Number(courseId)
        }
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Teacher can only manage their own course
    if (user.role === "TEACHER") {
        await authorizeTeacherCourse(
            user.userId,
            courseId
        );
    }

    // Student must be enrolled
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseId: {
                studentId: Number(studentId),
                courseId: Number(courseId)
            }
        }
    });

    if (!enrollment) {
        throw new Error(
            "Student is not enrolled in this course"
        );
    }

    const attendanceDate = new Date(date);

    // Normalize date to the beginning of the day
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Check duplicate attendance
    const existingAttendance =
        await prisma.attendance.findUnique({
            where: {
                studentId_courseId_date: {
                    studentId: Number(studentId),
                    courseId: Number(courseId),
                    date: attendanceDate
                }
            }
        });

    if (existingAttendance) {
        throw new Error(
            "Attendance already exists for this student on this date"
        );
    }

    return prisma.attendance.create({
        data: {
            studentId: Number(studentId),
            courseId: Number(courseId),
            date: attendanceDate,
            status
        },

        include: {
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
};


// =====================================================
// GET ALL ATTENDANCE
// =====================================================

const getAllAttendance = async ({
    page = 1,
    limit = 10,
    studentId,
    courseId,
    status,
    date
} = {}) => {

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

    const where = {};

    if (studentId) {
        where.studentId = Number(studentId);
    }

    if (courseId) {
        where.courseId = Number(courseId);
    }

    if (status) {
        where.status = status;
    }

    if (date) {

        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setUTCDate(
            endDate.getUTCDate() + 1
        );

        where.date = {
            gte: startDate,
            lt: endDate
        };
    }

    const [attendance, total] =
        await prisma.$transaction([

            prisma.attendance.findMany({
                where,

                skip,
                take: limit,

                select: {
                    id: true,
                    studentId: true,
                    courseId: true,
                    date: true,
                    status: true,
                    createdAt: true,

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
                },

                orderBy: {
                    date: "desc"
                }
            }),

            prisma.attendance.count({
                where
            })
        ]);

    return {
        attendance,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};


// =====================================================
// GET ATTENDANCE BY ID
// =====================================================

const getAttendanceById = async (id) => {

    const attendanceId = Number(id);

    if (!Number.isInteger(attendanceId)) {
        throw new Error("Invalid attendance ID");
    }

    return prisma.attendance.findUnique({
        where: {
            id: attendanceId
        },

        include: {
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
                    name: true,
                    teacherId: true
                }
            }
        }
    });
};


// =====================================================
// GET STUDENT ATTENDANCE
// =====================================================

const getStudentAttendance = async (
    studentId,
    {
        page = 1,
        limit = 10,
        courseId,
        status
    } = {}
) => {

    return getAllAttendance({
        page,
        limit,
        studentId,
        courseId,
        status
    });
};


// =====================================================
// GET COURSE ATTENDANCE
// =====================================================

const getCourseAttendance = async (
    courseId,
    {
        page = 1,
        limit = 10,
        studentId,
        status,
        date
    } = {}
) => {

    return getAllAttendance({
        page,
        limit,
        courseId,
        studentId,
        status,
        date
    });
};


// =====================================================
// GET MY ATTENDANCE
// =====================================================

const getMyAttendance = async (
    userId,
    options = {}
) => {

    const student = await prisma.student.findUnique({
        where: {
            userId: Number(userId)
        }
    });

    if (!student) {
        throw new Error("Student profile not found");
    }

    return getStudentAttendance(
        student.id,
        options
    );
};


// =====================================================
// UPDATE ATTENDANCE
// =====================================================

const updateAttendance = async (
    id,
    data,
    user
) => {

    const attendanceId = Number(id);

    if (!Number.isInteger(attendanceId)) {
        throw new Error("Invalid attendance ID");
    }

    const existingAttendance =
        await prisma.attendance.findUnique({
            where: {
                id: attendanceId
            }
        });

    if (!existingAttendance) {
        throw new Error("Attendance not found");
    }

    if (user.role === "TEACHER") {

        await authorizeTeacherCourse(
            user.userId,
            existingAttendance.courseId
        );
    }

    if (data.status !== undefined) {

        const validStatuses = [
            "PRESENT",
            "ABSENT",
            "LATE",
            "EXCUSED"
        ];

        if (!validStatuses.includes(data.status)) {
            throw new Error(
                "Invalid attendance status"
            );
        }
    }

    return prisma.attendance.update({
        where: {
            id: attendanceId
        },

        data: {
            ...(data.status !== undefined && {
                status: data.status
            })
        },

        include: {
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
};


// =====================================================
// DELETE ATTENDANCE
// =====================================================

const deleteAttendance = async (id, user) => {

    const attendanceId = Number(id);

    if (!Number.isInteger(attendanceId)) {
        throw new Error("Invalid attendance ID");
    }

    const existingAttendance =
        await prisma.attendance.findUnique({
            where: {
                id: attendanceId
            }
        });

    if (!existingAttendance) {
        throw new Error("Attendance not found");
    }

    if (user.role === "TEACHER") {

        await authorizeTeacherCourse(
            user.userId,
            existingAttendance.courseId
        );
    }

    await prisma.attendance.delete({
        where: {
            id: attendanceId
        }
    });

    return true;
};


// =====================================================
// BULK ATTENDANCE
// =====================================================

const createBulkAttendance = async (
    {
        courseId,
        date,
        records
    },
    user
) => {

    if (!courseId) {
        throw new Error("Course ID is required");
    }

    if (!date) {
        throw new Error("Attendance date is required");
    }

    if (!Array.isArray(records) || records.length === 0) {
        throw new Error(
            "Attendance records are required"
        );
    }

    if (user.role === "TEACHER") {

        await authorizeTeacherCourse(
            user.userId,
            courseId
        );
    }

    const course = await prisma.course.findUnique({
        where: {
            id: Number(courseId)
        }
    });

    if (!course) {
        throw new Error("Course not found");
    }

    const attendanceDate = new Date(date);

    if (Number.isNaN(attendanceDate.getTime())) {
        throw new Error("Invalid attendance date");
    }

    attendanceDate.setUTCHours(0, 0, 0, 0);

    const studentIds = records.map(
        record => Number(record.studentId)
    );

    const students = await prisma.student.findMany({
        where: {
            id: {
                in: studentIds
            }
        },

        select: {
            id: true
        }
    });

    if (students.length !== studentIds.length) {
        throw new Error(
            "One or more students were not found"
        );
    }

    const enrollments =
        await prisma.enrollment.findMany({
            where: {
                courseId: Number(courseId),
                studentId: {
                    in: studentIds
                }
            },

            select: {
                studentId: true
            }
        });

    const enrolledIds = new Set(
        enrollments.map(
            enrollment => enrollment.studentId
        )
    );

    for (const record of records) {

        if (!enrolledIds.has(
            Number(record.studentId)
        )) {
            throw new Error(
                `Student ${record.studentId} is not enrolled in this course`
            );
        }

        const validStatuses = [
            "PRESENT",
            "ABSENT",
            "LATE",
            "EXCUSED"
        ];

        if (!validStatuses.includes(record.status)) {
            throw new Error(
                `Invalid attendance status for student ${record.studentId}`
            );
        }
    }

    const existing =
        await prisma.attendance.findMany({
            where: {
                courseId: Number(courseId),
                date: attendanceDate,
                studentId: {
                    in: studentIds
                }
            },

            select: {
                studentId: true
            }
        });

    if (existing.length > 0) {
        throw new Error(
            "Attendance already exists for one or more students on this date"
        );
    }

    return prisma.$transaction(
        records.map(record =>
            prisma.attendance.create({
                data: {
                    studentId: Number(record.studentId),
                    courseId: Number(courseId),
                    date: attendanceDate,
                    status: record.status
                }
            })
        )
    );
};


// =====================================================
// ATTENDANCE PERCENTAGE
// =====================================================

const getAttendancePercentage = async (
    studentId,
    courseId
) => {

    const where = {
        studentId: Number(studentId)
    };

    if (courseId) {
        where.courseId = Number(courseId);
    }

    const records = await prisma.attendance.findMany({
        where,

        select: {
            status: true
        }
    });

    if (records.length === 0) {
        return {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            percentage: 0
        };
    }

    const present = records.filter(
        record => record.status === "PRESENT"
    ).length;

    const late = records.filter(
        record => record.status === "LATE"
    ).length;

    const absent = records.filter(
        record => record.status === "ABSENT"
    ).length;

    const excused = records.filter(
        record => record.status === "EXCUSED"
    ).length;

    // PRESENT + LATE are counted as attended.
    const attended = present + late;

    const percentage =
        (attended / records.length) * 100;

    return {
        total: records.length,
        present,
        absent,
        late,
        excused,
        percentage: Number(
            percentage.toFixed(2)
        )
    };
};


// =====================================================
// SEARCH ATTENDANCE
// =====================================================

const searchAttendance = async (
    search,
    {
        page = 1,
        limit = 10
    } = {}
) => {

    const keyword = search?.trim();

    if (!keyword) {
        return {
            attendance: [],
            total: 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: 0
        };
    }

    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const where = {
        OR: [
            {
                student: {
                    firstName: {
                        contains: keyword
                    }
                }
            },
            {
                student: {
                    lastName: {
                        contains: keyword
                    }
                }
            },
            {
                course: {
                    code: {
                        contains: keyword
                    }
                }
            },
            {
                course: {
                    name: {
                        contains: keyword
                    }
                }
            },
            {
                status: {
                    contains: keyword
                }
            }
        ]
    };

    const [attendance, total] =
        await prisma.$transaction([

            prisma.attendance.findMany({
                where,
                skip,
                take: limit,

                include: {
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
                },

                orderBy: {
                    date: "desc"
                }
            }),

            prisma.attendance.count({
                where
            })
        ]);

    return {
        attendance,
        total,
        page,
        limit,
        totalPages: Math.ceil(
            total / limit
        )
    };
};


module.exports = {
    validateAttendance,
    authorizeTeacherCourse,
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    getStudentAttendance,
    getCourseAttendance,
    getMyAttendance,
    updateAttendance,
    deleteAttendance,
    createBulkAttendance,
    getAttendancePercentage,
    searchAttendance
};
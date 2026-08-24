const { z } = require("zod");

const idParamSchema = z.object({
    id: z.coerce.number().int().positive()
});

const getUsersQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
});

const searchUsersQuerySchema = z.object({
    q: z.string().trim().min(1, "Search query is required")
});

const getUsersByRoleQuerySchema = z.object({
    role: z.enum(["TEACHER", "STUDENT"], {
        errorMap: () => ({ message: "Invalid role. Use TEACHER or STUDENT" })
    })
});

const updateUserStatusBodySchema = z.object({
    isActive: z.boolean()
});

const updatePasswordBodySchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8)
});

const updateUserRoleBodySchema = z.object({
    role: z.enum(["TEACHER", "STUDENT"], {
        errorMap: () => ({ message: "Invalid role. Use TEACHER or STUDENT" })
    })
});

const baseUserFields = {
    email: z.string().email(),
    password: z.string().min(8),
    isActive: z.boolean().optional().default(true)
};

const studentSchema = z.object({
    ...baseUserFields,
    role: z.literal("STUDENT"),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dob must be in YYYY-MM-DD format").optional(),
    phone: z.string().min(6).optional(),
    address: z.string().min(1).optional()
});

const teacherSchema = z.object({
    ...baseUserFields,
    role: z.literal("TEACHER"),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(6).optional(),
    department: z.string().min(1)
});

const adminSchema = z.object({
    ...baseUserFields,
    role: z.literal("ADMIN")
});

const createUserBodySchema = z.discriminatedUnion("role", [
    studentSchema,
    teacherSchema,
    adminSchema
]);

const updateUserBodySchema = z.object({
    email: z.string().email().optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dob must be in YYYY-MM-DD format").nullable().optional(),
    phone: z.string().min(6).nullable().optional(),
    address: z.string().min(1).nullable().optional(),
    department: z.string().min(1).optional()
})
.strict()
.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
});


module.exports = {
    idParamSchema,
    getUsersQuerySchema,
    searchUsersQuerySchema,
    getUsersByRoleQuerySchema,
    updateUserStatusBodySchema,
    updatePasswordBodySchema,
    updateUserRoleBodySchema,
    createUserBodySchema,
    updateUserBodySchema
};
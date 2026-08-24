const { z } = require("zod");

const schemas = {
    Register: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        dob: z.coerce.date(),
        phone: z.string().min(6).optional(),
        address: z.string().optional()
    }),
    Login: z.object({
        email: z.string().email(),
        password: z.string().min(1)
    })
};

const validator = (data, scope) => {
    const schema = schemas[scope];

    if (!schema) {
        throw new Error(`Unknown validation scope: ${scope}`);
    }

    return schema.safeParse(data);
};

module.exports = validator;
const prisma = require("../config/prisma");

const testDatabase = async (req, res, next) => {
    try {
        const user = await prisma.user.create({
            data: {
                email: "test@example2.com",
                password: "temporary-password1",
                role: "STUDENT"
            }
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    testDatabase
};
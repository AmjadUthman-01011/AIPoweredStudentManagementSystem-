const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const createAdmin = async () => {
    try {
        const email = "admin@example.com";
        const password = "Admin@123";

        const existingAdmin = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "ADMIN",
                isActive: true
            }
        });

        console.log("Admin created successfully");
        console.log({
            id: admin.id,
            email: admin.email,
            role: admin.role
        });

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
};

createAdmin();
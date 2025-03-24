import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    try {
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const admin = await prisma.user.upsert({
            where: { email: 'admin@school.com' },
            update: {},
            create: {
                email: 'admin@school.com',
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        console.log('Admin user created:', admin);
    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 
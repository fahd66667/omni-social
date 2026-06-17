import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Attempting to connect to database...");
  
  try {
    // Try to create a dummy user
    const newUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Database Test User',
      },
    });

    console.log("Successfully connected and created user:", newUser);
  } catch (e) {
    console.error("Connection failed! Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
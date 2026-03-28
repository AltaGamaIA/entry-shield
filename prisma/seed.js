const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { staffId: 'ES-001-001' },
    update: {},
    create: {
      name: 'Administrador Principal',
      email: 'admin@entryshield.com',
      staffId: 'ES-001-001',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  
  console.log('Seeded admin user:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { id: 'test-user-123' },
    update: {},
    create: {
      id: 'test-user-123',
      email: 'test@kittypup.app',
    },
  });

  console.log('✅ Created test user:', testUser.id);

  // Create entitlement for test user
  const entitlement = await prisma.entitlement.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      tier: 'free',
      creditsRemaining: 3, // Give 3 free credits for testing
      activeSubscription: false,
    },
  });

  console.log('✅ Created entitlement with', entitlement.creditsRemaining, 'credits');

  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Test user credentials:');
  console.log('  User ID:', testUser.id);
  console.log('  Email:', testUser.email);
  console.log('');
  console.log('Use this header for API requests:');
  console.log('  x-user-id: test-user-123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


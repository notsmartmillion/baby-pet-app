import { prisma } from '../db';
import { Entitlement, SubscriptionTier } from '@kittypup/types';

export const getUserEntitlement = async (userId: string): Promise<Entitlement> => {
  let entitlement = await prisma.entitlement.findUnique({
    where: { userId },
  });

  // Create default entitlement for new users
  if (!entitlement) {
    entitlement = await prisma.entitlement.create({
      data: {
        userId,
        tier: 'free',
        creditsRemaining: 1, // 1 free watermarked image
        activeSubscription: false,
      },
    });
  }

  // Check if subscription has expired
  const now = new Date();
  if (entitlement.unlimitedUntil && new Date(entitlement.unlimitedUntil) < now) {
    entitlement = await prisma.entitlement.update({
      where: { userId },
      data: {
        activeSubscription: false,
        tier: 'free',
      },
    });
  }

  return {
    userId: entitlement.userId,
    tier: entitlement.tier as SubscriptionTier,
    creditsRemaining: entitlement.creditsRemaining,
    unlimitedUntil: entitlement.unlimitedUntil,
    activeSubscription: entitlement.activeSubscription,
  };
};

export const consumeCredit = async (userId: string, jobId: string) => {
  const entitlement = await getUserEntitlement(userId);

  if (entitlement.creditsRemaining <= 0 && !entitlement.activeSubscription) {
    throw new Error('No credits remaining');
  }

  // Don't decrement if subscription is active
  if (entitlement.activeSubscription) {
    return entitlement;
  }

  await prisma.entitlement.update({
    where: { userId },
    data: {
      creditsRemaining: {
        decrement: 1,
      },
    },
  });

  return getUserEntitlement(userId);
};

export const grantCredits = async (userId: string, amount: number) => {
  await prisma.entitlement.upsert({
    where: { userId },
    create: {
      userId,
      tier: 'free',
      creditsRemaining: amount,
      activeSubscription: false,
    },
    update: {
      creditsRemaining: {
        increment: amount,
      },
    },
  });

  return getUserEntitlement(userId);
};

export const activateSubscription = async (userId: string, durationDays: number) => {
  const unlimitedUntil = new Date();
  unlimitedUntil.setDate(unlimitedUntil.getDate() + durationDays);

  await prisma.entitlement.upsert({
    where: { userId },
    create: {
      userId,
      tier: 'monthly',
      creditsRemaining: 0,
      unlimitedUntil,
      activeSubscription: true,
    },
    update: {
      tier: 'monthly',
      unlimitedUntil,
      activeSubscription: true,
    },
  });

  return getUserEntitlement(userId);
};


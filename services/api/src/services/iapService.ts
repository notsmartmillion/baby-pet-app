import { prisma } from '../db';
import { VerifyPurchaseInput, PurchaseResult } from '@baby-pet/types';
import { grantCredits, activateSubscription } from './entitlementService';

/**
 * Verify in-app purchase and grant entitlements
 * 
 * Phase 1: Use RevenueCat webhook (recommended for MVP)
 * Phase 2: Native StoreKit 2 + Play Billing verification (shown here as stub)
 */
export const verifyPurchase = async (
  userId: string,
  input: VerifyPurchaseInput
): Promise<PurchaseResult> => {
  try {
    // In production, verify receipt with Apple/Google servers
    const isValid = await verifyReceipt(input.platform, input.receiptData);

    if (!isValid) {
      return {
        success: false,
        entitlement: null,
        error: 'Invalid receipt',
      };
    }

    // Store purchase record
    await prisma.purchase.create({
      data: {
        userId,
        platform: input.platform,
        productId: input.productId,
        transactionId: input.receiptData, // Simplified; extract real transaction ID
        receiptData: input.receiptData,
        isVerified: true,
      },
    });

    // Grant entitlements based on product ID
    let entitlement;
    if (input.productId.includes('credit')) {
      // Consumable: credits
      const creditAmount = parseCreditsFromProductId(input.productId);
      entitlement = await grantCredits(userId, creditAmount);
    } else if (input.productId.includes('monthly')) {
      // Subscription: monthly unlimited
      entitlement = await activateSubscription(userId, 30);
    } else if (input.productId.includes('lifetime')) {
      // Lifetime: very long subscription
      entitlement = await activateSubscription(userId, 365 * 10); // 10 years
    }

    return {
      success: true,
      entitlement: entitlement || null,
      error: null,
    };
  } catch (error: any) {
    console.error('Purchase verification failed:', error);
    return {
      success: false,
      entitlement: null,
      error: error.message,
    };
  }
};

/**
 * Verify receipt with Apple/Google
 * This is a stub - implement actual verification in production
 */
const verifyReceipt = async (platform: string, receiptData: string): Promise<boolean> => {
  // TODO: Implement actual receipt verification
  // iOS: StoreKit 2 App Store Server API
  // Android: Google Play Developer API

  console.log(`🔍 Verifying ${platform} receipt (stub)`);
  
  // For now, accept all receipts in development
  return process.env.NODE_ENV === 'development';
};

const parseCreditsFromProductId = (productId: string): number => {
  // Example: "credit_5" -> 5 credits
  const match = productId.match(/credit_(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

/**
 * Handle RevenueCat webhook
 * Register this endpoint: POST /webhooks/revenuecat
 */
export const handleRevenueCatWebhook = async (payload: any) => {
  const { event, app_user_id, product_id, period_type } = payload;

  console.log(`📬 RevenueCat webhook: ${event} for user ${app_user_id}`);

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
      if (period_type === 'trial' || period_type === 'normal') {
        await activateSubscription(app_user_id, 30);
      }
      break;

    case 'CANCELLATION':
    case 'EXPIRATION':
      await prisma.entitlement.update({
        where: { userId: app_user_id },
        data: {
          activeSubscription: false,
          tier: 'free',
        },
      });
      break;

    case 'NON_RENEWING_PURCHASE':
      // Consumable purchase (credits)
      const credits = parseCreditsFromProductId(product_id);
      await grantCredits(app_user_id, credits);
      break;
  }

  return { success: true };
};


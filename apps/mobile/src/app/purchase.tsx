import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { trpc } from '../utils/trpc';

/**
 * Purchase Screen - IAP Integration
 * 
 * Phase 1: RevenueCat (recommended)
 * Phase 2: Native StoreKit 2 + Play Billing
 * 
 * For this skeleton, showing the UI flow.
 * Integrate with @revenuecat/purchases-react-native or react-native-iap
 */

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  credits?: number;
  isSubscription: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 'credit_5',
    title: '5 Credits',
    description: 'Generate 5 baby pet images',
    price: '$4.99',
    credits: 5,
    isSubscription: false,
  },
  {
    id: 'credit_10',
    title: '10 Credits',
    description: 'Generate 10 baby pet images',
    price: '$8.99',
    credits: 10,
    isSubscription: false,
  },
  {
    id: 'monthly_unlimited',
    title: 'Monthly Unlimited',
    description: 'Unlimited generations + no watermarks',
    price: '$4.99/month',
    isSubscription: true,
  },
];

export default function PurchaseScreen() {
  const [loading, setLoading] = useState(false);
  const entitlementQuery = trpc.getEntitlement.useQuery();
  const verifyPurchaseMutation = trpc.verifyPurchase.useMutation();

  const handlePurchase = async (product: Product) => {
    try {
      setLoading(true);

      // TODO: Integrate actual IAP
      // Using RevenueCat:
      // import Purchases from '@revenuecat/purchases-react-native';
      // const purchaseResult = await Purchases.purchaseProduct(product.id);
      // const receipt = purchaseResult.customerInfo.originalAppUserId;

      // Using react-native-iap:
      // import * as RNIap from 'react-native-iap';
      // await RNIap.requestPurchase(product.id);
      // const purchases = await RNIap.getAvailablePurchases();
      // const receipt = purchases[0].transactionReceipt;

      // For demo: simulate purchase
      const mockReceipt = `mock_receipt_${Date.now()}`;

      // Verify with backend
      const result = await verifyPurchaseMutation.mutateAsync({
        platform: 'ios', // or 'android' - detect from Platform.OS
        receiptData: mockReceipt,
        productId: product.id,
      });

      if (result.success) {
        Alert.alert(
          'Purchase Successful! 🎉',
          product.isSubscription
            ? 'You now have unlimited access!'
            : `${product.credits} credits added to your account!`
        );
        entitlementQuery.refetch();
      } else {
        Alert.alert('Purchase Failed', result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const entitlement = entitlementQuery.data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Get Premium ✨</Text>
        <Text style={styles.subtitle}>
          Remove watermarks and generate unlimited baby pet images!
        </Text>
      </View>

      {entitlement && (
        <View style={styles.currentPlan}>
          <Text style={styles.currentPlanTitle}>Current Plan</Text>
          <Text style={styles.currentPlanValue}>
            {entitlement.activeSubscription
              ? '⭐ Monthly Unlimited'
              : `💎 ${entitlement.creditsRemaining} Credits Remaining`}
          </Text>
        </View>
      )}

      <View style={styles.productsContainer}>
        {PRODUCTS.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
            <Text style={styles.productDescription}>{product.description}</Text>
            
            {product.isSubscription && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🔥 BEST VALUE</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.purchaseButton,
                product.isSubscription && styles.purchaseButtonPremium,
              ]}
              onPress={() => handlePurchase(product)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  {product.isSubscription ? 'Subscribe' : 'Buy Now'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Premium Benefits:</Text>
        <Text style={styles.featureItem}>✓ No watermarks on generated images</Text>
        <Text style={styles.featureItem}>✓ Higher quality outputs</Text>
        <Text style={styles.featureItem}>✓ Priority processing</Text>
        <Text style={styles.featureItem}>✓ Cancel anytime</Text>
      </View>

      <View style={styles.legal}>
        <Text style={styles.legalText}>
          Payment will be charged to your Apple ID/Google Play account.
          Subscriptions automatically renew unless canceled at least 24 hours before the end of
          the current period.
        </Text>
        <TouchableOpacity>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  currentPlan: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  currentPlanTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentPlanValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productsContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonPremium: {
    backgroundColor: '#FF6B6B',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  features: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  legal: {
    padding: 24,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  legalLink: {
    fontSize: 14,
    color: '#007AFF',
    marginVertical: 4,
  },
});


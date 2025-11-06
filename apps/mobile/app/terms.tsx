import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing or using Kittypup, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our service.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.text}>
          Kittypup is an AI-powered mobile application that generates baby versions of your pets (dogs and cats). The service uses advanced artificial intelligence to create images showing how your pet might have looked as a puppy or kitten.
        </Text>

        <Text style={styles.sectionTitle}>3. Acceptable Use</Text>
        <Text style={styles.text}>
          You agree to use Kittypup only for its intended purpose. You may NOT:{'\n'}
          • Upload photos of people or any content containing human faces{'\n'}
          • Upload inappropriate, offensive, or illegal content{'\n'}
          • Attempt to reverse-engineer or exploit our AI models{'\n'}
          • Use the service for commercial purposes without permission{'\n'}
          • Share your account credentials with others
        </Text>

        <Text style={styles.sectionTitle}>4. User Content and License</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Your Content:</Text> You retain all rights to the photos you upload. By uploading photos, you grant us a temporary license to process them for the sole purpose of generating your requested images.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Generated Images:</Text> You own the generated baby pet images. You may use them for personal, non-commercial purposes.
        </Text>

        <Text style={styles.sectionTitle}>5. Prohibited Content</Text>
        <Text style={styles.text}>
          We strictly prohibit photos containing:{'\n'}
          • Human faces or people (for privacy and legal compliance){'\n'}
          • Violence, gore, or disturbing content{'\n'}
          • Sexually explicit or suggestive content{'\n'}
          • Copyright-infringing material{'\n'}
          • Illegal activity or contraband
        </Text>
        <Text style={styles.text}>
          Violations may result in immediate account termination without refund.
        </Text>

        <Text style={styles.sectionTitle}>6. Payments and Subscriptions</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Free Tier:</Text> One watermarked image generation.{'\n'}
          <Text style={styles.bold}>Credits:</Text> Consumable purchases for individual image generations.{'\n'}
          <Text style={styles.bold}>Subscription:</Text> Monthly unlimited generations without watermarks.
        </Text>
        <Text style={styles.text}>
          All purchases are processed through Apple App Store or Google Play Store. Refunds are subject to their respective policies.
        </Text>

        <Text style={styles.sectionTitle}>7. Subscription Cancellation</Text>
        <Text style={styles.text}>
          You may cancel your subscription at any time through your App Store or Google Play account settings. Cancellation takes effect at the end of your current billing period. No partial refunds are provided for unused time.
        </Text>

        <Text style={styles.sectionTitle}>8. Service Availability</Text>
        <Text style={styles.text}>
          We strive to provide reliable service but do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues. We are not liable for any losses resulting from service interruptions.
        </Text>

        <Text style={styles.sectionTitle}>9. AI-Generated Content Disclaimer</Text>
        <Text style={styles.text}>
          Our AI generates images based on your input photos. Results may vary and are not guaranteed to be accurate or realistic. Generated images are for entertainment purposes only and should not be considered representations of how your pet actually looked as a baby.
        </Text>

        <Text style={styles.sectionTitle}>10. Intellectual Property</Text>
        <Text style={styles.text}>
          The Kittypup app, including its design, AI models, and technology, is protected by copyright and other intellectual property laws. You may not copy, modify, or distribute any part of our service without explicit permission.
        </Text>

        <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
        <Text style={styles.text}>
          Kittypup is provided "as is" without warranties of any kind. We are not liable for:{'\n'}
          • Inaccurate or unsatisfactory AI-generated results{'\n'}
          • Loss of data or images{'\n'}
          • Service interruptions or downtime{'\n'}
          • Indirect, incidental, or consequential damages
        </Text>
        <Text style={styles.text}>
          Our total liability shall not exceed the amount you paid for the service in the past 12 months.
        </Text>

        <Text style={styles.sectionTitle}>12. Account Termination</Text>
        <Text style={styles.text}>
          We reserve the right to suspend or terminate your account at any time for:{'\n'}
          • Violation of these Terms of Service{'\n'}
          • Uploading prohibited content{'\n'}
          • Fraudulent payment activity{'\n'}
          • Abusive behavior towards our staff or other users
        </Text>

        <Text style={styles.sectionTitle}>13. Modifications to Service</Text>
        <Text style={styles.text}>
          We may modify, suspend, or discontinue any part of the service at any time. We will provide reasonable notice of significant changes when possible.
        </Text>

        <Text style={styles.sectionTitle}>14. Governing Law</Text>
        <Text style={styles.text}>
          These Terms are governed by the laws of the United States. Any disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
        </Text>

        <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these Terms of Service from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>16. Contact Information</Text>
        <Text style={styles.text}>
          For questions about these Terms of Service:{'\n\n'}
          Email: support@kittypup.app{'\n'}
          Website: www.kittypup.app/terms
        </Text>

        <View style={styles.footer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#000',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    height: 40,
  },
});


import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          Welcome to Kittypup ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Photos:</Text> We collect the pet photos you upload to generate baby versions. These are processed on our servers and automatically deleted after 72 hours.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Account Information:</Text> Email address (if provided), user ID, and authentication credentials.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Purchase Information:</Text> Transaction details for in-app purchases, processed through Apple App Store or Google Play Store.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Device Information:</Text> Device type, operating system, and app version for technical support.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.text}>
          • To generate AI-powered baby pet images{'\n'}
          • To process and manage your subscription or credit purchases{'\n'}
          • To send you notifications about your image generation status{'\n'}
          • To improve our AI models and app functionality{'\n'}
          • To provide customer support
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={styles.text}>
          Your photos are stored securely on AWS S3 servers with encryption at rest and in transit. Original uploaded photos are automatically deleted after 72 hours. Generated images are kept until you delete them or request account deletion.
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
        <Text style={styles.text}>
          We use the following third-party services:{'\n'}
          • AWS (cloud storage and processing){'\n'}
          • Apple/Google (payment processing){'\n'}
          • Analytics services (optional, can be disabled)
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Access:</Text> You can download all your data at any time.{'\n'}
          <Text style={styles.bold}>Deletion:</Text> You can request complete deletion of your account and all associated data.{'\n'}
          <Text style={styles.bold}>Opt-Out:</Text> You can disable notifications and analytics tracking.
        </Text>

        <Text style={styles.sectionTitle}>7. Data Retention</Text>
        <Text style={styles.text}>
          • Original uploaded photos: 72 hours{'\n'}
          • Generated images: Until you delete them{'\n'}
          • Account data: Until you request deletion{'\n'}
          • Purchase records: 7 years (required by law)
        </Text>

        <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
        <Text style={styles.text}>
          Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
        <Text style={styles.text}>
          Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this privacy policy from time to time. We will notify you of any significant changes through the app or via email.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.text}>
          If you have questions about this privacy policy or want to exercise your rights, contact us at:{'\n\n'}
          Email: privacy@kittypup.app{'\n'}
          Website: www.kittypup.app/privacy
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


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { trpc } from '../utils/trpc';
import { useAuthStore } from '../store/authStore';

export default function SettingsScreen() {
  const userId = useAuthStore((state) => state.userId);
  const deletionMutation = trpc.requestDeletion.useMutation();
  const exportMutation = trpc.requestExport.useMutation();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data, including photos and generated images. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletionMutation.mutateAsync({
                userId: userId!,
                reason: 'User requested deletion',
              });
              Alert.alert(
                'Deletion Requested',
                'Your data will be deleted within 24 hours. You will receive a confirmation.'
              );
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.prompt(
      'Export Data',
      'Enter your email address to receive your data export:',
      async (email) => {
        if (!email || !email.includes('@')) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return;
        }

        try {
          await exportMutation.mutateAsync({
            userId: userId!,
            email,
          });
          Alert.alert(
            'Export Requested',
            'You will receive your data export via email within 24 hours.'
          );
        } catch (error: any) {
          Alert.alert('Error', error.message);
        }
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.userId}>User ID: {userId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>📦 Download My Data</Text>
          <Text style={styles.buttonSubtext}>GDPR Art. 15 - Right of access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.buttonText, styles.dangerText]}>🗑️ Delete All My Data</Text>
          <Text style={styles.buttonSubtext}>
            GDPR Art. 17 - Right to be forgotten
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>💎 Manage Subscription</Text>
          <Text style={styles.buttonSubtext}>View or cancel your subscription</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Baby Pet App v1.0.0</Text>
        <Text style={styles.footerText}>GDPR & CCPA Compliant</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
  },
  dangerText: {
    color: '#d32f2f',
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CircleAlert as AlertCircle, RefreshCw } from 'lucide-react-native';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try again',
}: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertCircle size={48} color="#EF4444" />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={20} color="#22C55E" />
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  retryText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
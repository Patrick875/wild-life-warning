import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingSpinner({ text = 'Loading...', size = 'medium' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <View style={[
        styles.spinner,
        size === 'small' && styles.spinnerSmall,
        size === 'large' && styles.spinnerLarge,
      ]} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderTopColor: '#22C55E',
    marginBottom: 12,
  },
  spinnerSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  spinnerLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
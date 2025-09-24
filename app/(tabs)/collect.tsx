import DynamicForm from '@/components/ui/DynamicForm';
import { fetchKoboFormStructure } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet, Text
} from 'react-native';

interface FormData {
  species: string;
  location: string;
  date: string;
  time: string;
  count: string;
  behavior: string;
  habitat: string;
  weather: string;
  notes: string;
}

export default function CollectScreen() {
  const { data: fields, isLoading, error } = useQuery({
    queryKey: ['koboForm', 'aqcdE3iUvZgmYQHcuSQgYW'],
    queryFn: () => fetchKoboFormStructure('aqcdE3iUvZgmYQHcuSQgYW'),
  });
    if (isLoading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Error loading form</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <DynamicForm fields={fields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 12,
    zIndex: 1,
  },
  inputWithPadding: {
    paddingLeft: 48,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  chipActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  chipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  chipTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
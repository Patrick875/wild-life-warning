
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Field = {
  type: string;
  name: string;
  label?: string;
  choices?: any[];
  [key:string]:any;
};

export default function DynamicForm({ fields }: { fields: Field[] }) {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderField = (field: Field) => {
    const { type, name, label } = field;

    switch (true) {
      case type === 'text':
      case type === 'integer':
        return (
          <View key={field?.['$kuid']} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={formData[name] || ''}
              onChangeText={text => handleChange(name, type === 'integer' ? Number(text) : text)}
              keyboardType={type === 'integer' ? 'numeric' : 'default'}
            />
          </View>
        );

      case type.startsWith('select_one'):
        return (
          <View key={field?.['$kuid']} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <Text style={{ color: 'gray' }}>Select fields coming soon...</Text>
          </View>
        );

      case type === 'note':
        return (
          <View key={field?.['$kuid']} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
          </View>
        );

      default:
        return (
          <View key={field?.['$kuid']} style={styles.field}>
            <Text style={styles.label}>
              Unsupported field type: <Text style={{ fontWeight: 'bold' }}>{type}</Text>
            </Text>
          </View>
        );
    }
  };

  return <ScrollView style={styles.container}>{fields.filter((field)=>field?.label).map(renderField)}</ScrollView>;
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  field: { marginBottom: 16 },
  label: { fontWeight: 'bold', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
});

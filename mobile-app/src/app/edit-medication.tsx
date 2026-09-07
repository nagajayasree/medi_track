import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMedications } from '@/context/MedicationContext';

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every other day',
  'As needed',
];

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { medications, updateMedication } = useMedications();

  const medication = medications.find((m) => m._id === id);

  // Fallbacks matter here — if this screen is ever reached with a stale
  // or missing id (e.g. deep link, fast back-nav), we don't want a crash.
  const [name, setName] = useState(medication?.name ?? '');
  const [dosage, setDosage] = useState(medication?.dosage ?? '');
  const [frequency, setFrequency] = useState(
    medication?.frequency ?? FREQUENCY_OPTIONS[0],
  );
  const [startDate, setStartDate] = useState(
    medication?.startDate ? new Date(medication.startDate) : new Date(),
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!medication) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Medication not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.notFoundLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter a medication name.';
    if (!dosage.trim()) return 'Please enter a dosage.';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Missing information', error);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMedication(medication._id, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        startDate: startDate.toISOString(),
      });
      Alert.alert('Medication updated', 'Your changes have been saved.');
      router.back();
    } catch (err: any) {
      Alert.alert(
        'Could not save changes',
        err.response?.data?.error ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit medication</Text>

      <Text style={styles.label}>Medication name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Dosage</Text>
      <TextInput style={styles.input} value={dosage} onChangeText={setDosage} />

      <Text style={styles.label}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {FREQUENCY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.frequencyChip,
              frequency === option && styles.frequencyChipSelected,
            ]}
            onPress={() => setFrequency(option)}
          >
            <Text
              style={[
                styles.frequencyChipText,
                frequency === option && styles.frequencyChipTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Start date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartPicker(true)}
      >
        <Text>{startDate.toDateString()}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onValueChange={(_event, selectedDate) => {
            setShowStartPicker(Platform.OS === 'ios');
            if (selectedDate) setStartDate(selectedDate);
            setShowStartPicker(false);
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSubmitting}
      >
        <Text style={styles.saveButtonText}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#111' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  frequencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  frequencyChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  frequencyChipSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  frequencyChipText: { color: '#333', fontSize: 13 },
  frequencyChipTextSelected: { color: '#fff' },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { marginTop: 16, alignItems: 'center' },
  cancelText: { color: '#888', fontSize: 14 },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: { fontSize: 15, color: '#666' },
  notFoundLink: { color: '#2563eb', fontWeight: '600' },
});

import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
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

type AddMedicationScreenProps = {
  navigation: any;
};

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every other day',
  'As needed',
];

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date | null;
};

export default function AddMedicationScreen({
  navigation,
}: AddMedicationScreenProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter a medication name.';
    if (!dosage.trim()) return 'Please enter a dosage.';
    if (hasEndDate && endDate && endDate < startDate) {
      return 'End date must be after the start date.';
    }
    return null;
  };

  const handleSave = () => {
    const error = validate();
    if (error) {
      Alert.alert('Missing information', error);
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      startDate,
      endDate: hasEndDate ? endDate : null,
    };

    // TODO: replace with your actual save step, e.g.:
    // await api.post('/medications', newMedication)
    // or AsyncStorage / your local DB layer
    console.log('Saving medication:', JSON.stringify(newMedication, null, 2));
    setName('');
    setDosage('');
    setFrequency(FREQUENCY_OPTIONS[0]);
    setStartDate(new Date());
    setEndDate(null);
    Alert.alert(
      'Medication saved',
      'Your medication has been saved successfully.',
    );

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Medication name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Metformin"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Dosage</Text>
      <TextInput
        style={styles.input}
        value={dosage}
        onChangeText={setDosage}
        placeholder="e.g. 500mg"
      />

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

      <View style={styles.endDateHeader}>
        <Text style={styles.label}>End date</Text>
        <TouchableOpacity onPress={() => setHasEndDate((prev) => !prev)}>
          <Text style={styles.toggleText}>
            {hasEndDate ? 'Make ongoing' : 'Set an end date'}
          </Text>
        </TouchableOpacity>
      </View>
      {hasEndDate && (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text>{(endDate ?? new Date()).toDateString()}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onValueChange={(_event, selectedDate) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (selectedDate) setEndDate(selectedDate);
                setShowEndPicker(false);
              }}
            />
          )}
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save medication</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 60 },
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
  endDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

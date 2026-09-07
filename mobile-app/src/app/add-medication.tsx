import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

// Sensible default dose times per frequency, so the picker starts
// somewhere reasonable instead of empty/midnight.
function getDefaultTimesForFrequency(frequency: string): Date[] {
  const at = (h: number, m = 0) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  switch (frequency) {
    case 'Once daily':
      return [at(8)];
    case 'Twice daily':
      return [at(8), at(20)];
    case 'Three times daily':
      return [at(8), at(14), at(20)];
    case 'Every other day':
      return [at(8)];
    case 'As needed':
      return []; // no fixed schedule — taken only when needed
    default:
      return [at(8)];
  }
}

// Zero-padded 24-hour "HH:MM", matching what the backend/schedule
// screens expect (they sort dose times with string comparison).
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AddMedicationScreen() {
  const { addMedication } = useMedications();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[0]);
  const [doseTimes, setDoseTimes] = useState<Date[]>(
    getDefaultTimesForFrequency(FREQUENCY_OPTIONS[0]),
  );
  const [activeTimePickerIndex, setActiveTimePickerIndex] = useState<
    number | null
  >(null);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // When frequency changes, reset dose times to sensible defaults for
  // that frequency's dose count (e.g. going from once -> twice daily
  // adds a second slot).
  useEffect(() => {
    setDoseTimes(getDefaultTimesForFrequency(frequency));
    setActiveTimePickerIndex(null);
  }, [frequency]);

  const updateDoseTime = (index: number, newTime: Date) => {
    setDoseTimes((prev) => {
      const next = [...prev];
      next[index] = newTime;
      return next;
    });
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter a medication name.';
    if (!dosage.trim()) return 'Please enter a dosage.';
    if (hasEndDate && endDate && endDate < startDate) {
      return 'End date must be after the start date.';
    }
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
      await addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        times: doseTimes.map(formatTime),
        startDate: startDate.toISOString(),
        ...(hasEndDate && endDate ? { endDate: endDate.toISOString() } : {}),
      });

      setName('');
      setDosage('');
      setFrequency(FREQUENCY_OPTIONS[0]);
      setDoseTimes(getDefaultTimesForFrequency(FREQUENCY_OPTIONS[0]));
      setStartDate(new Date());
      setEndDate(null);
      setHasEndDate(false);

      Alert.alert(
        'Medication saved',
        'Your medication has been saved successfully.',
      );
      router.back();
    } catch (err: any) {
      Alert.alert(
        'Could not save medication',
        err.response?.data?.error ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
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

      {doseTimes.length > 0 && (
        <>
          <Text style={styles.label}>Dose times</Text>
          {doseTimes.map((time, index) => (
            <View key={index} style={styles.doseTimeRow}>
              <Text style={styles.doseTimeIndex}>Dose {index + 1}</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setActiveTimePickerIndex(index)}
              >
                <Text style={styles.timeButtonText}>
                  {formatTimeLabel(time)}
                </Text>
              </TouchableOpacity>
              {activeTimePickerIndex === index && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onValueChange={(_event, selectedTime) => {
                    setActiveTimePickerIndex(
                      Platform.OS === 'ios' ? index : null,
                    );
                    if (selectedTime) updateDoseTime(index, selectedTime);
                    if (Platform.OS !== 'ios') setActiveTimePickerIndex(null);
                    setActiveTimePickerIndex(null);
                  }}
                />
              )}
            </View>
          ))}
        </>
      )}
      {doseTimes.length === 0 && (
        <Text style={styles.noScheduleText}>
          No fixed schedule — this medication is taken as needed.
        </Text>
      )}

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

      <TouchableOpacity
        style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSubmitting}
      >
        <Text style={styles.saveButtonText}>
          {isSubmitting ? 'Saving...' : 'Save medication'}
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
  content: { padding: 20, paddingTop: 40, paddingBottom: 60 },
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
  doseTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  doseTimeIndex: { fontSize: 13, color: '#666', width: 56 },
  timeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  timeButtonText: { fontSize: 15, fontWeight: '600', color: '#111' },
  noScheduleText: { fontSize: 13, color: '#999', marginTop: 4 },
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
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { marginTop: 16, alignItems: 'center' },
  cancelText: { color: '#888', fontSize: 14 },
});

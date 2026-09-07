import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMedications } from '@/context/MedicationContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { medications, fetchMedications, isLoading } = useMedications();

  useEffect(() => {
    fetchMedications();
  }, []);

  const activeMeds = medications.filter((m) => m.active);

  const todaysSchedule = activeMeds
    .flatMap((med) =>
      med.times.map((time) => ({
        id: `${med._id}-${time}`,
        name: med.name,
        dosage: med.dosage,
        time,
      })),
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </Text>
          <Text style={styles.dateLabel}>{getTodayLabel()}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{activeMeds.length}</Text>
              <Text style={styles.statLabel}>Active meds</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todaysSchedule.length}</Text>
              <Text style={styles.statLabel}>Doses today</Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's schedule</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/my-medications')}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : todaysSchedule.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No medications scheduled yet.</Text>
              <TouchableOpacity onPress={() => router.push('/add-medication')}>
                <Text style={styles.emptyLink}>Add your first medication</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todaysSchedule.map((dose) => (
              <View key={dose.id} style={styles.doseCard}>
                <View style={styles.doseTimeBlock}>
                  <Text style={styles.doseTime}>{dose.time}</Text>
                </View>
                <View style={styles.doseInfo}>
                  <Text style={styles.doseName}>{dose.name}</Text>
                  <Text style={styles.doseDosage}>{dose.dosage}</Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => router.push('/add-medication')}
            >
              <Text style={styles.primaryActionText}>+ Add medication</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push('/(tabs)/my-medications')}
            >
              <Text style={styles.secondaryActionText}>View all</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: Spacing.three,
  },
  dateLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    marginBottom: Spacing.four,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionLink: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  emptyCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 13, color: '#999' },
  emptyLink: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  doseTimeBlock: {
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  doseTime: { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  doseInfo: { flex: 1 },
  doseName: { fontSize: 15, fontWeight: '600', color: '#111' },
  doseDosage: { fontSize: 12, color: '#888', marginTop: 1 },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryActionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryActionText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
});
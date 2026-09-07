import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedications, type Medication } from '@/context/MedicationContext';

function formatDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function MedicationCard({
  medication,
  onDeactivate,
  onEdit,
}: {
  medication: Medication;
  onDeactivate?: (id: string) => void;
  onEdit?: (id: string) => void;
}) {
  return (
    <View style={[styles.card, !medication.active && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{medication.name}</Text>
        {!medication.active && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>Discontinued</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardDetail}>
        {medication.dosage} · {medication.frequency}
      </Text>

      <Text style={styles.cardDate}>
        Started {formatDate(medication.startDate)}
        {medication.endDate ? ` · Ends ${formatDate(medication.endDate)}` : ''}
      </Text>

      {!medication.active && medication.deactivatedAt && (
        <Text style={styles.cardDate}>
          Discontinued {formatDate(medication.deactivatedAt)}
        </Text>
      )}

      {medication.active && (onEdit || onDeactivate) && (
        <View style={styles.actionsRow}>
          {onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(medication._id)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDeactivate && (
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={() =>
                Alert.alert(
                  'Discontinue medication',
                  `Stop tracking ${medication.name}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Discontinue',
                      style: 'destructive',
                      onPress: () => onDeactivate(medication._id),
                    },
                  ],
                )
              }
            >
              <Text style={styles.deactivateButtonText}>Discontinue</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function MedicationTrackerScreen() {
  const { medications, fetchMedications, deactivateMedication, isLoading } =
    useMedications();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMedications();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMedications();
    setRefreshing(false);
  }, []);

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateMedication(id);
    } catch (err: any) {
      Alert.alert(
        'Could not update medication',
        err.response?.data?.error ?? 'Something went wrong. Please try again.',
      );
    }
  };

  const activeMeds = medications.filter((m) => m.active);
  const inactiveMeds = medications.filter((m) => !m.active);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Medications</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-medication')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Active ({activeMeds.length})</Text>
        {activeMeds.length === 0 ? (
          <Text style={styles.emptyText}>
            {isLoading ? 'Loading...' : 'No active medications yet.'}
          </Text>
        ) : (
          activeMeds.map((med) => (
            <MedicationCard
              key={med._id}
              medication={med}
              onDeactivate={handleDeactivate}
              onEdit={(id) =>
                router.push({ pathname: '/edit-medication', params: { id } })
              }
            />
          ))
        )}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
          Inactive ({inactiveMeds.length})
        </Text>
        {inactiveMeds.length === 0 ? (
          <Text style={styles.emptyText}>No discontinued medications.</Text>
        ) : (
          inactiveMeds.map((med) => (
            <MedicationCard key={med._id} medication={med} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: { fontSize: 22, fontWeight: '700', color: '#111' },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionTitleSpaced: { marginTop: 24 },
  emptyText: { fontSize: 13, color: '#999', marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  cardInactive: { backgroundColor: '#f5f5f5', opacity: 0.75 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111' },
  inactiveBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  inactiveBadgeText: { fontSize: 11, color: '#666', fontWeight: '600' },
  cardDetail: { fontSize: 14, color: '#444', marginTop: 4 },
  cardDate: { fontSize: 12, color: '#999', marginTop: 4 },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  editButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  editButtonText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },
  deactivateButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0473e',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  deactivateButtonText: { color: '#e0473e', fontSize: 12, fontWeight: '600' },
});

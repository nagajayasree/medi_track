import { router } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useMedications } from '@/context/MedicationContext';

type ListItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { medications } = useMedications();

  const activeMedications = medications.filter((m) => m.active);
  const dosesToday = activeMedications.reduce(
    (sum, med) => sum + med.times.length,
    0,
  );

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const listItems: ListItem[] = [
    { label: 'Edit Profile', onPress: () => router.push('/edit-profile') },
    {
      label: 'Change Password',
      onPress: () => router.push('/change-password'),
    },
    {
      label: 'My Medications',
      onPress: () => router.push('/(tabs)/my-medications'),
    },
    {
      label: 'Help & FAQs',
      onPress: () => Alert.alert('Help & FAQs', 'Coming soon.'),
    },
    { label: 'Logout', onPress: handleLogout, destructive: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{activeMedications.length}</Text>
            <Text style={styles.statLabel}>Active meds</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{dosesToday}</Text>
            <Text style={styles.statLabel}>Doses today</Text>
          </View>
        </View>

        <View style={styles.list}>
          {listItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.listItem,
                index === listItems.length - 1 && styles.listItemLast,
              ]}
              onPress={item.onPress}
            >
              <Text
                style={[
                  styles.listItemLabel,
                  item.destructive && styles.listItemLabelDestructive,
                ]}
              >
                {item.label}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    alignSelf: 'flex-start',
    fontSize: 15,
    color: '#999',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  name: { fontSize: 18, fontWeight: '700', color: '#111' },
  email: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 24 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  statBlock: { alignItems: 'center', paddingHorizontal: 24 },
  statDivider: { width: 1, height: 32, backgroundColor: '#eee' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  list: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemLast: { borderBottomWidth: 0 },
  listItemLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  listItemLabelDestructive: { color: '#e0473e' },
  chevron: { fontSize: 20, color: '#ccc' },
});

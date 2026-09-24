import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="person-outline" size={48} color="#0077B6" />
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>
        Manage your SafariTix account and preferences.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
    color: '#64748B',
  },
});

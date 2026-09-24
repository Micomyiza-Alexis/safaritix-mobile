import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TrackScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="navigate-outline" size={48} color="#0077B6" />
      <Text style={styles.title}>Track Bus</Text>
      <Text style={styles.subtitle}>
        Track your bus and view its current location.
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

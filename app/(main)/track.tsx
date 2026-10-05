import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TrackScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Ionicons name="navigate-outline" size={48} color="#0077B6" />
      <Text style={styles.title}>Track Bus</Text>
      <Text style={styles.subtitle}>Open a backend booking from Trips to view its bus location.</Text>
      <Pressable style={styles.button} onPress={() => router.navigate('/trips')}><Text style={styles.buttonText}>View my trips</Text></Pressable>
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
  button: { marginTop: 18, backgroundColor: '#0077B6', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 13 },
  buttonText: { color: '#FFF', fontWeight: '800' },
});

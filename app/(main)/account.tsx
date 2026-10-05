import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function AccountScreen() {
  const router = useRouter();
  const { user, isInitialized, initialize, logout } = useAuthStore();
  useEffect(() => { if (!isInitialized) initialize(); }, [isInitialized, initialize]);
  if (!isInitialized) return <View style={styles.center}><ActivityIndicator color="#0077B6" /></View>;
  const handleLogout = async () => { await logout(); router.replace('/auth/login'); };
  return <View style={styles.container}><Text style={styles.title}>Account</Text>{user ? <><Text style={styles.name}>{user.name}</Text><Text style={styles.subtitle}>{user.email}</Text><Text style={styles.subtitle}>{user.phone || 'No phone number'}</Text><Pressable style={styles.button} onPress={handleLogout}><Text style={styles.buttonText}>Log out</Text></Pressable></> : <><Text style={styles.subtitle}>Sign in to access your authenticated commuter profile and trips.</Text><Pressable style={styles.button} onPress={() => router.push('/auth/login')}><Text style={styles.buttonText}>Sign in</Text></Pressable></>}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  name: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  button: { marginTop: 16, minHeight: 50, borderRadius: 12, backgroundColor: '#0077B6', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontWeight: '800' },
});

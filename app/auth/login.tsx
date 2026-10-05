import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => { setLoading(true); setError(''); try { await login(email, password); router.replace('/(main)'); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.'); } finally { setLoading(false); } };
  return <View style={styles.screen}><Text style={styles.title}>Sign in</Text><Text style={styles.subtitle}>Use your SafariTix commuter account.</Text><TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} /><TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />{!!error && <Text style={styles.error}>{error}</Text>}<Pressable style={styles.button} disabled={loading} onPress={submit}>{loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign in</Text>}</Pressable><Pressable onPress={() => router.push('/auth/register')}><Text style={styles.link}>Create a commuter account</Text></Pressable></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#F8FAFC', padding: 22, paddingTop: 80, gap: 14 }, title: { fontSize: 30, fontWeight: '900', color: '#0F172A' }, subtitle: { color: '#64748B' }, input: { minHeight: 50, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, backgroundColor: '#FFF', paddingHorizontal: 14 }, error: { color: '#B42318' }, button: { minHeight: 50, borderRadius: 12, backgroundColor: '#0077B6', alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#FFF', fontWeight: '800' }, link: { color: '#0077B6', textAlign: 'center', fontWeight: '700' } });

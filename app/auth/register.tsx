import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '@/services/auth/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await register(fullName, email, password, phone);
      setMessage(response.message);
      setTimeout(() => router.replace('/auth/login'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Register as a SafariTix commuter.</Text>
      <TextInput style={styles.input} placeholder="Full name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Phone number (optional)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!message && <Text style={styles.message}>{message}</Text>}
      <Pressable style={styles.button} disabled={loading} onPress={submit}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Create account</Text>}
      </Pressable>
      <Pressable onPress={() => router.replace('/auth/login')}><Text style={styles.link}>Already have an account? Sign in</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC', padding: 22, paddingTop: 70, gap: 14 },
  title: { fontSize: 30, fontWeight: '900', color: '#0F172A' },
  subtitle: { color: '#64748B' },
  input: { minHeight: 50, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, backgroundColor: '#FFF', paddingHorizontal: 14 },
  error: { color: '#B42318' },
  message: { color: '#067647' },
  button: { minHeight: 50, borderRadius: 12, backgroundColor: '#0077B6', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontWeight: '800' },
  link: { color: '#0077B6', textAlign: 'center', fontWeight: '700' },
});

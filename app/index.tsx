import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Image source={require('../assets/images/SafariTix-Logo.png')} style={styles.logo} contentFit="contain" />
        <View style={styles.heroIcon}><Ionicons name="bus-outline" size={42} color="#0077B6" /></View>
        <Text style={styles.eyebrow}>TRAVEL WITH CONFIDENCE</Text>
        <Text style={styles.title}>Your journey starts here.</Text>
        <Text style={styles.subtitle}>Book reliable bus trips, keep your digital tickets close, and follow your journey from one simple app.</Text>
        <View style={styles.card}>
          <Feature icon="search-outline" text="Search real schedules and seats" />
          <Feature icon="qr-code-outline" text="Carry your ticket on your phone" />
          <Feature icon="navigate-outline" text="Track eligible trips when GPS is available" />
        </View>
        <Link href="/auth/login" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Log in</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></Pressable></Link>
        <Link href="/auth/register" asChild><Pressable style={styles.secondary}><Text style={styles.secondaryText}>Create an account</Text></Pressable></Link>
        <Text style={styles.footer}>SafariTix commuter mobile</Text>
      </View>
    </SafeAreaView>
  );
}

function Feature({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.feature}><Ionicons name={icon} size={19} color="#0077B6" /><Text style={styles.featureText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FBFD' }, content: { flex: 1, padding: 24, justifyContent: 'center' }, logo: { width: 190, height: 62, alignSelf: 'center', marginBottom: 34 }, heroIcon: { alignSelf: 'center', width: 78, height: 78, borderRadius: 26, backgroundColor: '#E6F4FB', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }, eyebrow: { color: '#0077B6', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' }, title: { color: '#0F172A', fontSize: 34, lineHeight: 40, fontWeight: '900', textAlign: 'center', marginTop: 9 }, subtitle: { color: '#475569', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 14 }, card: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginTop: 26, gap: 14 }, feature: { flexDirection: 'row', alignItems: 'center', gap: 11 }, featureText: { color: '#334155', fontSize: 14, fontWeight: '600', flex: 1 }, primary: { minHeight: 54, borderRadius: 15, backgroundColor: '#0077B6', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 24 }, primaryText: { color: '#FFF', fontSize: 16, fontWeight: '800' }, secondary: { minHeight: 52, borderRadius: 15, borderWidth: 1, borderColor: '#0077B6', alignItems: 'center', justifyContent: 'center', marginTop: 11 }, secondaryText: { color: '#0077B6', fontSize: 16, fontWeight: '800' }, footer: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 24 },
});

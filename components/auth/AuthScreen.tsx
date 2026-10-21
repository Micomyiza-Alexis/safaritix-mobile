import type { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authColors, authLayout } from '@/constants/authTheme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode; // e.g. back link, rendered above the logo
};

export function AuthScreen({ title, subtitle, children, footer, header }: Props) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.column}>
            {header}
            <Image
              source={require('@/assets/images/SafariTix-Logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="SafariTix"
            />
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <View style={styles.body}>{children}</View>
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: authColors.background },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: authLayout.horizontalPadding,
    paddingTop: 16,
    paddingBottom: 32,
  },
  column: { width: '100%', maxWidth: authLayout.maxContentWidth },
  logo: { width: 168, height: 52, alignSelf: 'flex-start', marginTop: 8, marginBottom: 28 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: authColors.text },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: authColors.textSecondary,
  },
  body: { marginTop: 24, gap: authLayout.fieldGap },
});
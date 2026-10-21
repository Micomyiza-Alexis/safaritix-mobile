import { StyleSheet, Text, View } from 'react-native';
import { authColors, authLayout } from '@/constants/authTheme';

type Props = { kind: 'error' | 'success'; children: string };

export function FormMessage({ kind, children }: Props) {
  const isError = kind === 'error';
  return (
    <View
      style={[styles.box, isError ? styles.errorBox : styles.successBox]}
      accessibilityRole={isError ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.text, { color: isError ? authColors.error : authColors.success }]}>
        {isError ? 'Error: ' : ''}
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: authLayout.radius, padding: 12 },
  errorBox: { backgroundColor: authColors.errorSoft },
  successBox: { backgroundColor: authColors.successSoft },
  text: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
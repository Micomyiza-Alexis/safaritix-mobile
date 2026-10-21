import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { authColors, authLayout } from '@/constants/authTheme';

type Props = {
  label: string;
  onPress: () => void;
  align?: 'left' | 'center' | 'right';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function TextLink({ label, onPress, align = 'center', disabled, style }: Props) {
  const alignSelf = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.link, { alignSelf }, pressed && styles.pressed, style]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: authLayout.minTouch, justifyContent: 'center', paddingHorizontal: 4 },
  pressed: { opacity: 0.6 },
  text: { color: authColors.primary, fontSize: 15, fontWeight: '700' },
});
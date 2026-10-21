import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, type TextInput } from 'react-native';
import { AuthInput, type AuthInputProps } from './AuthInput';
import { authColors, authLayout } from '@/constants/authTheme';

export const PasswordInput = forwardRef<TextInput, Omit<AuthInputProps, 'right' | 'secureTextEntry'>>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <AuthInput
        ref={ref}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={!visible}
        right={
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        }
        {...props}
      />
    );
  },
);

const styles = StyleSheet.create({
  toggle: {
    minHeight: authLayout.minTouch,
    minWidth: authLayout.minTouch,
    marginRight: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { color: authColors.primary, fontWeight: '700', fontSize: 14 },
});
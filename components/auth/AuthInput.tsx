import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { authColors, authLayout } from '@/constants/authTheme';

export type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  right?: ReactNode;
};

export const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  { label, error, hint, right, onFocus, onBlur, editable = true, style, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
          !editable && styles.fieldDisabled,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={authColors.textMuted}
          accessibilityLabel={label}
          accessibilityHint={error}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {right}
      </View>
      {!!error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : !!hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '700', color: authColors.text, marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: authLayout.controlHeight,
    borderWidth: 1.5,
    borderColor: authColors.border,
    borderRadius: authLayout.radius,
    backgroundColor: authColors.surface,
    paddingHorizontal: 16,
  },
  fieldFocused: { borderColor: authColors.primary },
  fieldError: { borderColor: authColors.error },
  fieldDisabled: { backgroundColor: '#F1F5F9' },
  input: { flex: 1, fontSize: 16, color: authColors.text, paddingVertical: 12 },
  error: { marginTop: 6, fontSize: 13, lineHeight: 18, color: authColors.error },
  hint: { marginTop: 6, fontSize: 13, lineHeight: 18, color: authColors.textMuted },
});
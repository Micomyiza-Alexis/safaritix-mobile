import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { TextLink } from '@/components/auth/TextLink';
import { FormMessage } from '@/components/auth/FormMessage';
import { PASSWORD_MIN_LENGTH } from '@/constants/authTheme';
import { resetPassword } from '@/services/auth/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;

    setError('');

    if (!token?.trim()) {
      setError('This reset link is missing its token. Please request a new link.');
      return;
    }

    if (
      password.length < PASSWORD_MIN_LENGTH ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError('Use at least 8 characters, including at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'We could not reset your password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthScreen
        title="Password updated!"
        subtitle="Your password has been changed successfully. Sign in using your new password."
      >
        <PrimaryButton
          label="Back to sign in"
          onPress={() => router.replace('/auth/login')}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      header={
        <TextLink
          label="‹ Back to sign in"
          align="left"
          onPress={() => router.replace('/auth/login')}
        />
      }
      title="Set a new password"
      subtitle="Choose a strong password you haven't used for SafariTix before."
    >
      {!token?.trim() && (
        <FormMessage kind="error">
          This link has no reset token. Request a new password-reset email.
        </FormMessage>
      )}

      <PasswordInput
        label="New password"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        editable={!loading}
        returnKeyType="next"
      />

      <PasswordInput
        label="Confirm new password"
        placeholder="Enter your new password again"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        editable={!loading}
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      {!!error && <FormMessage kind="error">{error}</FormMessage>}

      <PrimaryButton
        label="Reset password"
        onPress={submit}
        loading={loading}
        disabled={!token?.trim()}
      />

      <TextLink
        label="Forgot your password? Request another link"
        onPress={() => router.replace('/auth/forgot-password')}
      />
    </AuthScreen>
  );
}

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { requestPasswordReset } from '@/services/auth/authService';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthInput } from '@/components/auth/AuthInput';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { TextLink } from '@/components/auth/TextLink';
import { FormMessage } from '@/components/auth/FormMessage';
import { EMAIL_REGEX } from '@/constants/authTheme';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    const normalized = email.trim().toLowerCase();

    if (!normalized) return setEmailError('Enter your email address.');
    if (!EMAIL_REGEX.test(normalized)) return setEmailError('Enter a valid email address.');

    setEmailError('');
    setFormError('');
    setLoading(true);
    try {
      await requestPasswordReset(normalized);
      setSent(true);
    } catch {
      // Email stays in state so the user can retry without retyping.
      setFormError('We could not submit your request. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const backToSignIn = (
    <TextLink label="‹ Back to sign in" align="left" onPress={() => router.back()} />
  );

  if (sent) {
    return (
      <AuthScreen
        header={backToSignIn}
        title="Check your email"
        subtitle="If an account exists for that email address, SafariTix has sent a password-reset link. Check your inbox and spam folder."
      >
        <PrimaryButton label="Back to sign in" onPress={() => router.replace('/auth/login')} />
        <TextLink label="Use a different email" onPress={() => setSent(false)} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      header={backToSignIn}
      title="Forgot your password?"
      subtitle="Enter the email address linked to your SafariTix account and we will send you a link to reset your password."
    >
      <AuthInput
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (emailError) setEmailError('');
        }}
        error={emailError}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={submit}
        editable={!loading}
      />

      {!!formError && <FormMessage kind="error">{formError}</FormMessage>}

      <PrimaryButton label="Send reset link" onPress={submit} loading={loading} />
    </AuthScreen>
  );
}
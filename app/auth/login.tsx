import { useRef, useState } from 'react';
import { Text, View, type TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { TextLink } from '@/components/auth/TextLink';
import { FormMessage } from '@/components/auth/FormMessage';
import { authColors, EMAIL_REGEX } from '@/constants/authTheme';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;

    const trimmed = email.trim();
    const eErr = !trimmed
      ? 'Enter your email address.'
      : !EMAIL_REGEX.test(trimmed)
        ? 'Enter a valid email address.'
        : '';
    const pErr = password ? '' : 'Enter your password.';

    setEmailError(eErr);
    setPasswordError(pErr);
    setFormError('');
    if (eErr || pErr) return;

    setLoading(true);
    try {
      await login(trimmed, password);
      router.replace('/(main)');
    } catch (err) {
      setFormError(err instanceof Error && err.message ? err.message : 'Unable to sign in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to book tickets and manage your trips."
      footer={
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <Text style={{ color: authColors.textSecondary, fontSize: 15 }}>New to SafariTix?</Text>
          <TextLink label="Create an account" onPress={() => router.push('/auth/register')} />
        </View>
      }
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
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
        editable={!loading}
      />

      <View>
        <PasswordInput
          ref={passwordRef}
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (passwordError) setPasswordError('');
          }}
          error={passwordError}
          textContentType="password"
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={submit}
          editable={!loading}
        />
        <TextLink
          label="Forgot password?"
          align="right"
          onPress={() => router.push('/auth/forgot-password')}
        />
      </View>

      {!!formError && <FormMessage kind="error">{formError}</FormMessage>}

      <PrimaryButton label="Sign in" onPress={submit} loading={loading} />
    </AuthScreen>
  );
}
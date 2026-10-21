import { useRef, useState } from 'react';
import { Text, View, type TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '@/services/auth/authService';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { TextLink } from '@/components/auth/TextLink';
import { FormMessage } from '@/components/auth/FormMessage';
import { authColors, EMAIL_REGEX, PASSWORD_MIN_LENGTH } from '@/constants/authTheme';

type Errors = Partial<Record<'fullName' | 'email' | 'password' | 'confirm', string>>;

export default function RegisterScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const clear = (key: keyof Errors) => errors[key] && setErrors((e) => ({ ...e, [key]: undefined }));

  const validate = (): Errors => {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = 'Enter your full name.';
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL_REGEX.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Create a password.';
    else if (password.length < PASSWORD_MIN_LENGTH)
      next.password = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
    if (confirm !== password) next.confirm = 'Passwords do not match.';
    return next;
  };

  const submit = async () => {
    if (loading) return;
    const next = validate();
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      // Same signature and payload order as before; backend contract unchanged.
      const response = await register(fullName.trim(), email.trim(), password, phone.trim());
      setSuccessMessage(response.message || 'Your account has been created.');
    } catch (err) {
      setFormError(err instanceof Error && err.message ? err.message : 'Unable to create your account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <AuthScreen title="Account created" subtitle="You can now sign in to SafariTix.">
        <FormMessage kind="success">{successMessage}</FormMessage>
        <PrimaryButton label="Continue to sign in" onPress={() => router.replace('/auth/login')} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Book bus tickets and manage your trips in one place."
      footer={
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <Text style={{ color: authColors.textSecondary, fontSize: 15 }}>Already have an account?</Text>
          <TextLink label="Sign in" onPress={() => router.replace('/auth/login')} />
        </View>
      }
    >
      <AuthInput
        label="Full name"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={(t) => { setFullName(t); clear('fullName'); }}
        error={errors.fullName}
        autoCapitalize="words"
        autoCorrect={false}
        textContentType="name"
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        blurOnSubmit={false}
        editable={!loading}
      />
      <AuthInput
        ref={emailRef}
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => { setEmail(t); clear('email'); }}
        error={errors.email}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
        blurOnSubmit={false}
        editable={!loading}
      />
      <AuthInput
        ref={phoneRef}
        label="Phone number (optional)"
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
        editable={!loading}
      />
      <PasswordInput
        ref={passwordRef}
        label="Password"
        placeholder="Create a password"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        value={password}
        onChangeText={(t) => { setPassword(t); clear('password'); }}
        error={errors.password}
        textContentType="newPassword"
        autoComplete="password-new"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        blurOnSubmit={false}
        editable={!loading}
      />
      <PasswordInput
        ref={confirmRef}
        label="Confirm password"
        placeholder="Re-enter your password"
        value={confirm}
        onChangeText={(t) => { setConfirm(t); clear('confirm'); }}
        error={errors.confirm}
        textContentType="newPassword"
        autoComplete="password-new"
        returnKeyType="done"
        onSubmitEditing={submit}
        editable={!loading}
      />

      {!!formError && <FormMessage kind="error">{formError}</FormMessage>}

      <PrimaryButton label="Create account" onPress={submit} loading={loading} />
    </AuthScreen>
  );
}
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field, Notice } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme';

export default function SignIn() {
  const t = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const up = mode === 'sign-up';
  const valid = email.includes('@') && password.length >= 8;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const address = email.trim();
      if (up) await signUp(name.trim() || address.split('@')[0], address, password);
      else await signIn(address, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong');
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Ionicons name="cube-outline" size={28} color={t.foreground} />
            <Text style={[styles.brandText, { color: t.foreground }]}>easyrender</Text>
          </View>
          <Text style={[styles.title, { color: t.foreground }]}>
            {up ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text style={[styles.subtitle, { color: t.mutedForeground }]}>
            Turn product photos into 3D models you can rotate, share and place in AR.
          </Text>

          <View style={styles.form}>
            {up ? (
              <Field
                label="Name"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                textContentType="name"
                placeholder="Your name"
              />
            ) : null}
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="you@company.com"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={up ? 'new-password' : 'current-password'}
              textContentType={up ? 'newPassword' : 'password'}
              placeholder="At least 8 characters"
              onSubmitEditing={() => valid && void submit()}
            />
            {error ? <Notice text={error} /> : null}
            <Button
              label={up ? 'Create account' : 'Sign in'}
              onPress={() => void submit()}
              loading={busy}
              disabled={!valid}
            />
            <Button
              variant="ghost"
              label={up ? 'I already have an account' : 'New here? Create an account'}
              onPress={() => {
                setMode(up ? 'sign-in' : 'sign-up');
                setError(null);
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 24, gap: 12, flexGrow: 1, justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  brandText: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 22, marginBottom: 8 },
  form: { gap: 14, marginTop: 8 },
});

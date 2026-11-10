import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { radius, useTheme } from '@/lib/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  style,
}: ButtonProps) {
  const t = useTheme();
  const palette = {
    primary: { bg: t.primary, fg: t.primaryForeground, border: t.primary },
    secondary: { bg: t.muted, fg: t.foreground, border: t.muted },
    outline: { bg: 'transparent', fg: t.foreground, border: t.border },
    ghost: { bg: 'transparent', fg: t.foreground, border: 'transparent' },
  }[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border },
        (pressed || inactive) && { opacity: inactive ? 0.5 : 0.85 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={palette.fg} size="small" /> : icon}
      <Text style={[styles.buttonText, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const t = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: t.foreground }]}>{label}</Text>
      <TextInput
        placeholderTextColor={t.mutedForeground}
        {...props}
        style={[
          styles.input,
          { borderColor: t.border, color: t.foreground, backgroundColor: t.card },
        ]}
      />
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, style]}>
      {children}
    </View>
  );
}

export function Badge({
  label,
  tone = 'muted',
}: {
  label: string;
  tone?: 'muted' | 'success' | 'destructive';
}) {
  const t = useTheme();
  const color =
    tone === 'success' ? t.success : tone === 'destructive' ? t.destructive : t.mutedForeground;
  return (
    <View style={[styles.badge, { borderColor: t.border, backgroundColor: t.card }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function Notice({
  text,
  tone = 'destructive',
}: {
  text: string;
  tone?: 'muted' | 'destructive';
}) {
  const t = useTheme();
  return (
    <Text
      style={{ color: tone === 'destructive' ? t.destructive : t.mutedForeground, fontSize: 14 }}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { fontSize: 15, fontWeight: '600' },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500' },
  input: {
    minHeight: 48,
    borderRadius: radius,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  card: { borderRadius: radius + 4, borderWidth: 1, padding: 16, gap: 12 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: '500' },
});

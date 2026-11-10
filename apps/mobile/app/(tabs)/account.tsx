import * as WebBrowser from 'expo-web-browser';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/config';
import { useLibrary } from '@/lib/library-context';
import { useTheme } from '@/lib/theme';

export default function Account() {
  const t = useTheme();
  const { user, signOut } = useAuth();
  const { balance, renders } = useLibrary();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={[styles.name, { color: t.foreground }]}>{user?.name}</Text>
        <Text style={{ color: t.mutedForeground }}>{user?.email}</Text>
      </Card>

      <Card>
        <Text style={{ color: t.mutedForeground }}>Credits</Text>
        <Text style={[styles.balance, { color: t.foreground }]}>{balance.toLocaleString()}</Text>
        <Text style={{ color: t.mutedForeground }}>
          {renders.length} {renders.length === 1 ? 'product' : 'products'} in your library
        </Text>
        <Button
          variant="outline"
          label="Buy credits"
          onPress={() => void WebBrowser.openBrowserAsync(`${API_URL}/credits`)}
        />
      </Card>

      <Button
        variant="outline"
        label="Dashboard, API keys and MCP"
        onPress={() => void WebBrowser.openBrowserAsync(`${API_URL}/dashboard`)}
      />
      <Button
        variant="ghost"
        label="Sign out"
        onPress={() =>
          Alert.alert('Sign out?', undefined, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
          ])
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  name: { fontSize: 20, fontWeight: '700' },
  balance: { fontSize: 36, fontWeight: '700', letterSpacing: -1 },
});

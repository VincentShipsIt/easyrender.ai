import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Notice } from '@/components/ui';
import { uploadPhoto } from '@/lib/api';
import { useLibrary } from '@/lib/library-context';
import { radius, useTheme } from '@/lib/theme';

// The API accepts photos up to 4 MB.
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_SIDE = 1600;

// Scales the photo down and re-encodes it as JPEG until it fits the upload limit.
async function prepare(uri: string): Promise<string> {
  for (const [side, quality] of [
    [MAX_SIDE, 0.85],
    [MAX_SIDE, 0.7],
    [1200, 0.7],
    [900, 0.6],
  ] as const) {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: side });
    const image = await context.renderAsync();
    const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: quality });
    if (new File(result.uri).size <= MAX_BYTES) return result.uri;
  }
  throw new Error('That photo is too large. Try another one.');
}

const TIPS = ['Plain, uncluttered background', 'Soft, even light', 'The whole product in frame'];

export default function Capture() {
  const t = useTheme();
  const router = useRouter();
  const { upsert, refresh } = useLibrary();
  const [uri, setUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function take() {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Allow camera access in Settings to photograph products.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
    if (!result.canceled) setUri(result.assets[0].uri);
  }

  async function choose() {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled) setUri(result.assets[0].uri);
  }

  async function submit() {
    if (!uri) return;
    setBusy(true);
    setError(null);
    try {
      const render = await uploadPhoto({
        uri: await prepare(uri),
        mimeType: 'image/jpeg',
        name: name.trim() || undefined,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      upsert(render);
      void refresh();
      setUri(null);
      setName('');
      router.push({ pathname: '/render/[id]', params: { id: render.id } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not upload the photo');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {uri ? (
          <Image
            source={{ uri }}
            style={[styles.preview, { backgroundColor: t.muted }]}
            contentFit="contain"
            accessibilityLabel="Selected product photo"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: t.muted, borderColor: t.border }]}>
            <Ionicons name="camera-outline" size={44} color={t.mutedForeground} />
            <Text style={[styles.placeholderTitle, { color: t.foreground }]}>
              Photograph a product
            </Text>
            {TIPS.map((tip) => (
              <Text key={tip} style={{ color: t.mutedForeground }}>
                · {tip}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.row}>
          <Button
            style={styles.flex}
            variant={uri ? 'outline' : 'primary'}
            label={uri ? 'Retake' : 'Take photo'}
            icon={
              <Ionicons name="camera" size={18} color={uri ? t.foreground : t.primaryForeground} />
            }
            onPress={() => void take()}
            disabled={busy}
          />
          <Button
            style={styles.flex}
            variant="outline"
            label="Choose photo"
            icon={<Ionicons name="images-outline" size={18} color={t.foreground} />}
            onPress={() => void choose()}
            disabled={busy}
          />
        </View>

        {uri ? (
          <>
            <Field
              label="Product name (optional)"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Oak armchair"
              maxLength={80}
              returnKeyType="done"
            />
            <Text style={{ color: t.mutedForeground, lineHeight: 20 }}>
              The preview is free. You only spend credits when you build the 3D model.
            </Text>
            <Button label="Create free preview" onPress={() => void submit()} loading={busy} />
          </>
        ) : null}
        {error ? <Notice text={error} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  preview: { width: '100%', aspectRatio: 1, borderRadius: radius + 2 },
  placeholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius + 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderTitle: { fontSize: 18, fontWeight: '600', marginTop: 4, marginBottom: 6 },
});

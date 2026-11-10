import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { RenderImage } from '@/components/render-image';
import { STATUS_LABEL } from '@/components/status';
import { Badge, Button, Notice } from '@/components/ui';
import type { RenderView } from '@/lib/api';
import { useLibrary } from '@/lib/library-context';
import { useTheme } from '@/lib/theme';

function Tile({ render }: { render: RenderView }) {
  const t = useTheme();
  const router = useRouter();
  const tone =
    render.status === 'ready' ? 'success' : render.status === 'failed' ? 'destructive' : 'muted';
  return (
    <Pressable
      style={styles.tile}
      onPress={() => router.push({ pathname: '/render/[id]', params: { id: render.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${render.name ?? 'Product'}, ${STATUS_LABEL[render.status]}`}
    >
      <RenderImage render={render} style={styles.thumb} />
      <Text numberOfLines={1} style={[styles.tileName, { color: t.foreground }]}>
        {render.name ?? 'Untitled product'}
      </Text>
      <Badge label={STATUS_LABEL[render.status]} tone={tone} />
    </Pressable>
  );
}

export default function Library() {
  const t = useTheme();
  const router = useRouter();
  const { renders, balance, loading, error, refresh } = useLibrary();

  return (
    <FlatList
      data={renders}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={[styles.credits, { backgroundColor: t.muted }]}>
            <Ionicons name="flash-outline" size={16} color={t.foreground} />
            <Text style={{ color: t.foreground, fontWeight: '600' }}>
              {balance.toLocaleString()} credits
            </Text>
          </View>
          {error ? <Notice text={error} /> : null}
        </View>
      }
      ListEmptyComponent={
        loading ? undefined : (
          <View style={styles.empty}>
            <Ionicons name="camera-outline" size={40} color={t.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: t.foreground }]}>No products yet</Text>
            <Text style={{ color: t.mutedForeground, textAlign: 'center', lineHeight: 20 }}>
              Photograph a product to get a free preview, then turn it into a 3D model.
            </Text>
            <Button label="Capture a product" onPress={() => router.navigate('/capture')} />
          </View>
        )
      }
      renderItem={({ item }) => <Tile render={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 16, flexGrow: 1 },
  row: { gap: 16 },
  header: { gap: 8, marginBottom: 4 },
  credits: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tile: { flex: 1, gap: 6 },
  thumb: { aspectRatio: 1, width: '100%' },
  tileName: { fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', gap: 12, paddingTop: 64, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
});

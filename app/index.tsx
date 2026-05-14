// app/index.tsx
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { loadAll } from '../src/storage/subscriptions';
import { rescheduleAll } from '../src/notifications/scheduler';
import SubscriptionCard from '../src/components/SubscriptionCard';
import type { Subscription } from '../src/types/subscription';

export default function HomeScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const router = useRouter();

  const load = useCallback(async () => {
    const all = await loadAll();
    const active = all.filter((s) => s.status !== 'cancelled');
    setSubscriptions(active);
    await rescheduleAll(active);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const trials = subscriptions.filter((s) => s.status === 'trial');
  const actives = subscriptions.filter((s) => s.status === 'active');

  const renderItem = ({ item }: { item: Subscription }) => (
    <SubscriptionCard
      subscription={item}
      onPress={() => router.push(`/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>トライアル監視</Text>
          <Pressable style={styles.addButton} onPress={() => router.push('/add')}>
            <Text style={styles.addButtonText}>＋ 追加</Text>
          </Pressable>
        </View>

        <FlatList
          data={[...trials, ...actives]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            trials.length > 0 ? (
              <Text style={styles.sectionLabel}>
                トライアル中 {trials.length}件
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>サブスクを追加しよう</Text>
              <Text style={styles.emptyBody}>
                無料トライアルを登録すると、{'\n'}終了前日に通知します。
              </Text>
            </View>
          }
          contentContainerStyle={trials.length === 0 && actives.length === 0 ? styles.emptyContainer : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F0' },
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#5C8A6E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
});

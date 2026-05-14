import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { loadAll } from '../src/storage/subscriptions';
import { rescheduleAll, sendTestNotification, requestPermission } from '../src/notifications/scheduler';
import SubscriptionCard from '../src/components/SubscriptionCard';
import type { Subscription } from '../src/types/subscription';

export default function HomeScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const router = useRouter();

  const handleTestNotification = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert('通知が許可されていません', '設定アプリから通知を許可してください。');
      return;
    }
    await sendTestNotification();
    Alert.alert('5秒後に通知が届きます', 'アプリをバックグラウンドに移動してください。');
  };

  const load = useCallback(async () => {
    const all = await loadAll();
    const trials = all.filter((s) => s.status === 'trial');
    setSubscriptions(trials);
    await rescheduleAll(trials);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
          <Pressable style={styles.testButton} onPress={handleTestNotification}>
            <Text style={styles.testButtonText}>通知テスト</Text>
          </Pressable>
        </View>

        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>トライアルを追加しよう</Text>
              <Text style={styles.emptyBody}>
                無料トライアルを登録すると、{'\n'}終了前日に通知します。
              </Text>
            </View>
          }
          contentContainerStyle={subscriptions.length === 0 ? styles.emptyContainer : undefined}
        />
      </View>
      <Pressable style={styles.fab} onPress={() => router.push('/add')}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
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
  testButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#C0C0C0',
  },
  testButtonText: {
    color: '#888',
    fontWeight: '500',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5C8A6E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
});

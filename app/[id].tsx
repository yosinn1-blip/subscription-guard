import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  loadAll,
  updateSubscription,
  deleteSubscription,
} from '../src/storage/subscriptions';
import {
  scheduleTrialReminder,
  cancelReminder,
} from '../src/notifications/scheduler';
import type { Subscription } from '../src/types/subscription';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');

  useEffect(() => {
    (async () => {
      const all = await loadAll();
      const found = all.find((s) => s.id === id) ?? null;
      setSub(found);
      if (found) {
        setCancelNotes(found.cancelNotes ?? '');
        setCancelUrl(found.cancelUrl ?? '');
      }
    })();
  }, [id]);

  if (!sub) return null;

  const handleSave = async () => {
    const updated = await updateSubscription(id, {
      cancelNotes: cancelNotes || null,
      cancelUrl: cancelUrl || null,
    });
    if (updated.status === 'trial' && updated.trialEndDate) {
      await scheduleTrialReminder(updated);
    }
    router.back();
  };

  const handleMarkCancelled = async () => {
    Alert.alert('解約済みにする', `${sub.name} を解約済みにしますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '解約済みにする',
        style: 'destructive',
        onPress: async () => {
          await updateSubscription(id, { status: 'cancelled' });
          await cancelReminder(id);
          router.back();
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('削除', `${sub.name} を完全に削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteSubscription(id);
          await cancelReminder(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.name}>{sub.name}</Text>
        {sub.price > 0 && (
          <Text style={styles.price}>¥{sub.price.toLocaleString()}/月</Text>
        )}

        <Text style={styles.sectionTitle}>解約情報</Text>

        <Text style={styles.label}>解約ページURL</Text>
        <TextInput
          style={styles.input}
          value={cancelUrl}
          onChangeText={setCancelUrl}
          placeholder="https://..."
          keyboardType="url"
          autoCapitalize="none"
          placeholderTextColor="#bbb"
        />
        {cancelUrl ? (
          <Pressable onPress={() => Linking.openURL(cancelUrl)}>
            <Text style={styles.link}>解約ページを開く →</Text>
          </Pressable>
        ) : null}

        <Text style={styles.label}>解約手順メモ</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={cancelNotes}
          onChangeText={setCancelNotes}
          placeholder="例: アカウント設定 → プラン管理 → キャンセル"
          multiline
          numberOfLines={4}
          placeholderTextColor="#bbb"
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存する</Text>
        </Pressable>

        <Pressable style={styles.cancelledButton} onPress={handleMarkCancelled}>
          <Text style={styles.cancelledButtonText}>解約済みにする</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>削除する</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F0' },
  scroll: { padding: 16, paddingBottom: 60 },
  name: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  price: { fontSize: 16, color: '#888', marginBottom: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
  },
  label: { fontSize: 14, color: '#555', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  link: { color: '#5C8A6E', fontSize: 14, marginTop: 6, fontWeight: '500' },
  saveButton: {
    backgroundColor: '#5C8A6E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelledButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelledButtonText: { color: '#555', fontSize: 15, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: { color: '#C0392B', fontSize: 15, fontWeight: '600' },
});

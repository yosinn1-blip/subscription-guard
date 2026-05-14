import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addSubscription } from '../src/storage/subscriptions';
import { scheduleTrialReminder } from '../src/notifications/scheduler';
import { ServiceEntry } from '../src/data/services';
import ServiceGrid from '../src/components/ServiceGrid';
import DatePickerField from '../src/components/DatePickerField';

type StatusOption = 'trial' | 'active';

export default function AddScreen() {
  const router = useRouter();

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<StatusOption>('trial');
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [cancelUrl, setCancelUrl] = useState('');

  const isCustomService = selectedServiceId === '__other__' || selectedServiceId === null;

  const handleServiceSelect = (service: ServiceEntry | null) => {
    if (service === null) {
      setSelectedServiceId('__other__');
      setName('');
      setPrice('');
      setCancelUrl('');
    } else {
      setSelectedServiceId(service.id);
      setName(service.name);
      setPrice(service.defaultPrice > 0 ? String(service.defaultPrice) : '');
      setCancelUrl(service.cancelUrl ?? '');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', 'サービス名を入力してください');
      return;
    }

    const sub = await addSubscription({
      name: name.trim(),
      price: price ? parseInt(price, 10) : 0,
      status,
      trialEndDate: status === 'trial' ? trialEndDate : null,
      nextBillingDate,
      cancelUrl: cancelUrl || null,
      cancelNotes: null,
      notifyDaysBefore: 1,
    });

    if (sub.status === 'trial' && sub.trialEndDate) {
      await scheduleTrialReminder(sub);
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>サービスを選ぶ</Text>
        <ServiceGrid selectedId={selectedServiceId} onSelect={handleServiceSelect} />

        <Text style={styles.label}>サービス名 *</Text>
        <TextInput
          style={[styles.input, !isCustomService && styles.inputReadonly]}
          value={name}
          onChangeText={isCustomService ? setName : undefined}
          editable={isCustomService}
          placeholder="サービス名を入力"
          placeholderTextColor="#bbb"
        />

        <Text style={styles.label}>月額（円）</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="例: 1590"
          keyboardType="number-pad"
          placeholderTextColor="#bbb"
        />

        <Text style={styles.label}>ステータス</Text>
        <View style={styles.segmentRow}>
          {(['trial', 'active'] as StatusOption[]).map((opt) => (
            <Pressable
              key={opt}
              style={[styles.segment, status === opt && styles.segmentActive]}
              onPress={() => setStatus(opt)}
            >
              <Text style={[styles.segmentText, status === opt && styles.segmentTextActive]}>
                {opt === 'trial' ? '無料トライアル' : '通常課金'}
              </Text>
            </Pressable>
          ))}
        </View>

        {status === 'trial' && (
          <>
            <Text style={styles.label}>トライアル終了日</Text>
            <DatePickerField value={trialEndDate} onChange={setTrialEndDate} />
          </>
        )}

        <Text style={styles.label}>次回請求日</Text>
        <DatePickerField value={nextBillingDate} onChange={setNextBillingDate} />

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

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存する</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F0' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
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
  inputReadonly: {
    color: '#888',
    backgroundColor: '#F8F8F8',
  },
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  segmentActive: { backgroundColor: '#5C8A6E', borderColor: '#5C8A6E' },
  segmentText: { fontSize: 14, color: '#555', fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
  saveButton: {
    backgroundColor: '#5C8A6E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

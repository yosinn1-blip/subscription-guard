import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addSubscription } from '../src/storage/subscriptions';
import { scheduleTrialReminder } from '../src/notifications/scheduler';
import { ServiceEntry, ServicePlan } from '../src/data/services';
import ServiceGrid from '../src/components/ServiceGrid';
import ServiceLogo from '../src/components/ServiceLogo';
import DatePickerField from '../src/components/DatePickerField';

const { width } = Dimensions.get('window');

export default function AddScreen() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 0
  const [selectedService, setSelectedService] = useState<ServiceEntry | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  // Step 1
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Step 2
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [cancelUrl, setCancelUrl] = useState('');

  function goNext() {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStep((s) => (s + 1) as 0 | 1 | 2);
      slideAnim.setValue(width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }

  function goBack() {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStep((s) => (s - 1) as 0 | 1 | 2);
      slideAnim.setValue(-width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }

  function handleServiceSelect(service: ServiceEntry | null) {
    if (service === null) {
      setIsCustom(true);
      setSelectedService(null);
      setSelectedPlan(null);
      setCancelUrl('');
    } else {
      setIsCustom(false);
      setSelectedService(service);
      setSelectedPlan(service.plans.length === 1 ? service.plans[0] : null);
      setCancelUrl(service.cancelUrl ?? '');
    }
    goNext();
  }

  function handleStep1Next() {
    if (isCustom && !customName.trim()) {
      Alert.alert('エラー', 'サービス名を入力してください');
      return;
    }
    if (!isCustom && !selectedPlan && selectedService && selectedService.plans.length > 1) {
      Alert.alert('エラー', 'プランを選択してください');
      return;
    }
    goNext();
  }

  async function handleSave() {
    const name = isCustom ? customName.trim() : (selectedService?.name ?? '');
    const price = isCustom
      ? parseInt(customPrice, 10) || 0
      : (selectedPlan?.price ?? selectedService?.plans[0]?.price ?? 0);

    const sub = await addSubscription({
      name,
      price,
      status: 'trial',
      trialEndDate,
      cancelUrl: cancelUrl || null,
      notifyDaysBefore: 1,
    });

    if (sub.trialEndDate) {
      await scheduleTrialReminder(sub);
    }

    router.back();
  }

  const stepContent = [
    // Step 0: Service selection
    <ScrollView key="step0" contentContainerStyle={styles.stepScroll}>
      <Text style={styles.stepTitle}>サービスを選ぶ</Text>
      <ServiceGrid selectedId={null} onSelect={handleServiceSelect} />
    </ScrollView>,

    // Step 1: Plan & price
    <ScrollView key="step1" contentContainerStyle={styles.stepScroll}>
      {selectedService && (
        <View style={styles.serviceHeader}>
          <View style={[styles.serviceHeaderLogo, { backgroundColor: selectedService.color }]}>
            <ServiceLogo iconSlug={selectedService.iconSlug} size={28} color="#fff" fallback={selectedService.name[0]} />
          </View>
          <Text style={styles.serviceHeaderName}>{selectedService.name}</Text>
        </View>
      )}
      {isCustom ? (
        <>
          <Text style={styles.label}>サービス名 *</Text>
          <TextInput
            style={styles.input}
            value={customName}
            onChangeText={setCustomName}
            placeholder="例: Netflix"
            placeholderTextColor="#bbb"
          />
          <Text style={styles.label}>月額（円）</Text>
          <TextInput
            style={styles.input}
            value={customPrice}
            onChangeText={setCustomPrice}
            placeholder="例: 1590"
            keyboardType="number-pad"
            placeholderTextColor="#bbb"
          />
        </>
      ) : selectedService && selectedService.plans.length > 1 ? (
        <>
          <Text style={styles.label}>プランを選ぶ</Text>
          {selectedService.plans.map((plan) => (
            <Pressable
              key={plan.name}
              style={[styles.planRow, selectedPlan?.name === plan.name && styles.planRowActive]}
              onPress={() => setSelectedPlan(plan)}
            >
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>¥{plan.price.toLocaleString()}/月</Text>
              {selectedPlan?.name === plan.name && <Text style={styles.planCheck}>✓</Text>}
            </Pressable>
          ))}
        </>
      ) : selectedService ? (
        <View style={styles.singlePlanBox}>
          <Text style={styles.singlePlanName}>{selectedService.plans[0].name}</Text>
          <Text style={styles.singlePlanPrice}>¥{selectedService.plans[0].price.toLocaleString()}/月</Text>
        </View>
      ) : null}
      <View style={styles.navRow}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>戻る</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleStep1Next}>
          <Text style={styles.nextButtonText}>次へ</Text>
        </Pressable>
      </View>
    </ScrollView>,

    // Step 2: Trial end date
    <ScrollView key="step2" contentContainerStyle={styles.stepScroll}>
      <Text style={styles.stepTitle}>トライアル終了日</Text>
      <DatePickerField value={trialEndDate} onChange={setTrialEndDate} />
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
      <View style={styles.navRow}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>戻る</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存する</Text>
        </Pressable>
      </View>
    </ScrollView>,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.indicator}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>
      <Animated.View style={[styles.slide, { transform: [{ translateX: slideAnim }] }]}>
        {stepContent[step]}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F0' },
  indicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  dotActive: { backgroundColor: '#5C8A6E' },
  slide: { flex: 1 },
  stepScroll: { padding: 16, paddingBottom: 40 },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  serviceHeaderLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceHeaderName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
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
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planRowActive: { borderColor: '#5C8A6E' },
  planName: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  planPrice: { fontSize: 15, color: '#555', marginRight: 8 },
  planCheck: { fontSize: 16, color: '#5C8A6E', fontWeight: '700' },
  singlePlanBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  singlePlanName: { fontSize: 15, color: '#1a1a1a' },
  singlePlanPrice: { fontSize: 15, fontWeight: '600', color: '#5C8A6E' },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButtonText: { color: '#555', fontSize: 16, fontWeight: '600' },
  nextButton: {
    flex: 2,
    backgroundColor: '#5C8A6E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  saveButton: {
    flex: 2,
    backgroundColor: '#5C8A6E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Subscription } from '../types/subscription';
import { formatDate, isUrgent } from '../utils/dates';
import DaysLeftBadge from './DaysLeftBadge';

interface Props {
  subscription: Subscription;
  onPress: () => void;
}

export default function SubscriptionCard({ subscription, onPress }: Props) {
  const { name, price, trialEndDate, status } = subscription;
  const urgent = isUrgent(trialEndDate);

  return (
    <Pressable
      style={[styles.card, urgent && styles.urgentCard]}
      onPress={onPress}
      android_ripple={{ color: '#e0e0e0' }}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {trialEndDate && <DaysLeftBadge isoDate={trialEndDate} />}
      </View>
      {status === 'trial' && trialEndDate && (
        <Text style={styles.sub}>{formatDate(trialEndDate)}に自動課金開始</Text>
      )}
      {price > 0 && <Text style={styles.price}>¥{price.toLocaleString()}/月</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#C0392B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  sub: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginTop: 6,
  },
});

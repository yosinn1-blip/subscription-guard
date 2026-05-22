import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import type { Subscription } from '../types/subscription';
import { formatDate, isUrgent } from '../utils/dates';
import DaysLeftBadge from './DaysLeftBadge';
import ServiceLogo from './ServiceLogo';

interface Props {
  subscription: Subscription;
  onPress: () => void;
}

export default function SubscriptionCard({ subscription, onPress }: Props) {
  const { name, price, trialEndDate, cancelUrl, iconSlug, color } = subscription;
  const urgent = isUrgent(trialEndDate);
  const showCancelButton = urgent && !!cancelUrl;

  return (
    <Pressable
      style={[styles.card, urgent && styles.urgentCard]}
      onPress={onPress}
      android_ripple={{ color: '#e0e0e0' }}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          {iconSlug && color && (
            <View style={[styles.logoBox, { backgroundColor: color }]}>
              <ServiceLogo iconSlug={iconSlug} size={18} color="#fff" fallback={name[0]} />
            </View>
          )}
          <Text style={styles.name}>{name}</Text>
        </View>
        {trialEndDate && <DaysLeftBadge isoDate={trialEndDate} />}
      </View>
      {trialEndDate && (
        <Text style={styles.sub}>{formatDate(trialEndDate)}に自動課金開始</Text>
      )}
      {price > 0 && <Text style={styles.price}>¥{price.toLocaleString()}/月</Text>}
      {showCancelButton && (
        <Pressable
          style={styles.cancelButton}
          onPress={() => Linking.openURL(cancelUrl!)}
        >
          <Text style={styles.cancelButtonText}>解約ページへ →</Text>
        </Pressable>
      )}
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
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
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#C0392B',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

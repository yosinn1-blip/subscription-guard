import { View, Text, StyleSheet } from 'react-native';
import { daysUntil } from '../utils/dates';

interface Props {
  isoDate: string;
}

export default function DaysLeftBadge({ isoDate }: Props) {
  const days = daysUntil(isoDate);
  if (days < 0) return null;

  const urgent = days <= 3;
  const label = days === 0 ? '今日' : days === 1 ? '明日' : `あと${days}日`;

  return (
    <View style={[styles.badge, urgent && styles.urgentBadge]}>
      <Text style={[styles.text, urgent && styles.urgentText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#E8F0EC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  urgentBadge: {
    backgroundColor: '#FFE4E4',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C8A6E',
  },
  urgentText: {
    color: '#C0392B',
  },
});

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatDate, addDays, addMonths } from '../utils/dates';

interface Props {
  value: string | null;
  onChange: (date: string | null) => void;
}

type PresetKey = '7' | '14' | '30' | 'custom';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: '7',      label: '1週間後' },
  { key: '14',     label: '2週間後' },
  { key: '30',     label: '1ヶ月後' },
  { key: 'custom', label: 'カスタム' },
];

function presetToDate(key: PresetKey): string {
  if (key === '7')  return addDays(7);
  if (key === '14') return addDays(14);
  if (key === '30') return addMonths(1);
  return addMonths(1);
}

export default function DatePickerField({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);

  const handlePreset = (key: PresetKey) => {
    if (key === 'custom') {
      setActivePreset('custom');
      setShowPicker(true);
      return;
    }
    if (activePreset === key) {
      setActivePreset(null);
      setShowPicker(false);
      onChange(null);
      return;
    }
    setActivePreset(key);
    setShowPicker(false);
    onChange(presetToDate(key));
  };

  const handlePickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) {
      onChange(date.toISOString().slice(0, 10));
    }
  };

  return (
    <View>
      <View style={styles.row}>
        {PRESETS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.btn, activePreset === key && styles.btnActive]}
            onPress={() => handlePreset(key)}
          >
            <Text style={[styles.btnText, activePreset === key && styles.btnTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {value && activePreset !== 'custom' && (
        <Text style={styles.selected}>✓ {formatDate(value)}</Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="inline"
          minimumDate={new Date()}
          onChange={handlePickerChange}
          locale="ja-JP"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginTop: 4 },
  btn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  btnActive: { backgroundColor: '#5C8A6E', borderColor: '#5C8A6E' },
  btnText: { fontSize: 12, color: '#555', fontWeight: '500' },
  btnTextActive: { color: '#fff' },
  selected: { fontSize: 13, color: '#5C8A6E', fontWeight: '600', marginTop: 6 },
});

import { View, Text, Pressable, FlatList, StyleSheet, Dimensions } from 'react-native';
import { SERVICES, ServiceEntry } from '../data/services';
import ServiceLogo from './ServiceLogo';

interface Props {
  selectedId: string | null;
  onSelect: (service: ServiceEntry | null) => void;
}

const COLS = 3;
const CELL_SIZE = (Dimensions.get('window').width - 32 - 12) / COLS;

type GridItem = ServiceEntry | { id: '__other__' };

const GRID_DATA: GridItem[] = [...SERVICES, { id: '__other__' }];

export default function ServiceGrid({ selectedId, onSelect }: Props) {
  const renderItem = ({ item }: { item: GridItem }) => {
    if (item.id === '__other__') {
      const isActive = selectedId === '__other__';
      return (
        <Pressable
          style={[styles.cell, isActive && styles.cellActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={styles.otherIcon}>✏️</Text>
          <Text style={styles.name}>その他</Text>
        </Pressable>
      );
    }

    const svc = item as ServiceEntry;
    const isActive = selectedId === svc.id;

    return (
      <Pressable
        style={[styles.cell, isActive && styles.cellActive]}
        onPress={() => onSelect(svc)}
      >
        <View style={[styles.iconBg, { backgroundColor: svc.color }]}>
          <ServiceLogo iconSlug={svc.iconSlug} size={28} color="#fff" fallback={svc.name[0]} />
        </View>
        <Text style={styles.name} numberOfLines={1}>{svc.name}</Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={GRID_DATA}
      keyExtractor={(item) => item.id}
      numColumns={COLS}
      renderItem={renderItem}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, marginBottom: 6 },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cellActive: { borderColor: '#5C8A6E' },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  otherIcon: { fontSize: 22, marginBottom: 4 },
  name: { fontSize: 10, color: '#444', fontWeight: '500', textAlign: 'center' },
});

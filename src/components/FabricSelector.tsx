import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Fabric } from '../data/clothingData';

interface Props {
  fabrics: Fabric[];
  selectedId: string;
  selectedColor: string;
  onSelectFabric: (id: string) => void;
  onSelectColor: (color: string) => void;
}

export function FabricSelector({ fabrics, selectedId, selectedColor, onSelectFabric, onSelectColor }: Props) {
  const activeFabric = fabrics.find((f) => f.id === selectedId);

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {fabrics.map((fab) => {
          const active = fab.id === selectedId;
          return (
            <TouchableOpacity
              key={fab.id}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => onSelectFabric(fab.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.emoji}>{fab.emoji}</Text>
              <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>{fab.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {activeFabric && (
        <View style={styles.colorRow}>
          <Text style={styles.colorLabel}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
            {activeFabric.colorOptions.map((c) => {
              const active = c === selectedColor;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, active && styles.colorDotActive]}
                  onPress={() => onSelectColor(c)}
                  activeOpacity={0.8}
                >
                  {active && <View style={styles.colorCheck} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  row: { paddingHorizontal: 16, gap: 10, paddingVertical: 4 },
  card: {
    alignItems: 'center',
    width: 68,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: '#1C2030',
    borderWidth: 1.5,
    borderColor: '#2A2E40',
    gap: 5,
  },
  cardActive: { backgroundColor: '#1E2640', borderColor: '#C8A96E' },
  emoji: { fontSize: 20 },
  name: { color: '#8892A4', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  nameActive: { color: '#C8A96E' },
  colorRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, gap: 10 },
  colorLabel: { color: '#8892A4', fontSize: 12, fontWeight: '600', width: 40 },
  colorScroll: { gap: 10, paddingRight: 16, paddingVertical: 4 },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDotActive: { borderColor: '#C8A96E' },
  colorCheck: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.7)' },
});

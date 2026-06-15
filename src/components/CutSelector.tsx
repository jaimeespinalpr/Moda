import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { ClothingCut } from '../data/clothingData';

interface Props {
  cuts: ClothingCut[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function CutSelector({ cuts, selectedId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {cuts.map((cut) => {
        const active = cut.id === selectedId;
        return (
          <TouchableOpacity
            key={cut.id}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onSelect(cut.id)}
            activeOpacity={0.75}
          >
            <Text style={styles.emoji}>{cut.emoji}</Text>
            <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>{cut.name}</Text>
            {active && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 10, paddingVertical: 8 },
  card: {
    alignItems: 'center',
    width: 72,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: '#1C2030',
    borderWidth: 1.5,
    borderColor: '#2A2E40',
    gap: 5,
  },
  cardActive: {
    backgroundColor: '#1E2640',
    borderColor: '#C8A96E',
  },
  emoji: { fontSize: 22 },
  name: { color: '#8892A4', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  nameActive: { color: '#C8A96E' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#C8A96E' },
});

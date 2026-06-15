import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FABRICS, FABRIC_CATEGORIES } from '../../constants/fabrics';
import { FabricMaterial } from '../../types';
import { useDesignStore } from '../../store/designStore';

export default function FabricLibrary() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedFabric, setSelectedFabric] = useState<FabricMaterial | null>(null);
  const { selectedGarmentId, updateGarmentMaterial, garments } = useDesignStore();

  const filtered = activeCategory === 'all'
    ? FABRICS
    : FABRICS.filter((f) => f.category === activeCategory);

  const applyFabric = (fabric: FabricMaterial) => {
    if (!selectedGarmentId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateGarmentMaterial(selectedGarmentId, fabric);
  };

  const selectedGarment = garments.find((g) => g.id === selectedGarmentId);

  return (
    <View style={styles.container}>
      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[styles.catChip, activeCategory === 'all' && styles.activeCatChip]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[styles.catText, activeCategory === 'all' && styles.activeCatText]}>All</Text>
        </TouchableOpacity>
        {FABRIC_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.activeCatChip]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.activeCatText]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected garment banner */}
      {selectedGarment ? (
        <View style={styles.selectedBanner}>
          <View style={[styles.bannerDot, { backgroundColor: selectedGarment.material.color }]} />
          <Text style={styles.bannerText}>
            Applying to: <Text style={styles.bannerGarment}>{selectedGarment.name}</Text>
          </Text>
        </View>
      ) : (
        <View style={styles.noSelectionBanner}>
          <Text style={styles.noSelectionText}>Select a garment in the Designer tab first</Text>
        </View>
      )}

      {/* Fabric Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(f) => f.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item: fabric }) => (
          <TouchableOpacity
            style={[
              styles.fabricCard,
              selectedFabric?.id === fabric.id && styles.selectedCard,
              selectedGarment?.material.id === fabric.id && styles.appliedCard,
            ]}
            onPress={() => {
              setSelectedFabric(fabric);
              applyFabric(fabric);
            }}
            activeOpacity={0.8}
          >
            {/* Color swatch */}
            <View style={[styles.swatch, { backgroundColor: fabric.color }]}>
              {/* Fabric texture overlay hints */}
              {fabric.weight === 'heavy' && (
                <View style={styles.textureLines} />
              )}
              {fabric.category === 'silk' && (
                <View style={styles.shineOverlay} />
              )}
            </View>

            <View style={styles.fabricInfo}>
              <Text style={styles.fabricName} numberOfLines={1}>{fabric.name}</Text>
              <Text style={styles.fabricCategory}>
                {fabric.category} · {fabric.weight}
              </Text>
              <View style={styles.materialBar}>
                <View style={styles.materialBarLabel}>
                  <Text style={styles.materialBarText}>R</Text>
                </View>
                <View style={[styles.materialBarFill, { width: `${fabric.roughness * 100}%`, backgroundColor: '#7090C0' }]} />
              </View>
              <View style={styles.materialBar}>
                <View style={styles.materialBarLabel}>
                  <Text style={styles.materialBarText}>M</Text>
                </View>
                <View style={[styles.materialBarFill, { width: `${(fabric.metalness + 0.1) * 100}%`, backgroundColor: '#FFD060' }]} />
              </View>
            </View>

            {selectedGarment?.material.id === fabric.id && (
              <View style={styles.appliedBadge}>
                <Text style={styles.appliedBadgeText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Detail panel */}
      {selectedFabric && (
        <View style={styles.detailPanel}>
          <View style={[styles.detailSwatch, { backgroundColor: selectedFabric.color }]} />
          <View style={styles.detailInfo}>
            <Text style={styles.detailName}>{selectedFabric.name}</Text>
            <Text style={styles.detailDesc} numberOfLines={2}>{selectedFabric.description}</Text>
          </View>
          {selectedGarmentId && (
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => applyFabric(selectedFabric)}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B1E',
  },
  categories: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,100,180,0.15)',
  },
  categoriesContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(30,40,80,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.2)',
    marginRight: 6,
  },
  activeCatChip: {
    backgroundColor: '#E94560',
    borderColor: '#E94560',
  },
  catText: {
    color: '#6070A0',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCatText: {
    color: '#FFFFFF',
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(233,69,96,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233,69,96,0.2)',
    gap: 8,
  },
  bannerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bannerText: {
    color: '#A090B0',
    fontSize: 12,
  },
  bannerGarment: {
    color: '#E0C0C8',
    fontWeight: '700',
  },
  noSelectionBanner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(40,50,90,0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,100,180,0.15)',
  },
  noSelectionText: {
    color: '#5060A0',
    fontSize: 12,
    textAlign: 'center',
  },
  grid: {
    padding: 8,
    gap: 8,
  },
  fabricCard: {
    flex: 1,
    margin: 4,
    backgroundColor: 'rgba(15,20,50,0.8)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(60,80,150,0.2)',
  },
  selectedCard: {
    borderColor: '#8899DD',
  },
  appliedCard: {
    borderColor: '#E94560',
  },
  swatch: {
    height: 90,
    overflow: 'hidden',
  },
  textureLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderColor: 'rgba(0,0,0,0.08)',
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: '30%',
    right: '60%',
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ skewX: '-20deg' }],
  },
  fabricInfo: {
    padding: 10,
    gap: 3,
  },
  fabricName: {
    color: '#D0D8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  fabricCategory: {
    color: '#5060A0',
    fontSize: 10,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  materialBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 6,
    gap: 4,
    marginVertical: 1,
  },
  materialBarLabel: {
    width: 10,
  },
  materialBarText: {
    color: '#4050A0',
    fontSize: 7,
    fontWeight: '700',
  },
  materialBarFill: {
    height: 4,
    borderRadius: 2,
    maxWidth: '90%',
  },
  appliedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E94560',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(15,20,50,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(80,100,180,0.2)',
    gap: 12,
  },
  detailSwatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    color: '#D0D8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  detailDesc: {
    color: '#5060A0',
    fontSize: 11,
    marginTop: 2,
  },
  applyBtn: {
    backgroundColor: '#E94560',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

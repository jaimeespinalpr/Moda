import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDesignStore } from '../../store/designStore';
import { GARMENT_TEMPLATES } from '../../constants/garments';
import { FABRICS } from '../../constants/fabrics';
import { GarmentType } from '../../types';

export default function GarmentPanel() {
  const {
    garments, addGarment, removeGarment, toggleGarmentVisibility,
    selectGarment, selectedGarmentId, updateGarmentMaterial,
  } = useDesignStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showFabric, setShowFabric] = useState(false);

  const onAddGarment = (type: GarmentType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addGarment(type);
    setShowAdd(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Garments</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {garments.length === 0 && (
          <Text style={styles.empty}>Tap "+ Add" to add a garment</Text>
        )}
        {garments.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.garmentItem, selectedGarmentId === g.id && styles.selected]}
            onPress={() => selectGarment(selectedGarmentId === g.id ? null : g.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.colorDot, { backgroundColor: g.material.color }]} />
            <View style={styles.garmentInfo}>
              <Text style={styles.garmentName}>{g.name}</Text>
              <Text style={styles.garmentMaterial}>{g.material.name}</Text>
            </View>
            <View style={styles.garmentActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => { Haptics.selectionAsync(); toggleGarmentVisibility(g.id); }}
              >
                <Text style={styles.actionIcon}>{g.visible ? '👁' : '🚫'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  selectGarment(g.id);
                  setShowFabric(true);
                }}
              >
                <Text style={styles.actionIcon}>🎨</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  removeGarment(g.id);
                }}
              >
                <Text style={styles.actionIcon}>🗑</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Garment Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowAdd(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Choose Garment Type</Text>
            <ScrollView style={styles.templateList}>
              {GARMENT_TEMPLATES.map((t) => (
                <TouchableOpacity
                  key={t.type}
                  style={styles.templateItem}
                  onPress={() => onAddGarment(t.type)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.templateIcon}>{t.icon}</Text>
                  <View>
                    <Text style={styles.templateName}>{t.name}</Text>
                    <Text style={styles.templateDesc}>{t.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fabric Selector Modal */}
      <Modal visible={showFabric} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowFabric(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Choose Fabric</Text>
            <ScrollView style={styles.fabricList}>
              {FABRICS.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={styles.fabricItem}
                  onPress={() => {
                    if (selectedGarmentId) {
                      Haptics.selectionAsync();
                      updateGarmentMaterial(selectedGarmentId, f);
                    }
                    setShowFabric(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.fabricSwatch, { backgroundColor: f.color }]} />
                  <View style={styles.fabricInfo}>
                    <Text style={styles.fabricName}>{f.name}</Text>
                    <Text style={styles.fabricDesc}>{f.description}</Text>
                  </View>
                  <Text style={styles.fabricCategory}>{f.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(10,12,28,0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,120,200,0.2)',
  },
  title: {
    color: '#E0E8FF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addBtn: {
    backgroundColor: '#E94560',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  empty: {
    color: '#556080',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  garmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(50,60,100,0.3)',
    gap: 10,
  },
  selected: {
    backgroundColor: 'rgba(233,69,96,0.12)',
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  garmentInfo: {
    flex: 1,
  },
  garmentName: {
    color: '#D0D8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  garmentMaterial: {
    color: '#6070A0',
    fontSize: 11,
    marginTop: 1,
  },
  garmentActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#0F1428',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '75%',
    borderTopWidth: 1,
    borderColor: 'rgba(100,120,200,0.2)',
  },
  modalTitle: {
    color: '#E0E8FF',
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  templateList: {
    paddingHorizontal: 12,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(30,40,80,0.6)',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(100,120,200,0.15)',
  },
  templateIcon: {
    fontSize: 28,
  },
  templateName: {
    color: '#D0D8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  templateDesc: {
    color: '#5060A0',
    fontSize: 12,
    marginTop: 2,
  },
  fabricList: {
    paddingHorizontal: 12,
  },
  fabricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(25,30,60,0.6)',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(100,120,200,0.12)',
  },
  fabricSwatch: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  fabricInfo: {
    flex: 1,
  },
  fabricName: {
    color: '#D0D8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  fabricDesc: {
    color: '#5060A0',
    fontSize: 11,
    marginTop: 2,
  },
  fabricCategory: {
    color: '#7080B0',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

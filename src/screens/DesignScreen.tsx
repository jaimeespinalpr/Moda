import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  Alert, Platform, StatusBar, SafeAreaView, ScrollView,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { cacheDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { ClothingViewer3D } from '../components/ClothingViewer3D';
import { CutSelector } from '../components/CutSelector';
import { FabricSelector } from '../components/FabricSelector';
import { SHIRT_CUTS, PANTS_CUTS, FABRICS } from '../data/clothingData';
import { useDesignStore } from '../store/designStore';

type TabId = 'shirt-cut' | 'pants-cut' | 'shirt-fabric' | 'pants-fabric';

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'shirt-cut',    label: 'Corte Camisa', emoji: '✂️' },
  { id: 'pants-cut',   label: 'Corte Pantalón', emoji: '📐' },
  { id: 'shirt-fabric', label: 'Tela Camisa',  emoji: '🧵' },
  { id: 'pants-fabric', label: 'Tela Pantalón', emoji: '🪡' },
];

interface DesignScreenProps {
  onGoToSaved: () => void;
}

export function DesignScreen({ onGoToSaved }: DesignScreenProps) {
  const viewerRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<TabId>('shirt-cut');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [designName, setDesignName] = useState('');
  const [capturedB64, setCapturedB64] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const store = useDesignStore();
  const { toggleMannequin, showMannequin } = store;

  const handleCapture = useCallback((base64: string) => {
    setCapturedB64(base64);
  }, []);

  const handleSave = useCallback(async () => {
    if (!designName.trim()) return;
    setIsSaving(true);
    try {
      viewerRef.current?.capture();
      await new Promise(r => setTimeout(r, 300));
      await store.saveDesign(designName.trim(), capturedB64 ?? undefined);
      setShowSaveModal(false);
      setDesignName('');
      Alert.alert('Guardado', 'Tu diseño fue guardado exitosamente.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar el diseño.');
    } finally {
      setIsSaving(false);
    }
  }, [designName, store, capturedB64]);

  const handleExport = useCallback(async () => {
    viewerRef.current?.capture();
    await new Promise(r => setTimeout(r, 400));
    if (!capturedB64) {
      Alert.alert('Aviso', 'Espera a que cargue el visor 3D antes de exportar.');
      return;
    }
    try {
      const base64Data = capturedB64.replace('data:image/png;base64,', '');
      const uri = (cacheDirectory ?? '') + 'moda_export.png';
      await writeAsStringAsync(uri, base64Data, { encoding: EncodingType.Base64 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert('Exportado', 'Imagen guardada en tu galería.');
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo exportar el diseño.');
    }
  }, [capturedB64]);

  const renderPanelContent = () => {
    switch (activeTab) {
      case 'shirt-cut':
        return <CutSelector cuts={SHIRT_CUTS} selectedId={store.shirtCutId} onSelect={store.setShirtCut} />;
      case 'pants-cut':
        return <CutSelector cuts={PANTS_CUTS} selectedId={store.pantsCutId} onSelect={store.setPantsCut} />;
      case 'shirt-fabric':
        return (
          <FabricSelector
            fabrics={FABRICS}
            selectedId={store.shirtFabricId}
            selectedColor={store.shirtColor}
            onSelectFabric={store.setShirtFabric}
            onSelectColor={store.setShirtColor}
          />
        );
      case 'pants-fabric':
        return (
          <FabricSelector
            fabrics={FABRICS}
            selectedId={store.pantsFabricId}
            selectedColor={store.pantsColor}
            onSelectFabric={store.setPantsFabric}
            onSelectColor={store.setPantsColor}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0F16" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>MODA</Text>
          <Text style={styles.subtitle}>Diseñador 3D</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowSaveModal(true)}>
            <Text style={styles.headerBtnText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, styles.headerBtnGold]} onPress={handleExport}>
            <Text style={[styles.headerBtnText, styles.headerBtnTextGold]}>Exportar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={onGoToSaved}>
            <Text style={styles.headerBtnText}>📁</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Visibility toggles */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, store.showShirt && styles.toggleActive]}
          onPress={store.toggleShirt}
        >
          <Text style={[styles.toggleText, store.showShirt && styles.toggleTextActive]}>👕 Camisa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, store.showPants && styles.toggleActive]}
          onPress={store.togglePants}
        >
          <Text style={[styles.toggleText, store.showPants && styles.toggleTextActive]}>👖 Pantalón</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, showMannequin && styles.toggleActive]}
          onPress={toggleMannequin}
        >
          <Text style={[styles.toggleText, showMannequin && styles.toggleTextActive]}>🧍 Maniquí</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={() => viewerRef.current?.reset()}>
          <Text style={styles.resetText}>↺ Reset</Text>
        </TouchableOpacity>
      </View>

      {/* 3D Viewer */}
      <View style={styles.viewer}>
        <ClothingViewer3D ref={viewerRef} onCapture={handleCapture} />
        <View style={styles.hint}>
          <Text style={styles.hintText}>Arrastra para rotar · Pellizca para zoom</Text>
        </View>
      </View>

      {/* Panel Tabs */}
      <View style={styles.panel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.panelContent}>
          {renderPanelContent()}
        </View>
      </View>

      {/* Save Modal */}
      <Modal visible={showSaveModal} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSaveModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modal}>
            <Text style={styles.modalTitle}>Guardar diseño</Text>
            <TextInput
              style={styles.input}
              value={designName}
              onChangeText={setDesignName}
              placeholder="Nombre del diseño…"
              placeholderTextColor="#4A5068"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowSaveModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, !designName.trim() && styles.modalSaveDisabled]}
                onPress={handleSave}
                disabled={!designName.trim() || isSaving}
              >
                <Text style={styles.modalSaveText}>{isSaving ? 'Guardando…' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0F16' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  brand: { color: '#C8A96E', fontSize: 22, fontWeight: '800', letterSpacing: 4 },
  subtitle: { color: '#4A5068', fontSize: 11, fontWeight: '500', letterSpacing: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
    backgroundColor: '#1C2030', borderWidth: 1, borderColor: '#2A2E40',
  },
  headerBtnGold: { backgroundColor: '#1E1A0E', borderColor: '#C8A96E' },
  headerBtnText: { color: '#8892A4', fontSize: 13, fontWeight: '600' },
  headerBtnTextGold: { color: '#C8A96E' },
  toggleRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8, alignItems: 'center',
  },
  toggle: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#1C2030', borderWidth: 1, borderColor: '#2A2E40',
  },
  toggleActive: { borderColor: '#C8A96E', backgroundColor: '#1E1A0E' },
  toggleText: { color: '#8892A4', fontSize: 12, fontWeight: '600' },
  toggleTextActive: { color: '#C8A96E' },
  resetBtn: { marginLeft: 'auto' as any },
  resetText: { color: '#4A5068', fontSize: 12 },
  viewer: { flex: 1, position: 'relative' },
  hint: {
    position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center',
  },
  hintText: { color: '#2A2E40', fontSize: 11 },
  panel: {
    backgroundColor: '#111318',
    borderTopWidth: 1,
    borderTopColor: '#1C2030',
    paddingTop: 8,
    paddingBottom: 16,
  },
  tabs: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1C2030', borderWidth: 1, borderColor: '#2A2E40',
  },
  tabActive: { borderColor: '#C8A96E', backgroundColor: '#1E1A0E' },
  tabEmoji: { fontSize: 14 },
  tabLabel: { color: '#8892A4', fontSize: 12, fontWeight: '600' },
  tabLabelActive: { color: '#C8A96E' },
  panelContent: { minHeight: 110 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modal: {
    backgroundColor: '#1C2030', borderRadius: 20, padding: 24,
    width: '85%', borderWidth: 1, borderColor: '#2A2E40',
  },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: {
    backgroundColor: '#111318', borderRadius: 12, padding: 14,
    color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2A2E40', marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#111318', alignItems: 'center',
  },
  modalCancelText: { color: '#8892A4', fontSize: 14, fontWeight: '600' },
  modalSave: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#C8A96E', alignItems: 'center',
  },
  modalSaveDisabled: { backgroundColor: '#3A3020', opacity: 0.5 },
  modalSaveText: { color: '#0D0F16', fontSize: 14, fontWeight: '700' },
});

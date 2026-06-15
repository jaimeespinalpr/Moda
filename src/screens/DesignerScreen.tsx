import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import ThreeScene from '../components/ThreeScene';
import ToolPalette from '../components/ToolPalette';
import GarmentPanel from '../components/GarmentPanel';
import { useDesignStore } from '../store/designStore';
import { router } from 'expo-router';

export default function DesignerScreen() {
  const [panelOpen, setPanelOpen] = useState(true);
  const {
    showGrid, toggleGrid,
    showWireframe, toggleWireframe,
    showAvatar, toggleAvatar,
    garments, selectedGarmentId,
  } = useDesignStore();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹ Projects</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Designer</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={[styles.viewToggle, showGrid && styles.viewToggleActive]}
            onPress={() => { Haptics.selectionAsync(); toggleGrid(); }}
          >
            <Text style={styles.viewToggleText}>#</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, showWireframe && styles.viewToggleActive]}
            onPress={() => { Haptics.selectionAsync(); toggleWireframe(); }}
          >
            <Text style={styles.viewToggleText}>⬡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, showAvatar && styles.viewToggleActive]}
            onPress={() => { Haptics.selectionAsync(); toggleAvatar(); }}
          >
            <Text style={styles.viewToggleText}>🧍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3D Viewport — flex so it fills available space */}
      <View style={styles.viewport}>
        <ThreeScene />
        <ToolPalette />

        {/* Stats */}
        <View style={styles.statsBar}>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{garments.length}</Text>
            <Text style={styles.statLabel}>Garments</Text>
          </View>
          {selectedGarmentId && (
            <View style={[styles.statBadge, styles.selectedBadge]}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Selected</Text>
            </View>
          )}
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>Drag to orbit · Pinch to zoom</Text>
        </View>
      </View>

      {/* Panel toggle handle */}
      <TouchableOpacity
        style={styles.panelToggle}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPanelOpen(!panelOpen); }}
      >
        <View style={styles.panelHandle} />
        <Text style={styles.panelToggleText}>
          {panelOpen ? 'Hide Garments ↓' : 'Show Garments ↑'}
        </Text>
      </TouchableOpacity>

      {/* Bottom garment panel */}
      {panelOpen && (
        <View style={styles.panel}>
          <GarmentPanel />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 10,
    backgroundColor: 'rgba(9,11,30,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,100,180,0.15)',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backBtnText: {
    color: '#E94560',
    fontSize: 15,
    fontWeight: '600',
  },
  topBarTitle: {
    color: '#E0E8FF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 6,
  },
  viewToggle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,40,80,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.2)',
  },
  viewToggleActive: {
    backgroundColor: 'rgba(233,69,96,0.25)',
    borderColor: '#E94560',
  },
  viewToggleText: {
    color: '#A0B0D0',
    fontSize: 14,
  },
  viewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  statsBar: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    backgroundColor: 'rgba(10,14,40,0.85)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.25)',
  },
  selectedBadge: {
    borderColor: '#E94560',
    backgroundColor: 'rgba(233,69,96,0.15)',
  },
  statValue: {
    color: '#D0D8F0',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#4050A0',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  hint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(10,14,40,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.15)',
  },
  hintText: {
    color: '#4050A0',
    fontSize: 11,
  },
  panelToggle: {
    backgroundColor: 'rgba(12,16,42,0.97)',
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(80,100,180,0.2)',
    gap: 2,
  },
  panelHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(80,100,180,0.3)',
    borderRadius: 2,
  },
  panelToggleText: {
    color: '#5060A0',
    fontSize: 11,
    fontWeight: '600',
  },
  panel: {
    height: 260,
    backgroundColor: 'rgba(10,12,28,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(80,100,180,0.2)',
  },
});

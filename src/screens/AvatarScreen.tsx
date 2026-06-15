import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useDesignStore } from '../store/designStore';

interface MeasurementRow {
  key: keyof import('../types').AvatarMeasurements;
  label: string;
  unit: string;
  min: number;
  max: number;
  icon: string;
}

const MEASUREMENTS: MeasurementRow[] = [
  { key: 'height', label: 'Height', unit: 'cm', min: 150, max: 200, icon: '📏' },
  { key: 'bust', label: 'Bust', unit: 'cm', min: 72, max: 130, icon: '📐' },
  { key: 'waist', label: 'Waist', unit: 'cm', min: 54, max: 110, icon: '📐' },
  { key: 'hips', label: 'Hips', unit: 'cm', min: 78, max: 140, icon: '📐' },
  { key: 'shoulderWidth', label: 'Shoulder Width', unit: 'cm', min: 30, max: 56, icon: '↔' },
  { key: 'inseam', label: 'Inseam', unit: 'cm', min: 60, max: 96, icon: '📏' },
];

export default function AvatarScreen() {
  const { avatar, updateAvatar, ambientLightIntensity, setAmbientLight } = useDesignStore();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Avatar & Settings</Text>
        <Text style={styles.subtitle}>Customize the 3D mannequin measurements</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Measurements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Measurements</Text>

          {MEASUREMENTS.map((m) => (
            <View key={m.key} style={styles.measureRow}>
              <View style={styles.measureHeader}>
                <Text style={styles.measureIcon}>{m.icon}</Text>
                <Text style={styles.measureLabel}>{m.label}</Text>
                <Text style={styles.measureValue}>
                  {avatar[m.key].toFixed(0)} <Text style={styles.measureUnit}>{m.unit}</Text>
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={m.min}
                maximumValue={m.max}
                value={avatar[m.key]}
                onValueChange={(v) => updateAvatar({ [m.key]: v })}
                minimumTrackTintColor="#E94560"
                maximumTrackTintColor="rgba(80,100,180,0.3)"
                thumbTintColor="#E94560"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMin}>{m.min}{m.unit}</Text>
                <Text style={styles.sliderMax}>{m.max}{m.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Scene Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scene Lighting</Text>
          <View style={styles.measureRow}>
            <View style={styles.measureHeader}>
              <Text style={styles.measureIcon}>💡</Text>
              <Text style={styles.measureLabel}>Ambient Light</Text>
              <Text style={styles.measureValue}>
                {(ambientLightIntensity * 100).toFixed(0)}<Text style={styles.measureUnit}>%</Text>
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1.5}
              value={ambientLightIntensity}
              onValueChange={setAmbientLight}
              minimumTrackTintColor="#FFD060"
              maximumTrackTintColor="rgba(80,100,180,0.3)"
              thumbTintColor="#FFD060"
            />
          </View>
        </View>

        {/* Body Type Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Presets</Text>
          <View style={styles.presetGrid}>
            {[
              { label: 'XS', h: 162, b: 76, w: 58, hi: 82 },
              { label: 'S', h: 165, b: 82, w: 62, hi: 88 },
              { label: 'M', h: 170, b: 86, w: 66, hi: 92 },
              { label: 'L', h: 172, b: 94, w: 74, hi: 100 },
              { label: 'XL', h: 174, b: 102, w: 82, hi: 108 },
              { label: 'XXL', h: 175, b: 112, w: 92, hi: 118 },
            ].map((preset) => (
              <View
                key={preset.label}
                style={styles.presetBtn}
              >
                <Text
                  style={styles.presetBtnText}
                  onPress={() => updateAvatar({
                    height: preset.h,
                    bust: preset.b,
                    waist: preset.w,
                    hips: preset.hi,
                  })}
                >
                  {preset.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B1E',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,100,180,0.15)',
    backgroundColor: 'rgba(9,11,30,0.95)',
  },
  title: {
    color: '#E0E8FF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#4050A0',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#7080B0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  measureRow: {
    backgroundColor: 'rgba(15,20,50,0.7)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.15)',
  },
  measureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  measureIcon: {
    fontSize: 16,
  },
  measureLabel: {
    flex: 1,
    color: '#C0C8E0',
    fontSize: 14,
    fontWeight: '600',
  },
  measureValue: {
    color: '#E94560',
    fontSize: 16,
    fontWeight: '800',
  },
  measureUnit: {
    fontSize: 11,
    color: '#A04060',
  },
  slider: {
    height: 32,
    marginHorizontal: -4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderMin: {
    color: '#405080',
    fontSize: 10,
  },
  sliderMax: {
    color: '#405080',
    fontSize: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetBtn: {
    width: 60,
    height: 48,
    backgroundColor: 'rgba(20,28,70,0.7)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(80,100,200,0.2)',
  },
  presetBtnText: {
    color: '#8090C0',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

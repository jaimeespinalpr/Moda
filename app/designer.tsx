import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import DesignerScreen from '../src/screens/DesignerScreen';
import PatternCanvas from '../src/components/PatternCanvas';
import FabricLibrary from '../src/components/FabricLibrary';
import AvatarScreen from '../src/screens/AvatarScreen';

type Tab = 'design' | 'pattern' | 'fabric' | 'avatar';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'design', icon: '🎨', label: '3D' },
  { id: 'pattern', icon: '🧩', label: 'Pattern' },
  { id: 'fabric', icon: '🎀', label: 'Fabric' },
  { id: 'avatar', icon: '🧍', label: 'Avatar' },
];

export default function DesignerLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('design');

  const onTabPress = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'design' && <DesignerScreen />}
        {activeTab === 'pattern' && (
          <View style={styles.tabScreen}>
            <View style={styles.tabHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backBtnText}>‹ Projects</Text>
              </TouchableOpacity>
              <Text style={styles.tabTitle}>Pattern Editor</Text>
              <View style={{ width: 80 }} />
            </View>
            <PatternCanvas />
          </View>
        )}
        {activeTab === 'fabric' && (
          <View style={styles.tabScreen}>
            <View style={styles.tabHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backBtnText}>‹ Projects</Text>
              </TouchableOpacity>
              <Text style={styles.tabTitle}>Fabric Library</Text>
              <View style={{ width: 80 }} />
            </View>
            <FabricLibrary />
          </View>
        )}
        {activeTab === 'avatar' && <AvatarScreen />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && styles.activeTabBtn]}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label}
            </Text>
            {activeTab === tab.id && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B1E',
  },
  content: {
    flex: 1,
  },
  tabScreen: {
    flex: 1,
    backgroundColor: '#090B1E',
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: 'rgba(9,11,30,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,100,180,0.15)',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: '#E94560',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTitle: {
    color: '#E0E8FF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,12,30,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(80,100,180,0.2)',
    paddingBottom: 28,
    paddingTop: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
    gap: 3,
  },
  activeTabBtn: {},
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    color: '#4050A0',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeTabLabel: {
    color: '#E94560',
  },
  tabIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    backgroundColor: '#E94560',
    borderRadius: 1.5,
  },
});

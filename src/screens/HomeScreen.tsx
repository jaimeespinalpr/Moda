import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useDesignStore } from '../store/designStore';
import { router } from 'expo-router';

const { width: W } = Dimensions.get('window');

const PROJECT_COLORS = [
  ['#1a1a3e', '#E94560'],
  ['#0f2027', '#2196F3'],
  ['#1a2a1a', '#4CAF50'],
  ['#2a1a2a', '#9C27B0'],
  ['#2a2a0f', '#FF9800'],
];

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HomeScreen() {
  const { projects, createProject, setActiveProject } = useDesignStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const onCreate = () => {
    if (!newName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createProject(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  const openProject = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveProject(id);
    router.push('/designer');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0D0D2A', '#090B1E']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.appName}>MODA</Text>
            <Text style={styles.appTagline}>3D Fashion Design Studio</Text>
          </View>
          <TouchableOpacity
            style={styles.newProjectBtn}
            onPress={() => setShowCreate(true)}
          >
            <Text style={styles.newProjectBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick start */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Evening Gown', 'Casual Set', 'Business Suit', 'Streetwear'].map((t, i) => (
              <TouchableOpacity
                key={t}
                style={styles.quickCard}
                onPress={() => {
                  createProject(t);
                  openProject(projects[0]?.id || 'p1');
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={PROJECT_COLORS[i % PROJECT_COLORS.length] as [string, string]}
                  style={styles.quickCardGradient}
                >
                  <Text style={styles.quickCardEmoji}>
                    {['👗', '👕', '🧥', '👔'][i]}
                  </Text>
                  <Text style={styles.quickCardTitle}>{t}</Text>
                  <Text style={styles.quickCardLabel}>Template</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          {projects.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={styles.projectCard}
              onPress={() => openProject(p.id)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={PROJECT_COLORS[i % PROJECT_COLORS.length] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.projectThumb}
              >
                <Text style={styles.projectThumbText}>M</Text>
              </LinearGradient>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{p.name}</Text>
                <Text style={styles.projectDate}>
                  Updated {formatDate(p.updatedAt)}
                </Text>
                <View style={styles.projectTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{p.garments.length} garments</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.projectArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Project Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.createModal}>
            <Text style={styles.createTitle}>New Project</Text>
            <TextInput
              style={styles.input}
              placeholder="Project name..."
              placeholderTextColor="#4050A0"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={onCreate}
              returnKeyType="done"
              selectionColor="#E94560"
            />
            <View style={styles.createActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowCreate(false); setNewName(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, !newName.trim() && styles.createBtnDisabled]}
                onPress={onCreate}
                disabled={!newName.trim()}
              >
                <Text style={styles.createBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B1E',
  },
  header: {
    paddingTop: 54,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,120,200,0.15)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
  },
  appTagline: {
    color: '#5060A0',
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
  },
  newProjectBtn: {
    backgroundColor: '#E94560',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newProjectBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    color: '#7080B0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  quickCard: {
    width: W * 0.38,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickCardGradient: {
    padding: 16,
    height: 130,
    justifyContent: 'flex-end',
  },
  quickCardEmoji: {
    fontSize: 32,
    position: 'absolute',
    top: 14,
    right: 14,
  },
  quickCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickCardLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    letterSpacing: 1,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,20,50,0.7)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.15)',
    gap: 14,
  },
  projectThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectThumbText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 22,
    fontWeight: '900',
  },
  projectInfo: {
    flex: 1,
    gap: 3,
  },
  projectName: {
    color: '#D0D8F0',
    fontSize: 15,
    fontWeight: '700',
  },
  projectDate: {
    color: '#5060A0',
    fontSize: 11,
  },
  projectTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(80,100,180,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: '#7080B0',
    fontSize: 10,
    fontWeight: '600',
  },
  projectArrow: {
    color: '#4050A0',
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createModal: {
    width: W - 48,
    backgroundColor: '#0F1428',
    borderRadius: 20,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(100,120,200,0.2)',
  },
  createTitle: {
    color: '#E0E8FF',
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(30,40,80,0.6)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#D0D8F0',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(100,120,200,0.2)',
  },
  createActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(40,50,100,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(100,120,200,0.2)',
  },
  cancelBtnText: {
    color: '#6070A0',
    fontSize: 14,
    fontWeight: '600',
  },
  createBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#E94560',
  },
  createBtnDisabled: {
    backgroundColor: '#602030',
    opacity: 0.5,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import { useDesignStore, SavedDesign } from '../store/designStore';

interface Props {
  onBack: () => void;
}

export function SavedDesignsScreen({ onBack }: Props) {
  const { savedDesigns, loadSavedDesigns, loadDesign, deleteDesign } = useDesignStore();

  useEffect(() => { loadSavedDesigns(); }, []);

  const handleLoad = (design: SavedDesign) => {
    Alert.alert('Cargar diseño', `¿Abrir "${design.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abrir', onPress: () => { loadDesign(design); onBack(); } },
    ]);
  };

  const handleDelete = (design: SavedDesign) => {
    Alert.alert('Eliminar', `¿Eliminar "${design.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteDesign(design.id) },
    ]);
  };

  const renderItem = ({ item }: { item: SavedDesign }) => {
    const date = new Date(item.createdAt).toLocaleDateString('es-PR', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleLoad(item)} activeOpacity={0.8}>
        <View style={styles.thumb}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.thumbImg} />
          ) : (
            <Text style={styles.thumbPlaceholder}>👕</Text>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.designName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.designDate}>{date}</Text>
          <View style={styles.tags}>
            <View style={styles.tag}><Text style={styles.tagText}>{item.state.shirtCutId}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>{item.state.pantsCutId}</Text></View>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0F16" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Diseños</Text>
        <Text style={styles.count}>{savedDesigns.length}</Text>
      </View>

      {savedDesigns.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎨</Text>
          <Text style={styles.emptyText}>No tienes diseños guardados</Text>
          <Text style={styles.emptySubtext}>Crea tu primer outfit y guárdalo aquí</Text>
        </View>
      ) : (
        <FlatList
          data={savedDesigns}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0F16' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#1C2030',
  },
  back: { width: 36, height: 36, justifyContent: 'center' },
  backIcon: { color: '#C8A96E', fontSize: 22, fontWeight: '600' },
  title: { flex: 1, color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  count: {
    color: '#C8A96E', fontSize: 13, fontWeight: '700',
    backgroundColor: '#1E1A0E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C2030', borderRadius: 16,
    borderWidth: 1, borderColor: '#2A2E40', overflow: 'hidden',
  },
  thumb: {
    width: 90, height: 90, backgroundColor: '#111318',
    justifyContent: 'center', alignItems: 'center',
  },
  thumbImg: { width: 90, height: 90 },
  thumbPlaceholder: { fontSize: 36 },
  info: { flex: 1, padding: 14, gap: 6 },
  designName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  designDate: { color: '#4A5068', fontSize: 12 },
  tags: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: '#111318', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: '#2A2E40',
  },
  tagText: { color: '#8892A4', fontSize: 11, textTransform: 'capitalize' },
  deleteBtn: { padding: 18 },
  deleteIcon: { color: '#4A5068', fontSize: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: '#4A5068', fontSize: 14 },
});

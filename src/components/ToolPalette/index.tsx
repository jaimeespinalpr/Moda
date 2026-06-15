import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDesignStore } from '../../store/designStore';
import { DesignTool } from '../../types';

interface Tool {
  id: DesignTool;
  icon: string;
  label: string;
}

const TOOLS: Tool[] = [
  { id: 'select', icon: '↖', label: 'Select' },
  { id: 'move', icon: '✥', label: 'Move' },
  { id: 'rotate', icon: '↻', label: 'Rotate' },
  { id: 'scale', icon: '⤡', label: 'Scale' },
  { id: 'measure', icon: '📏', label: 'Measure' },
  { id: 'pin', icon: '📌', label: 'Pin' },
  { id: 'camera', icon: '🎥', label: 'Camera' },
];

export default function ToolPalette() {
  const { activeTool, setActiveTool } = useDesignStore();

  const onPress = (tool: DesignTool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTool(tool);
  };

  return (
    <View style={styles.container}>
      {TOOLS.map((tool) => (
        <TouchableOpacity
          key={tool.id}
          style={[styles.tool, activeTool === tool.id && styles.activeTool]}
          onPress={() => onPress(tool.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.icon, activeTool === tool.id && styles.activeIcon]}>
            {tool.icon}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    top: '30%',
    backgroundColor: 'rgba(15,20,40,0.92)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(100,120,200,0.25)',
  },
  tool: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  activeTool: {
    backgroundColor: '#E94560',
  },
  icon: {
    fontSize: 18,
    color: '#8899BB',
  },
  activeIcon: {
    color: '#FFFFFF',
  },
});

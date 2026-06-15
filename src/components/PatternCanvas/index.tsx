import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle, G } from 'react-native-svg';
import { useDesignStore } from '../../store/designStore';
import { PatternPiece } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CANVAS_W = SCREEN_W - 24;
const CANVAS_H = 420;
const SCALE = 0.55;

function pointsToString(points: { x: number; y: number }[], offsetX: number, offsetY: number) {
  return points
    .map((p) => `${p.x * SCALE + offsetX},${p.y * SCALE + offsetY}`)
    .join(' ');
}

function PieceView({
  piece,
  selected,
  color,
  onSelect,
}: {
  piece: PatternPiece;
  selected: boolean;
  color: string;
  onSelect: () => void;
}) {
  const ox = piece.position.x * SCALE;
  const oy = piece.position.y * SCALE;
  const pts = pointsToString(piece.points, ox, oy);

  const cx = (piece.points.reduce((s, p) => s + p.x, 0) / piece.points.length) * SCALE + ox;
  const cy = (piece.points.reduce((s, p) => s + p.y, 0) / piece.points.length) * SCALE + oy;

  return (
    <G onPress={onSelect}>
      <Polygon
        points={pts}
        fill={selected ? `${color}55` : `${color}28`}
        stroke={selected ? color : `${color}88`}
        strokeWidth={selected ? 2 : 1.5}
        strokeDasharray={selected ? undefined : '5,3'}
      />
      {/* Grain line */}
      <Line
        x1={cx}
        y1={cy - 15}
        x2={cx}
        y2={cy + 15}
        stroke={`${color}CC`}
        strokeWidth={1}
        strokeDasharray="2,2"
      />
      <SvgText
        x={cx}
        y={cy - 20}
        textAnchor="middle"
        fontSize={9}
        fill={selected ? '#FFFFFF' : '#8899BB'}
        fontWeight={selected ? '700' : '400'}
      >
        {piece.name}
      </SvgText>
      {/* Corner dots */}
      {piece.points.map((p, i) => (
        <Circle
          key={i}
          cx={p.x * SCALE + ox}
          cy={p.y * SCALE + oy}
          r={3}
          fill={selected ? color : `${color}80`}
        />
      ))}
    </G>
  );
}

export default function PatternCanvas() {
  const { garments, selectedGarmentId, selectGarment } = useDesignStore();
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  const activeGarment = garments.find((g) => g.id === selectedGarmentId) || garments[0];
  const garmentColor = activeGarment?.material.color || '#4A7AB5';

  if (!activeGarment) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🧩</Text>
        <Text style={styles.emptyText}>No garment selected</Text>
        <Text style={styles.emptyHint}>Add a garment in the Designer tab first</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Garment Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.garmentTabs}>
        {garments.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.garmentTab, selectedGarmentId === g.id && styles.activeTab]}
            onPress={() => selectGarment(g.id)}
          >
            <View style={[styles.tabDot, { backgroundColor: g.material.color }]} />
            <Text style={[styles.tabText, selectedGarmentId === g.id && styles.activeTabText]}>
              {g.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pattern Pieces Info */}
      <View style={styles.info}>
        <Text style={styles.infoTitle}>{activeGarment.name}</Text>
        <Text style={styles.infoSub}>{activeGarment.patternPieces.length} pattern pieces</Text>
      </View>

      {/* Canvas */}
      <View style={styles.canvasWrapper}>
        <Svg width={CANVAS_W} height={CANVAS_H} style={styles.canvas}>
          {/* Grid */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Line
              key={`v${i}`}
              x1={i * (CANVAS_W / 20)}
              y1={0}
              x2={i * (CANVAS_W / 20)}
              y2={CANVAS_H}
              stroke="rgba(80,100,180,0.12)"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <Line
              key={`h${i}`}
              x1={0}
              y1={i * (CANVAS_H / 14)}
              x2={CANVAS_W}
              y2={i * (CANVAS_H / 14)}
              stroke="rgba(80,100,180,0.12)"
              strokeWidth={0.5}
            />
          ))}

          {/* Pattern pieces */}
          {activeGarment.patternPieces.map((piece) => (
            <PieceView
              key={piece.id}
              piece={piece}
              selected={selectedPieceId === piece.id}
              color={garmentColor}
              onSelect={() => setSelectedPieceId(selectedPieceId === piece.id ? null : piece.id)}
            />
          ))}
        </Svg>
      </View>

      {/* Piece Details */}
      {selectedPieceId && (
        <View style={styles.pieceDetails}>
          {(() => {
            const p = activeGarment.patternPieces.find((pp) => pp.id === selectedPieceId);
            if (!p) return null;
            const pts = p.points;
            const area = Math.abs(
              pts.reduce((acc, pt, i) => {
                const next = pts[(i + 1) % pts.length];
                return acc + pt.x * next.y - next.x * pt.y;
              }, 0) / 2
            );
            return (
              <>
                <Text style={styles.detailTitle}>{p.name}</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Points</Text>
                  <Text style={styles.detailValue}>{p.points.length}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Area</Text>
                  <Text style={styles.detailValue}>{(area / 100).toFixed(1)} cm²</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fabric</Text>
                  <Text style={styles.detailValue}>{activeGarment.material.name}</Text>
                </View>
              </>
            );
          })()}
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#090B1E',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyText: {
    color: '#8090C0',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#405080',
    fontSize: 13,
  },
  garmentTabs: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80,100,180,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxHeight: 50,
  },
  garmentTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(30,40,80,0.5)',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.2)',
  },
  activeTab: {
    backgroundColor: 'rgba(233,69,96,0.2)',
    borderColor: '#E94560',
  },
  tabDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tabText: {
    color: '#6070A0',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#F0A0B0',
  },
  info: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoTitle: {
    color: '#D0D8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  infoSub: {
    color: '#5060A0',
    fontSize: 11,
    marginTop: 2,
  },
  canvasWrapper: {
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.2)',
  },
  canvas: {
    backgroundColor: '#0D1030',
  },
  pieceDetails: {
    margin: 12,
    padding: 14,
    backgroundColor: 'rgba(20,28,60,0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(80,100,180,0.2)',
    gap: 8,
  },
  detailTitle: {
    color: '#E0E8FF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#5060A0',
    fontSize: 12,
  },
  detailValue: {
    color: '#A0B0D0',
    fontSize: 12,
    fontWeight: '600',
  },
});

export type GarmentType = 'tshirt' | 'pants' | 'dress' | 'jacket' | 'skirt' | 'blouse' | 'coat';

export type FabricWeight = 'sheer' | 'light' | 'medium' | 'heavy' | 'denim';

export interface FabricMaterial {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  weight: FabricWeight;
  texture?: string;
  description: string;
  category: 'cotton' | 'silk' | 'denim' | 'leather' | 'wool' | 'synthetic';
}

export interface PatternPiece {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  position: { x: number; y: number };
  rotation: number;
  scale: number;
}

export interface Garment {
  id: string;
  type: GarmentType;
  name: string;
  material: FabricMaterial;
  patternPieces: PatternPiece[];
  visible: boolean;
  position: { x: number; y: number; z: number };
  scale: number;
}

export interface AvatarMeasurements {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulderWidth: number;
  inseam: number;
}

export interface DesignProject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  garments: Garment[];
  avatar: AvatarMeasurements;
  thumbnail?: string;
}

export type DesignTool =
  | 'select'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'cut'
  | 'sew'
  | 'measure'
  | 'pin'
  | 'camera';

export interface ToolState {
  activeTool: DesignTool;
  selectedGarmentId: string | null;
  selectedPieceId: string | null;
}

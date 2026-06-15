export type ClothingType = 'shirt' | 'pants';

export interface ClothingCut {
  id: string;
  name: string;
  type: ClothingType;
  emoji: string;
  description: string;
}

export interface Fabric {
  id: string;
  name: string;
  roughness: number;
  metalness: number;
  sheen?: number;
  description: string;
  emoji: string;
  colorOptions: string[];
}

export const SHIRT_CUTS: ClothingCut[] = [
  { id: 'tshirt',     name: 'T-Shirt',        type: 'shirt', emoji: '👕', description: 'Cuello redondo, manga corta' },
  { id: 'vneck',      name: 'Cuello V',        type: 'shirt', emoji: '🔻', description: 'Escote en V, manga corta' },
  { id: 'polo',       name: 'Polo',            type: 'shirt', emoji: '🎽', description: 'Cuello polo, botones' },
  { id: 'longsleeve', name: 'Manga Larga',     type: 'shirt', emoji: '🧥', description: 'Cuello redondo, manga larga' },
  { id: 'buttonup',   name: 'Camisa Botones',  type: 'shirt', emoji: '👔', description: 'Camisa clásica con botones' },
  { id: 'sleeveless', name: 'Sin Mangas',      type: 'shirt', emoji: '🩱', description: 'Camisilla / tank top' },
  { id: 'crop',       name: 'Crop Top',        type: 'shirt', emoji: '✂️', description: 'Corto, hasta el ombligo' },
  { id: 'hoodie',     name: 'Sudadera',        type: 'shirt', emoji: '🧢', description: 'Con capucha y bolsillo' },
];

export const PANTS_CUTS: ClothingCut[] = [
  { id: 'skinny',   name: 'Skinny',         type: 'pants', emoji: '🦵', description: 'Ajustado desde cadera a tobillo' },
  { id: 'straight', name: 'Straight',       type: 'pants', emoji: '📏', description: 'Pierna recta clásica' },
  { id: 'widel',    name: 'Wide Leg',       type: 'pants', emoji: '🎪', description: 'Pierna ancha, cómodo' },
  { id: 'bootcut',  name: 'Bootcut',        type: 'pants', emoji: '🥾', description: 'Se ensancha desde la rodilla' },
  { id: 'cargo',    name: 'Cargo',          type: 'pants', emoji: '🪖', description: 'Con bolsillos laterales' },
  { id: 'dress',    name: 'Vestir',         type: 'pants', emoji: '💼', description: 'Pantalón formal / de vestir' },
  { id: 'jogger',   name: 'Jogger',         type: 'pants', emoji: '🏃', description: 'Elástico, cómodo, urbano' },
  { id: 'shorts',   name: 'Short',          type: 'pants', emoji: '🩳', description: 'Bermuda / short' },
];

export const FABRICS: Fabric[] = [
  {
    id: 'cotton',
    name: 'Algodón',
    roughness: 0.85,
    metalness: 0.0,
    description: 'Suave, transpirable, natural',
    emoji: '🌿',
    colorOptions: ['#FFFFFF','#F5F5DC','#000000','#1C3A5E','#8B0000','#2E7D32','#FF6B35','#9C27B0'],
  },
  {
    id: 'denim',
    name: 'Denim / Jean',
    roughness: 0.92,
    metalness: 0.0,
    description: 'Resistente, tejido diagonal',
    emoji: '👖',
    colorOptions: ['#1A237E','#37474F','#000051','#1B5E20','#4A148C','#BF360C','#33691E','#263238'],
  },
  {
    id: 'linen',
    name: 'Lino',
    roughness: 0.95,
    metalness: 0.0,
    description: 'Ligero, tejido suelto',
    emoji: '🌾',
    colorOptions: ['#F5F5DC','#E8DCC8','#D4C5A9','#BCAAA4','#A1887F','#8D6E63','#795548','#5D4037'],
  },
  {
    id: 'silk',
    name: 'Seda',
    roughness: 0.08,
    metalness: 0.15,
    sheen: 1.0,
    description: 'Suave, brillante, lujosa',
    emoji: '✨',
    colorOptions: ['#FFD700','#FF1744','#00BCD4','#E91E63','#9C27B0','#1DE9B6','#FF6F00','#F8F8FF'],
  },
  {
    id: 'polyester',
    name: 'Poliéster',
    roughness: 0.6,
    metalness: 0.05,
    description: 'Sintético, duradero',
    emoji: '🔬',
    colorOptions: ['#F44336','#2196F3','#4CAF50','#FF9800','#9C27B0','#00BCD4','#FFEB3B','#FF5722'],
  },
  {
    id: 'velvet',
    name: 'Terciopelo',
    roughness: 1.0,
    metalness: 0.0,
    description: 'Suave, lujoso, denso',
    emoji: '🎩',
    colorOptions: ['#4A0E8F','#1B0000','#004D40','#B71C1C','#1A237E','#212121','#880E4F','#1B5E20'],
  },
  {
    id: 'leather',
    name: 'Cuero',
    roughness: 0.3,
    metalness: 0.1,
    description: 'Resistente, lustrado',
    emoji: '🥋',
    colorOptions: ['#3E2723','#1A1A1A','#BF360C','#212121','#4E342E','#6D4C41','#D7CCC8','#8D6E63'],
  },
  {
    id: 'flannel',
    name: 'Franela',
    roughness: 0.98,
    metalness: 0.0,
    description: 'Cálida, suave, cuadros',
    emoji: '🧸',
    colorOptions: ['#B71C1C','#1A237E','#1B5E20','#4A148C','#E65100','#37474F','#880E4F','#33691E'],
  },
];

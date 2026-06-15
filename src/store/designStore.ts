import { create } from 'zustand';
import { Garment, GarmentType, FabricMaterial, DesignTool, AvatarMeasurements, DesignProject } from '../types';
import { FABRICS } from '../constants/fabrics';

const DEFAULT_AVATAR: AvatarMeasurements = {
  height: 170,
  bust: 86,
  waist: 66,
  hips: 92,
  shoulderWidth: 38,
  inseam: 76,
};

const DEFAULT_PROJECTS: DesignProject[] = [
  {
    id: 'p1',
    name: 'Summer Collection',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-10'),
    garments: [],
    avatar: DEFAULT_AVATAR,
  },
  {
    id: 'p2',
    name: 'Evening Wear',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-03-05'),
    garments: [],
    avatar: DEFAULT_AVATAR,
  },
  {
    id: 'p3',
    name: 'Casual Basics',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-28'),
    garments: [],
    avatar: DEFAULT_AVATAR,
  },
];

interface DesignStore {
  projects: DesignProject[];
  activeProjectId: string | null;
  garments: Garment[];
  activeTool: DesignTool;
  selectedGarmentId: string | null;
  avatar: AvatarMeasurements;
  showAvatar: boolean;
  showGrid: boolean;
  showWireframe: boolean;
  ambientLightIntensity: number;

  setActiveProject: (id: string) => void;
  createProject: (name: string) => void;
  addGarment: (type: GarmentType, material?: FabricMaterial) => void;
  removeGarment: (id: string) => void;
  selectGarment: (id: string | null) => void;
  updateGarmentMaterial: (id: string, material: FabricMaterial) => void;
  toggleGarmentVisibility: (id: string) => void;
  setActiveTool: (tool: DesignTool) => void;
  updateAvatar: (measurements: Partial<AvatarMeasurements>) => void;
  toggleGrid: () => void;
  toggleWireframe: () => void;
  toggleAvatar: () => void;
  setAmbientLight: (intensity: number) => void;
}

let garmentCounter = 1;

function createGarment(type: GarmentType, material: FabricMaterial): Garment {
  return {
    id: `garment-${garmentCounter++}`,
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${garmentCounter}`,
    material,
    patternPieces: generatePatternPieces(type),
    visible: true,
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
  };
}

function generatePatternPieces(type: GarmentType) {
  switch (type) {
    case 'tshirt':
    case 'blouse':
      return [
        {
          id: 'front',
          name: 'Front Body',
          points: [
            { x: 0, y: 0 }, { x: 120, y: 0 }, { x: 130, y: 30 },
            { x: 120, y: 180 }, { x: 0, y: 180 },
          ],
          position: { x: 20, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'back',
          name: 'Back Body',
          points: [
            { x: 0, y: 0 }, { x: 120, y: 0 }, { x: 130, y: 30 },
            { x: 120, y: 180 }, { x: 0, y: 180 },
          ],
          position: { x: 160, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'sleeve-left',
          name: 'Left Sleeve',
          points: [
            { x: 0, y: 20 }, { x: 60, y: 0 }, { x: 80, y: 80 }, { x: 0, y: 80 },
          ],
          position: { x: 20, y: 220 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'sleeve-right',
          name: 'Right Sleeve',
          points: [
            { x: 0, y: 20 }, { x: 60, y: 0 }, { x: 80, y: 80 }, { x: 0, y: 80 },
          ],
          position: { x: 120, y: 220 },
          rotation: 0,
          scale: 1,
        },
      ];
    case 'pants':
      return [
        {
          id: 'front-left',
          name: 'Front Left Leg',
          points: [
            { x: 0, y: 0 }, { x: 70, y: 0 }, { x: 65, y: 300 }, { x: 0, y: 300 },
          ],
          position: { x: 20, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'front-right',
          name: 'Front Right Leg',
          points: [
            { x: 0, y: 0 }, { x: 70, y: 0 }, { x: 65, y: 300 }, { x: 0, y: 300 },
          ],
          position: { x: 110, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'back-left',
          name: 'Back Left Leg',
          points: [
            { x: 0, y: 0 }, { x: 75, y: 0 }, { x: 68, y: 300 }, { x: 0, y: 300 },
          ],
          position: { x: 200, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'back-right',
          name: 'Back Right Leg',
          points: [
            { x: 0, y: 0 }, { x: 75, y: 0 }, { x: 68, y: 300 }, { x: 0, y: 300 },
          ],
          position: { x: 295, y: 20 },
          rotation: 0,
          scale: 1,
        },
      ];
    case 'dress':
      return [
        {
          id: 'front-bodice',
          name: 'Front Bodice',
          points: [
            { x: 10, y: 0 }, { x: 110, y: 0 }, { x: 120, y: 20 },
            { x: 115, y: 130 }, { x: 0, y: 130 }, { x: 0, y: 20 },
          ],
          position: { x: 20, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'back-bodice',
          name: 'Back Bodice',
          points: [
            { x: 10, y: 0 }, { x: 110, y: 0 }, { x: 120, y: 20 },
            { x: 115, y: 130 }, { x: 0, y: 130 }, { x: 0, y: 20 },
          ],
          position: { x: 160, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'skirt-front',
          name: 'Front Skirt',
          points: [
            { x: 0, y: 0 }, { x: 140, y: 0 }, { x: 160, y: 180 }, { x: 0, y: 180 },
          ],
          position: { x: 20, y: 170 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'skirt-back',
          name: 'Back Skirt',
          points: [
            { x: 0, y: 0 }, { x: 140, y: 0 }, { x: 160, y: 180 }, { x: 0, y: 180 },
          ],
          position: { x: 200, y: 170 },
          rotation: 0,
          scale: 1,
        },
      ];
    case 'skirt':
      return [
        {
          id: 'front',
          name: 'Front Panel',
          points: [
            { x: 10, y: 0 }, { x: 110, y: 0 }, { x: 140, y: 200 }, { x: 0, y: 200 },
          ],
          position: { x: 20, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'back',
          name: 'Back Panel',
          points: [
            { x: 10, y: 0 }, { x: 110, y: 0 }, { x: 140, y: 200 }, { x: 0, y: 200 },
          ],
          position: { x: 180, y: 20 },
          rotation: 0,
          scale: 1,
        },
      ];
    default:
      return [
        {
          id: 'front',
          name: 'Front Panel',
          points: [
            { x: 0, y: 0 }, { x: 140, y: 0 }, { x: 140, y: 200 }, { x: 0, y: 200 },
          ],
          position: { x: 20, y: 20 },
          rotation: 0,
          scale: 1,
        },
        {
          id: 'back',
          name: 'Back Panel',
          points: [
            { x: 0, y: 0 }, { x: 140, y: 0 }, { x: 140, y: 200 }, { x: 0, y: 200 },
          ],
          position: { x: 180, y: 20 },
          rotation: 0,
          scale: 1,
        },
      ];
  }
}

export const useDesignStore = create<DesignStore>((set) => ({
  projects: DEFAULT_PROJECTS,
  activeProjectId: null,
  garments: [],
  activeTool: 'select',
  selectedGarmentId: null,
  avatar: DEFAULT_AVATAR,
  showAvatar: true,
  showGrid: true,
  showWireframe: false,
  ambientLightIntensity: 0.6,

  setActiveProject: (id) => set({ activeProjectId: id }),

  createProject: (name) => set((state) => ({
    projects: [
      ...state.projects,
      {
        id: `p-${Date.now()}`,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        garments: [],
        avatar: DEFAULT_AVATAR,
      },
    ],
  })),

  addGarment: (type, material) => set((state) => {
    const mat = material || FABRICS[0];
    return { garments: [...state.garments, createGarment(type, mat)] };
  }),

  removeGarment: (id) => set((state) => ({
    garments: state.garments.filter((g) => g.id !== id),
    selectedGarmentId: state.selectedGarmentId === id ? null : state.selectedGarmentId,
  })),

  selectGarment: (id) => set({ selectedGarmentId: id }),

  updateGarmentMaterial: (id, material) => set((state) => ({
    garments: state.garments.map((g) => g.id === id ? { ...g, material } : g),
  })),

  toggleGarmentVisibility: (id) => set((state) => ({
    garments: state.garments.map((g) => g.id === id ? { ...g, visible: !g.visible } : g),
  })),

  setActiveTool: (tool) => set({ activeTool: tool }),

  updateAvatar: (measurements) => set((state) => ({
    avatar: { ...state.avatar, ...measurements },
  })),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleWireframe: () => set((state) => ({ showWireframe: !state.showWireframe })),
  toggleAvatar: () => set((state) => ({ showAvatar: !state.showAvatar })),
  setAmbientLight: (intensity) => set({ ambientLightIntensity: intensity }),
}));

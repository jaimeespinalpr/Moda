import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DesignState {
  shirtCutId: string;
  pantsCutId: string;
  shirtFabricId: string;
  pantsFabricId: string;
  shirtColor: string;
  pantsColor: string;
  showShirt: boolean;
  showPants: boolean;
}

export interface SavedDesign {
  id: string;
  name: string;
  state: DesignState;
  thumbnail?: string;
  createdAt: number;
}

interface Store extends DesignState {
  savedDesigns: SavedDesign[];
  setShirtCut: (id: string) => void;
  setPantsCut: (id: string) => void;
  setShirtFabric: (id: string) => void;
  setPantsFabric: (id: string) => void;
  setShirtColor: (color: string) => void;
  setPantsColor: (color: string) => void;
  toggleShirt: () => void;
  togglePants: () => void;
  saveDesign: (name: string, thumbnail?: string) => Promise<void>;
  loadSavedDesigns: () => Promise<void>;
  loadDesign: (design: SavedDesign) => void;
  deleteDesign: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'moda_saved_designs';

export const useDesignStore = create<Store>((set, get) => ({
  shirtCutId: 'tshirt',
  pantsCutId: 'straight',
  shirtFabricId: 'cotton',
  pantsFabricId: 'denim',
  shirtColor: '#FFFFFF',
  pantsColor: '#1A237E',
  showShirt: true,
  showPants: true,
  savedDesigns: [],

  setShirtCut: (id) => set({ shirtCutId: id }),
  setPantsCut: (id) => set({ pantsCutId: id }),
  setShirtFabric: (id) => set({ shirtFabricId: id }),
  setPantsFabric: (id) => set({ pantsFabricId: id }),
  setShirtColor: (color) => set({ shirtColor: color }),
  setPantsColor: (color) => set({ pantsColor: color }),
  toggleShirt: () => set((s) => ({ showShirt: !s.showShirt })),
  togglePants: () => set((s) => ({ showPants: !s.showPants })),

  saveDesign: async (name, thumbnail) => {
    const state = get();
    const design: SavedDesign = {
      id: Date.now().toString(),
      name,
      thumbnail,
      createdAt: Date.now(),
      state: {
        shirtCutId: state.shirtCutId,
        pantsCutId: state.pantsCutId,
        shirtFabricId: state.shirtFabricId,
        pantsFabricId: state.pantsFabricId,
        shirtColor: state.shirtColor,
        pantsColor: state.pantsColor,
        showShirt: state.showShirt,
        showPants: state.showPants,
      },
    };
    const updated = [design, ...state.savedDesigns];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ savedDesigns: updated });
  },

  loadSavedDesigns: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ savedDesigns: JSON.parse(raw) });
    } catch (_) {}
  },

  loadDesign: (design) => set({ ...design.state }),

  deleteDesign: async (id) => {
    const updated = get().savedDesigns.filter((d) => d.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ savedDesigns: updated });
  },
}));

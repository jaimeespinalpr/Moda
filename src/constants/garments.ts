import { GarmentType } from '../types';

export interface GarmentTemplate {
  type: GarmentType;
  name: string;
  description: string;
  icon: string;
  defaultColor: string;
}

export const GARMENT_TEMPLATES: GarmentTemplate[] = [
  {
    type: 'tshirt',
    name: 'T-Shirt',
    description: 'Classic crew neck tee',
    icon: '👕',
    defaultColor: '#FFFFFF',
  },
  {
    type: 'blouse',
    name: 'Blouse',
    description: 'Elegant fitted blouse',
    icon: '👔',
    defaultColor: '#F5F5F0',
  },
  {
    type: 'jacket',
    name: 'Jacket',
    description: 'Structured outer jacket',
    icon: '🧥',
    defaultColor: '#1A1A1A',
  },
  {
    type: 'coat',
    name: 'Coat',
    description: 'Long flowing coat',
    icon: '🧥',
    defaultColor: '#C19A6B',
  },
  {
    type: 'dress',
    name: 'Dress',
    description: 'Elegant full dress',
    icon: '👗',
    defaultColor: '#E94560',
  },
  {
    type: 'skirt',
    name: 'Skirt',
    description: 'A-line or pencil skirt',
    icon: '👗',
    defaultColor: '#4A7AB5',
  },
  {
    type: 'pants',
    name: 'Pants',
    description: 'Tailored trousers',
    icon: '👖',
    defaultColor: '#2B3A52',
  },
];

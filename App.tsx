import React, { useState } from 'react';
import { DesignScreen } from './src/screens/DesignScreen';
import { SavedDesignsScreen } from './src/screens/SavedDesignsScreen';

type Screen = 'design' | 'saved';

export default function App() {
  const [screen, setScreen] = useState<Screen>('design');

  if (screen === 'saved') {
    return <SavedDesignsScreen onBack={() => setScreen('design')} />;
  }

  return <DesignScreen onGoToSaved={() => setScreen('saved')} />;
}

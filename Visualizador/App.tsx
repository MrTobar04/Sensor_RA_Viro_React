// App.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import OverlayCard from './app/components/OverlayCard';
import { fetchSensors, Sensor } from './app/api';
import ARScene from './app/ar/ARScene';

export default function App() {
  const [sensor, setSensor] = useState<Sensor | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await fetchSensors();
      setSensor(list[0] ?? null);
    } catch (e) {
      console.warn('refresh failed', e);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <SafeAreaView style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{ scene: ARScene }}
        // Se puede pasar viroAppProps si necesitas enviar props a la escena
        // viroAppProps={{ sensor }}
        style={styles.ar}
      />
      <OverlayCard sensor={sensor} onRefresh={refresh} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  ar: { flex: 1 },
});
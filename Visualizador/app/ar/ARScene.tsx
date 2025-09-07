// app/ar/ARScene.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ViroARScene,
  ViroText,
  Viro3DObject,
  ViroAmbientLight,
  ViroARPlane,
  // ViroARSceneNavigator, // Not used in this file
} from '@reactvision/react-viro';
import { fetchSensors } from '../api';

export default function ARScene(props: any) {
  const [sensorText, setSensorText] = useState<string>('Cargando...');
  const timerRef = useRef<number | null>(null);

  async function loadOnce() {
    try {
      const list = await fetchSensors();
      const s = list[0];
      setSensorText(`Sensor ${s.id}\n${s.location}\nT: ${s.temperature.toFixed(1)}°C\nH: ${s.humidity}%\nEstado: ${s.status}`);
    } catch (e) {
      console.warn('fetchSensors failed', e);
      setSensorText('Error al obtener datos');
    }
  }

  useEffect(() => {
    loadOnce();
    timerRef.current = setInterval(loadOnce, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={800} />
      <ViroARPlane minWidth={0.2} minHeight={0.2} alignment="Horizontal">
        <ViroText
          text={sensorText}
          position={[0, 0.12, -0.5]}
          width={0.4}
          height={0.4}
          style={{ fontSize: 24, color: '#ffffff', textAlign: 'center' }}
        />

        {/* Opcional: descomenta si tienes assets/sensor.glb en /android/app/src/main/assets o /ios bundle */}
        {/* <Viro3DObject
          source={require('../../assets/sensor.glb')}
          position={[0, 0, -0.5]}
          scale={[0.02, 0.02, 0.02]}
          type="GLB"
        /> */}
      </ViroARPlane>
    </ViroARScene>
  );
}

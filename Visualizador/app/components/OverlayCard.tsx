// app/components/OverlayCard.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Sensor } from '../api';

type Props = {
  sensor: Sensor | null;
  onRefresh: () => Promise<void>;
};

export default function OverlayCard({ sensor, onRefresh }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {sensor ? `Sensor ${sensor.id} — ${sensor.location}` : 'Cargando sensores...'}
      </Text>

      {sensor && (
        <>
          <Text style={styles.value}>Temp: {sensor.temperature.toFixed(1)} °C   |   Humedad: {sensor.humidity}%</Text>
          <Text style={styles.meta}>Estado: {sensor.status}  ·  {new Date(sensor.updatedAt).toLocaleTimeString()}</Text>
        </>
      )}

      <Pressable style={styles.btn} onPress={() => onRefresh()}>
        <Text style={styles.btnText}>Actualizar ahora</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: 'rgba(16,16,16,0.9)',
    padding: 14,
    borderRadius: 12,
    elevation: 6,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  value: { color: '#fff', marginTop: 6 },
  meta: { color: '#cfcfcf', marginTop: 4, fontSize: 12 },
  btn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
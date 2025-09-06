import { BlurView } from 'expo-blur';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fetchSensors } from '../services/SensorService';

export default function CameraScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [sensorData, setSensorData] = useState<{ temperature: number; humidity: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempInput, setTempInput] = useState('');
  const [humInput, setHumInput] = useState('');

 

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' } });

    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    const loadSensors = async () => {
      try {
        const sensors = await fetchSensors();
        if (sensors.length > 0) {
          setSensorData({
            temperature: sensors[0].temperature,
            humidity: sensors[0].humidity,
          });
        }
      } catch (error) {
        console.error('Error al cargar sensores:', error);
      }
    };

    loadSensors();
    const interval = setInterval(loadSensors, 5000);
    return () => clearInterval(interval);
  }, []);

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No se otorgaron permisos</Text>;

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} />

      <BlurView intensity={50} tint="dark" style={styles.panel}>
        <Text style={styles.panelText}>🌡️ Temp: {sensorData?.temperature ?? '--'}°C</Text>
        <Text style={styles.panelText}>💧 Hum: {sensorData?.humidity ?? '--'}%</Text>
      </BlurView>

      <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.editText}>✏️</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Temperatura"
            keyboardType="numeric"
            value={tempInput}
            onChangeText={setTempInput}
          />
          <TextInput
            style={styles.input}
            placeholder="Humedad"
            keyboardType="numeric"
            value={humInput}
            onChangeText={setHumInput}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
  setSensorData(prev => ({
    temperature: tempInput.trim() === '' ? prev?.temperature ?? 0 : parseFloat(tempInput),
    humidity: humInput.trim() === '' ? prev?.humidity ?? 0 : parseFloat(humInput),
  }));
  setModalVisible(false);
  setTempInput('');
  setHumInput('');
}}
          >
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
panel: {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: [{ translateX: -125 }, { translateY: -60 }],
  width: 250,
  padding: 20,
  borderRadius: 15,
  backgroundColor: 'rgba(0,0,0,0.4)',
  alignItems: 'center',
},
  panelText: {
    color: 'white',
    fontSize: 18,
    marginVertical: 5,
  },
  editButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    elevation: 5,
  },
  editText: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    width: 200,
    borderRadius: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
  },
});
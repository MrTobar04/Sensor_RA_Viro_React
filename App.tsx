import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroTrackingReason,
  ViroTrackingStateConstants,
  ViroFlexView,
  ViroMaterials,
} from "@reactvision/react-viro";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Alert } from "react-native";

// Definir materiales para el panel
ViroMaterials.createMaterials({
  panelMaterial: {
    diffuseColor: "#00000080", // Negro con transparencia
  },
});

// Interfaz para los datos del sensor
interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

const HelloWorldSceneAR = () => {
  const [text, setText] = useState("Initializing AR...");
  const [temperature, setTemperature] = useState("--");
  const [humidity, setHumidity] = useState("--");
  const [lastUpdate, setLastUpdate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos del sensor
  const fetchSensorData = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Para dispositivo físico, usa tu IP local en lugar de localhost
      const response = await fetch('http://192.168.0.4:3001/api/sensor-data', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const sensorData: SensorData = data.data;
        setTemperature(sensorData.temperature.toFixed(1) + '°C');
        setHumidity(sensorData.humidity.toFixed(1) + '%');
        setLastUpdate(new Date(sensorData.timestamp).toLocaleTimeString());
      } else {
        throw new Error('Respuesta no exitosa del servidor');
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Error conectando con el sensor');
      
      // Datos de respaldo simulados
      const randomTemp = (20 + Math.random() * 10).toFixed(1);
      const randomHumidity = (40 + Math.random() * 30).toFixed(1);
      setTemperature(randomTemp + '°C');
      setHumidity(randomHumidity + '%');
      setLastUpdate(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Configurar intervalo para obtener datos cada 5 segundos
  useEffect(() => {
    // Primera llamada inmediata
    fetchSensorData();

    // Configurar intervalo
    const interval = setInterval(fetchSensorData, 5000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [fetchSensorData]);

  function onInitialized(state: any, reason: ViroTrackingReason) {
    console.log("onInitialized", state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setText("Panel de Clima en Tiempo Real");
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      setText("Tracking no disponible");
    }
  }

  // Crear textos concatenados manualmente
  const titleText = "Sensor en Tiempo Real";
  const temperatureText = "Temperatura:_" + temperature;
  const humidityText = "Humedad:_" + humidity;
  
  let statusText = "";
  if (isLoading) {
    statusText = "Actualizando...";
  } else if (error) {
    statusText = "X " + error;
  } else {
    statusText = "Conectado";
  }
  const updateText = statusText + " | " + lastUpdate;

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      {/* Panel flotante con temperatura y humedad */}
      <ViroFlexView
        position={[0, 0.3, -1.5]}
        rotation={[0, 0, 0]}
        width={1.4}
        height={0.9}
        materials={["panelMaterial"]}
        style={styles.panel}
      >
        {/* Título del panel */}
        <ViroText
          text={titleText}
          scale={[0.35, 0.35, 0.35]}
          position={[0, 0.25, 0]}
          style={styles.title}
        />
        
        {/* Temperatura */}
        <ViroText
          text={temperatureText}
          scale={[0.3, 0.3, 0.3]}
          position={[0, 0.05, 0]}
          style={styles.dataText}
        />
        
        {/* Humedad */}
        <ViroText
          text={humidityText}
          scale={[0.3, 0.3, 0.3]}
          position={[0, -0.15, 0]}
          style={styles.dataText}
        />
        
        {/* Estado y última actualización */}
        <ViroText
          text={updateText}
          scale={[0.25, 0.25, 0.25]}
          position={[0, -0.35, 0]}
          style={error ? styles.errorText : styles.updateText}
        />
      </ViroFlexView>

      {/* Texto de inicialización */}
      <ViroText
        text={text}
        scale={[0.3, 0.3, 0.3]}
        position={[0, -0.5, -1]}
        style={styles.helloWorldTextStyle}
      />
    </ViroARScene>
  );
};

export default () => {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: HelloWorldSceneAR,
      }}
      style={styles.f1}
    />
  );
};

const styles = StyleSheet.create({
  f1: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 20,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
  panel: {
    padding: 0.1,
    borderRadius: 0.1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  title: {
    fontFamily: "Arial",
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  dataText: {
    fontFamily: "Arial",
    fontSize: 20,
    color: "#ffffff",
    textAlign: "center",
  },
  updateText: {
    fontFamily: "Arial",
    fontSize: 16,
    color: "#4CAF50",
    textAlign: "center",
  },
  errorText: {
    fontFamily: "Arial",
    fontSize: 16,
    color: "#FF5252",
    textAlign: "center",
  },
});
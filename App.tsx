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
import { StyleSheet } from "react-native";

//  Material para el panel flotante
ViroMaterials.createMaterials({
  panelMaterial: {
    diffuseColor: "#00000088",
  },
});

interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

const HelloWorldSceneAR = () => {
  const [text, setText] = useState("Inicializando AR...");
  const [temperature, setTemperature] = useState("--");
  const [humidity, setHumidity] = useState("--");
  const [lastUpdate, setLastUpdate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTemp, setIsEditingTemp] = useState(false);
  const [isEditingHumidity, setIsEditingHumidity] = useState(false);
  const [pauseFetch, setPauseFetch] = useState(false);


  // Función para obtener datos del sensor
  const fetchSensorData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://192.168.1.100:8080/api/sensor-data", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        const sensorData: SensorData = data.data;
        setTemperature(sensorData.temperature.toFixed(1) + "°C");
        setHumidity(sensorData.humidity.toFixed(1) + "%");
        setLastUpdate(new Date(sensorData.timestamp).toLocaleTimeString());
      } else {
        throw new Error("Respuesta no exitosa del servidor");
      }
    } catch (err) {
      console.error("Error fetching sensor data:", err);
      setError("Error conectando con el sensor");

      // Datos simulados
      const randomTemp = (20 + Math.random() * 10).toFixed(1);
      const randomHumidity = (40 + Math.random() * 30).toFixed(1);
      setTemperature(randomTemp + "°C");
      setHumidity(randomHumidity + "%");
      setLastUpdate(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Configurar intervalo para obtener datos cada 5 segundos
  useEffect(() => {
  if (pauseFetch) return; //  Detener actualización si está pausada

  fetchSensorData(); //  Primera llamada inmediata

  const interval = setInterval(fetchSensorData, 5000); //  Actualización cada 5 segundos

  return () => clearInterval(interval); //  Limpieza al desmontar
}, [fetchSensorData, pauseFetch]);

  function onInitialized(state: any, reason: ViroTrackingReason) {
    console.log("onInitialized", state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setText("Panel de Clima en Tiempo Real ");
    } else {
      setText("Tracking no disponible");
    }
  }

  // Crear textos concatenados manualmente
  const titleText = "Sensor";
  const locationText = "13.6929°N-89.2182°W";
  const temperatureText = "Temperatura:_" + temperature;
  const humidityText = "Humedad:_" + humidity;
  const updateText = (isLoading ? "Actualizando..." : error ? "X " + error : "Conectado") + " | " + lastUpdate;

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      {/* Panel principal */}
     
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
     
  scale={[0.3, 0.3, 0.3]}
  position={[0, 0.6, -1.5]} 
  style={styles.title}
/>
<ViroText
  text={locationText}
  scale={[0.25, 0.25, 0.25]}
  position={[0, -0.6, 0]} // ajusta según tu layout
  style={styles.title}
/>
        <ViroText
         text={temperatureText} 
         scale={[0.3, 0.3, 0.3]} 
         position={[0, 0.0, 0]} 
         style={styles.dataText} />

        <ViroText
         text={humidityText} 
         scale={[0.3, 0.3, 0.3]} 
         position={[0, -0.15, 0]} 
         style={styles.dataText} />

        <ViroText 
        text={updateText} 
        scale={[0.25, 0.25, 0.25]}
         position={[0, -0.35, 0]} 
         style={error ? styles.errorText : styles.updateText} />

        <ViroText
          text="[T]"
          position={[-0.6, -0.55, 0]}
           scale={[0.35, 0.35, 0.35]}
          style={styles.editButton}
          onClickState={(state) => state === 1 && setIsEditingTemp(true)}
        />
        <ViroText
          text="[H]"
          position={[0.6, -0.55, 0]}
          scale={[0.35, 0.35, 0.35]}
          style={styles.editButton}
          onClickState={(state) => state === 1 && setIsEditingHumidity(true)}
        />
      </ViroFlexView>

      {/* Opciones para editar temperatura */}
     {isEditingTemp && (
  <>
    <ViroText
      text="30.0°C"
      position={[-0.4, -0.9, -1.5]}
      scale={[0.3, 0.3, 0.3]} // más grande
      style={styles.optionButton}
      onClickState={(s) => {
        if (s === 1) {
          setTemperature("30.0°C");
          setPauseFetch(true);
          setTimeout(() => setPauseFetch(false), 10000); // Reactivar después de 10s
          setIsEditingTemp(false);
        }
      }}
    />
    <ViroText
      text="32.5°C"
      position={[0, -0.9, -1.5]}
      scale={[0.3, 0.3, 0.3]}
      style={styles.optionButton}
      onClickState={(s) => {
        if (s === 1) {
          setTemperature("32.5°C");
          setPauseFetch(true);
          setTimeout(() => setPauseFetch(false), 10000);
          setIsEditingTemp(false);
        }
      }}
    />
    <ViroText
      text="Cancelar"
      position={[0.4, -0.9, -1.5]}
      scale={[0.3, 0.3, 0.3]}
      style={styles.cancelButton}
      onClickState={(s) => {
        if (s === 1) setIsEditingTemp(false);
      }}
    />
  </>
)}

      {/* Opciones para editar humedad */}
      {isEditingHumidity && (
  <>
    <ViroText
      text="45%"
      position={[-0.4, -1, -1.5]}
      scale={[0.3, 0.3, 0.3]} // más grande
      style={styles.optionButton}
      onClickState={(s) => {
        if (s === 1) {
          setHumidity("45%");
          setPauseFetch(true);
          setTimeout(() => setPauseFetch(false), 10000); // Reactivar después de 10s
          setIsEditingHumidity(false);
        }
      }}
    />
    <ViroText
      text="60%"
      position={[0, -1, -1.5]}
      scale={[0.3, 0.3, 0.3]}
      style={styles.optionButton}
      onClickState={(s) => {
        if (s === 1) {
          setHumidity("60%");
          setPauseFetch(true);
          setTimeout(() => setPauseFetch(false), 10000);
          setIsEditingHumidity(false);
        }
      }}
    />
    <ViroText
      text="Cancelar"
      position={[0.4, -1, -1.5]}
      scale={[0.3, 0.3, 0.3]}
      style={styles.cancelButton}
      onClickState={(s) => {
        if (s === 1) setIsEditingHumidity(false);
      }}
    />
  </>
)}

      {/* Estado de tracking */}
     <ViroText
  text={text}
  scale={[0.3, 0.3, 0.3]}
  position={[0, -0.3, -1]} // más arriba
  style={styles.helloWorldTextStyle}
/>
    </ViroARScene>
  );
};

export default () => (
  <ViroARSceneNavigator
    autofocus={true}
    initialScene={{ scene: HelloWorldSceneAR }}
    style={styles.f1}
  />
);

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
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Arial",
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
  dataText: {     
    fontFamily: "Arial",
    fontSize: 20,
    color: "#ffffffff",


    textAlign: "center",    textAlignVertical: "center",
  },
  updateText: {   
    fontFamily: "Arial",
    fontSize: 15,
    color: "#14805cff",

    textAlign: "center",    textAlignVertical: "center",
  },
  errorText: {    
    fontFamily: "Arial",
    fontSize: 15,
    color: "#ff4444",
    textAlign: "center",    textAlignVertical: "center",
  },
  editButton: {
    fontFamily: "Arial",
    fontSize: 12,
    color: "#00aaff",
    textDecorationLine: "underline",  
    textAlign: "center",    textAlignVertical: "center",
  },
  optionButton: { 
    fontFamily: "Arial",
    fontSize: 18,
    color: "#00ff00",
    textAlign: "center",
    textAlignVertical: "center",  
    textDecorationLine: "underline",
  },
  cancelButton: {

    fontFamily: "Arial",    
    fontSize: 18,
    color: "#ff4444",
    textAlign: "center",
    textAlignVertical: "center",
    textDecorationLine: "underline",
  },
});

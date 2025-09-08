// server.js - Servidor simulado de datos del sensor
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Datos iniciales del sensor
let sensorData = {
  temperature: 23.5,
  humidity: 45.0,
  timestamp: new Date().toISOString()
};

// Simular fluctuaciones realistas
function updateSensorData() {
  // Fluctuación suave de temperatura (±1°C)
  const tempChange = (Math.random() - 0.5) * 2;
  // Fluctuación suave de humedad (±3%)
  const humidityChange = (Math.random() - 0.5) * 6;
  
  sensorData = {
    temperature: Math.max(15, Math.min(35, sensorData.temperature + tempChange)),
    humidity: Math.max(20, Math.min(80, sensorData.humidity + humidityChange)),
    timestamp: new Date().toISOString()
  };
  
  console.log('Datos actualizados:', sensorData);
}

// Actualizar datos cada 2 segundos
setInterval(updateSensorData, 2000);

// Rutas de la API
app.get('/api/sensor-data', (req, res) => {
  res.json({
    success: true,
    data: sensorData,
    message: 'Datos del sensor obtenidos exitosamente'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sensor API funcionando' });
});

// Ruta para configurar datos manualmente (opcional)
app.post('/api/sensor-data', (req, res) => {
  const { temperature, humidity } = req.body;
  
  if (temperature !== undefined) {
    sensorData.temperature = parseFloat(temperature);
  }
  
  if (humidity !== undefined) {
    sensorData.humidity = parseFloat(humidity);
  }
  
  sensorData.timestamp = new Date().toISOString();
  
  res.json({
    success: true,
    data: sensorData,
    message: 'Datos actualizados manualmente'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Sensor API running on http://localhost:${PORT}`);
  console.log('📊 Endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/sensor-data`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/sensor-data`);
});
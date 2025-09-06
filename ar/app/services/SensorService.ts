// SensorService.ts
export async function fetchSensors() {
  const response = await fetch('http://192.168.1.100:8080/api/sensors');
  const json = await response.json();
  return json.sensors;
}
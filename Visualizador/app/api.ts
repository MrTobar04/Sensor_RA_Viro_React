// app/api.ts
import axios from 'axios';
import { API_BASE_URL } from '@env';

export type Sensor = {
  id: string;
  location: string;
  temperature: number;
  humidity: number;
  status: string;
  updatedAt: string;
};

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
});

export async function fetchSensors(): Promise<Sensor[]> {
  const resp = await client.get('/api/sensors');
  return resp.data.sensors as Sensor[];
}

export async function fetchSensorById(id: string): Promise<Sensor> {
  const resp = await client.get(`/api/sensors/${id}`);
  return resp.data as Sensor;
}

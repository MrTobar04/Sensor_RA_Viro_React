import express from 'express';
import cors from 'cors';


const app = express();
app.use(cors());
const PORT = process.env.PORT || 8080;


// Simulador básico con deriva pseudo-aleatoria
const sensors = [
    { id: 'T-001', location: 'Sala de Bombas', temperature: 24.8, humidity: 58, status: 'OK' },
    { id: 'T-002', location: 'Bodega Norte', temperature: 26.1, humidity: 62, status: 'OK' }
];


function jitter(val, maxDelta = 0.7) {
    const d = (Math.random() * maxDelta * 2) - maxDelta;
    return Math.round((val + d) * 10) / 10;
}


app.get('/api/sensors', (req, res) => {
    const now = new Date().toISOString();
    const data = sensors.map(s => ({
        ...s,
        temperature: jitter(s.temperature),
        humidity: Math.min(100, Math.max(0, Math.round(jitter(s.humidity, 2)))),
        updatedAt: now
    }));
    res.json({ sensors: data });
});


app.get('/api/sensors/:id', (req, res) => {
    const { id } = req.params;
    const base = sensors.find(s => s.id === id);
    if (!base) return res.status(404).json({ error: 'not_found' });
    const now = new Date().toISOString();
    const data = {
        ...base,
        temperature: jitter(base.temperature),
        humidity: Math.min(100, Math.max(0, Math.round(jitter(base.humidity, 2)))),
        updatedAt: now
    };
    res.json(data);
});


app.listen(PORT, () => console.log(`API ready on :${PORT}`));
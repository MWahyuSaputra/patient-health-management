import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import mqtt from 'mqtt';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sensor_data_iot',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Get all health metrics
app.get('/api/health-metrics', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_metrics ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all therapy sessions
app.get('/api/therapy-sessions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM therapy_sessions ORDER BY scheduled_time DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching therapy sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe-patient', (patientId) => {
    socket.join(`patient-${patientId}`);
    console.log(`Client ${socket.id} subscribed to patient ${patientId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MQTT connection
const mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_BROKER_HOST || 'broker.emqx.io'}:${process.env.MQTT_BROKER_PORT || '1883'}`, {
  clientId: process.env.MQTT_CLIENT_ID || 'patient_health_app'
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe(['patient/+/health', 'patient/+/device'], (err) => {
    if (err) {
      console.error('MQTT subscription error:', err);
    } else {
      console.log('Subscribed to MQTT topics');
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log('Received MQTT message:', topic, data);

    // Store health metrics in database
    if (topic.startsWith('patient/') && topic.includes('/health')) {
      const patientId = topic.split('/')[1];
      
      await pool.query(
        'INSERT INTO health_metrics (patient_id, heart_rate, spo2, muscle_activity, temperature, device_id) VALUES (?, ?, ?, ?, ?, ?)',
        [patientId, data.heart_rate, data.spo2, data.muscle_activity, data.temperature, data.device_id]
      );

      // Emit real-time update to connected clients
      io.to(`patient-${patientId}`).emit('health-update', {
        patient_id: patientId,
        ...data,
        timestamp: new Date()
      });
    }

    // Handle device status updates
    if (topic.startsWith('patient/') && topic.includes('/device')) {
      const patientId = topic.split('/')[1];
      io.to(`patient-${patientId}`).emit('device-status', data);
    }
  } catch (error) {
    console.error('Error handling MQTT message:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT connection error:', error);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

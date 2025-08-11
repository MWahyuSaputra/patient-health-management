import express from 'express';
import { pool } from '../config/database';

const router = express.Router();

// Get all health metrics
router.get('/metrics', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_metrics ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get health metrics for specific patient
router.get('/metrics/:patientId', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const [rows] = await pool.query(
      'SELECT * FROM health_metrics WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 50',
      [patientId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patient health metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new health metric
router.post('/metrics', async (req, res) => {
  try {
    const { patient_id, heart_rate, spo2, muscle_activity, temperature, device_id } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO health_metrics (patient_id, heart_rate, spo2, muscle_activity, temperature, device_id) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, heart_rate, spo2, muscle_activity, temperature, device_id]
    );
    
    res.json({ id: (result as any).insertId, message: 'Health metric added successfully' });
  } catch (error) {
    console.error('Error adding health metric:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

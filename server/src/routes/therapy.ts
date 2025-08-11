import express from 'express';
import { pool } from '../config/database';

const router = express.Router();

// Get all therapy sessions
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM therapy_sessions ORDER BY scheduled_time DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching therapy sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get therapy sessions for specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const [rows] = await pool.query(
      'SELECT * FROM therapy_sessions WHERE patient_id = ? ORDER BY scheduled_time DESC',
      [patientId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patient therapy sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new therapy session
router.post('/', async (req, res) => {
  try {
    const { patient_id, session_type, scheduled_time, duration_minutes, notes } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO therapy_sessions (patient_id, session_type, scheduled_time, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)',
      [patient_id, session_type, scheduled_time, duration_minutes, notes]
    );
    
    res.json({ id: (result as any).insertId, message: 'Therapy session created successfully' });
  } catch (error) {
    console.error('Error creating therapy session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update therapy session
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { session_type, scheduled_time, duration_minutes, status, notes } = req.body;
    
    const [result] = await pool.query(
      'UPDATE therapy_sessions SET session_type = ?, scheduled_time = ?, duration_minutes = ?, status = ?, notes = ? WHERE id = ?',
      [session_type, scheduled_time, duration_minutes, status, notes, id]
    );
    
    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: 'Therapy session not found' });
      return;
    }
    
    res.json({ message: 'Therapy session updated successfully' });
  } catch (error) {
    console.error('Error updating therapy session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete therapy session
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM therapy_sessions WHERE id = ?', [id]);
    
    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: 'Therapy session not found' });
      return;
    }
    
    res.json({ message: 'Therapy session deleted successfully' });
  } catch (error) {
    console.error('Error deleting therapy session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

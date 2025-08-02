const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// POST /members - Create a new member
app.post('/members', async (req, res) => {
  const { user_name, latitude, longitude } = req.body;

  if (!user_name) {
    return res.status(400).json({ error: 'user_name is required' });
  }

  try {
    await pool.query(
      `INSERT INTO members (username, latitude, longitude) VALUES ($1, $2, $3)`,
      [user_name, latitude || null, longitude || null]
    );
    res.status(201).json({ message: 'Member created successfully' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'username already exists' });
    }
    console.error('Error creating member:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PATCH /members - Update existing member location
app.patch('/members', async (req, res) => {
  const { user_name, latitude, longitude } = req.body;

  if (!user_name) {
    return res.status(400).json({ error: 'user_name is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE members SET latitude = $1, longitude = $2 WHERE user_name = $3`,
      [latitude || null, longitude || null, user_name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member location updated successfully' });
  } catch (err) {
    console.error('Error updating member location:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /members - Fetch members, optionally filtered by user_name
app.get('/members', async (req, res) => {
  try {
    const { user_name } = req.query;
    let query = 'SELECT * FROM members';
    let params = [];

    if (user_name) {
      query += ' WHERE user_name = $1';
      params.push(user_name);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

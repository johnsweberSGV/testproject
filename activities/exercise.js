const express = require('express');
const router = express.Router();

let db;
function setDb(database) { db = database; }

// GET /api/exercise
router.get('/', (req, res) => {
  const { mood, id } = req.query;
  if (id) {
    db.get('SELECT * FROM exercises WHERE id = ?', [id], (err, exercise) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
      res.json(exercise);
    });
    return;
  }
  if (!mood) return res.status(400).json({ error: 'Mood is required' });
  db.all('SELECT * FROM exercises WHERE mood = ?', [mood], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: 'No exercises found for this mood' });
    const exercise = rows[Math.floor(Math.random() * rows.length)];
    res.json(exercise);
  });
});

module.exports = { router, setDb }; 
const express = require('express');
const router = express.Router();

// The db and any shared utilities (like getZodiacSign) should be passed in from index.js
let db;
function setDb(database) { db = database; }

// GET /api/recipe
router.get('/', (req, res) => {
  const { mood, id } = req.query;
  if (id) {
    db.get('SELECT * FROM recipes WHERE id = ?', [id], (err, recipe) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
      res.json(recipe);
    });
    return;
  }
  if (!mood) return res.status(400).json({ error: 'Mood is required' });
  db.all('SELECT * FROM recipes WHERE mood = ?', [mood], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: 'No recipes found for this mood' });
    const recipe = rows[Math.floor(Math.random() * rows.length)];
    res.json(recipe);
  });
});

module.exports = { router, setDb }; 
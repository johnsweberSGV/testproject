const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

let db;
let getZodiacSign;
function setDeps(database, zodiacFn) {
  db = database;
  getZodiacSign = zodiacFn;
}

// GET /api/horoscope
router.get('/', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  db.get('SELECT birthday, sign FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'User not found' });
    let sign = user.sign;
    if (!sign) {
      const [year, month, day] = user.birthday.split('-').map(Number);
      sign = getZodiacSign(month, day);
      db.run('UPDATE users SET sign = ? WHERE id = ?', [sign, req.session.userId]);
    }
    try {
      const response = await fetch(`https://ohmanda.com/api/horoscope/${sign}`);
      const data = await response.json();
      res.json({ sign, description: data.horoscope, ...data });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch horoscope' });
    }
  });
});

module.exports = { router, setDeps }; 
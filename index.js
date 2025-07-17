const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const fetch = require('node-fetch');

function getZodiacSign(month, day) {
  const zodiac = [
    { sign: 'capricorn', from: [1, 1], to: [1, 19] },
    { sign: 'aquarius', from: [1, 20], to: [2, 18] },
    { sign: 'pisces', from: [2, 19], to: [3, 20] },
    { sign: 'aries', from: [3, 21], to: [4, 19] },
    { sign: 'taurus', from: [4, 20], to: [5, 20] },
    { sign: 'gemini', from: [5, 21], to: [6, 20] },
    { sign: 'cancer', from: [6, 21], to: [7, 22] },
    { sign: 'leo', from: [7, 23], to: [8, 22] },
    { sign: 'virgo', from: [8, 23], to: [9, 22] },
    { sign: 'libra', from: [9, 23], to: [10, 22] },
    { sign: 'scorpio', from: [10, 23], to: [11, 21] },
    { sign: 'sagittarius', from: [11, 22], to: [12, 21] },
    { sign: 'capricorn', from: [12, 22], to: [12, 31] },
  ];
  for (const z of zodiac) {
    const [fromM, fromD] = z.from;
    const [toM, toD] = z.to;
    if (
      (month === fromM && day >= fromD) ||
      (month === toM && day <= toD)
    ) {
      return z.sign;
    }
  }
  return 'capricorn';
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

// SQLite setup
const db = new sqlite3.Database(path.join(__dirname, 'recipes.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    mood TEXT NOT NULL,
    image_url TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    mood TEXT NOT NULL,
    image_url TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birthday TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )`);

  // Seed with some recipes if table is empty
  db.get('SELECT COUNT(*) as count FROM recipes', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO recipes (title, ingredients, instructions, mood) VALUES (?, ?, ?, ?)');
      stmt.run('Happy Pancakes', 'Flour, Eggs, Milk, Sugar', 'Mix and cook on skillet.', 'happy');
      stmt.run('Comfort Soup', 'Chicken, Carrots, Celery, Noodles', 'Boil and simmer.', 'sad');
      stmt.run('Adventure Curry', 'Chickpeas, Coconut Milk, Spices', 'Cook all together.', 'adventurous');
      stmt.run('Chill Smoothie', 'Banana, Yogurt, Berries', 'Blend until smooth.', 'relaxed');
      stmt.run('Energizer Salad', 'Spinach, Nuts, Berries, Feta', 'Toss and serve.', 'energetic');
      stmt.finalize();
    }
  });

  // Seed with some exercises if table is empty
  db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO exercises (title, description, mood) VALUES (?, ?, ?)');
      stmt.run('Happy Dance', 'Put on your favorite song and dance for 3 minutes.', 'happy');
      stmt.run('Comfort Stretch', 'Do a gentle full-body stretch for 5 minutes.', 'sad');
      stmt.run('Adventure Walk', 'Take a walk in a new neighborhood or park.', 'adventurous');
      stmt.run('Chill Breathing', 'Sit quietly and take deep breaths for 2 minutes.', 'relaxed');
      stmt.run('Energizer Jump', 'Do 20 jumping jacks to boost your energy.', 'energetic');
      stmt.finalize();
    }
  });
});

// Register endpoint
app.post('/api/register', (req, res) => {
  const { firstName, lastName, birthday, email, password } = req.body;
  if (!firstName || !lastName || !birthday || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (first_name, last_name, birthday, email, password_hash) VALUES (?, ?, ?, ?, ?)',
    [firstName, lastName, birthday, email, passwordHash],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: err.message });
      }
      req.session.userId = this.lastID;
      res.json({ success: true });
    }
  );
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    req.session.userId = user.id;
    res.json({ success: true });
  });
});

// Logout endpoint
app.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Get current user endpoint
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json(null);
  db.get('SELECT id, first_name, last_name, birthday, email FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(user || null);
  });
});

// Get available moods
app.get('/api/moods', (req, res) => {
  db.all('SELECT DISTINCT mood FROM recipes', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.mood));
  });
});

// Update /api/recipe to support id param
app.get('/api/recipe', (req, res) => {
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

// Update /api/exercise to support id param
app.get('/api/exercise', (req, res) => {
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

app.get('/api/horoscope', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  db.get('SELECT birthday FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'User not found' });
    const [year, month, day] = user.birthday.split('-').map(Number);
    const sign = getZodiacSign(month, day);
    try {
      const response = await fetch(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, { method: 'POST' });
      const data = await response.json();
      res.json({ sign, ...data });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch horoscope' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const fetch = require('node-fetch');
const recipeModule = require('./activities/recipe');
const exerciseModule = require('./activities/exercise');
const horoscopeModule = require('./activities/horoscope');

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
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
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
    image_url TEXT,
    flavor_text TEXT
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
    password_hash TEXT NOT NULL,
    sign TEXT
  )`);

  // Seed with expanded recipes if table is empty
  db.get('SELECT COUNT(*) as count FROM recipes', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO recipes (title, ingredients, instructions, mood, image_url, flavor_text) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(
        'Happy Pancakes',
        '1 cup flour, 2 eggs, 1 cup milk, 2 tbsp sugar, 1 tsp baking powder, pinch of salt',
        '1. In a bowl, whisk together flour, sugar, baking powder, and salt.\n2. In another bowl, beat eggs and milk.\n3. Combine wet and dry ingredients.\n4. Heat a skillet and pour 1/4 cup batter for each pancake.\n5. Cook until bubbles form, flip, and cook until golden.\n6. Serve warm with syrup.',
        'happy',
        '/images/recipe_1.png',
        'Great for a day when you’re feeling down or need a pick-me-up. These fluffy pancakes are sure to bring a smile to your face and warmth to your morning.'
      );
      stmt.run(
        'Comfort Chicken Noodle Soup',
        '2 chicken breasts, 2 carrots (sliced), 2 celery stalks (sliced), 1 onion (diced), 4 cups chicken broth, 1 cup egg noodles, salt & pepper to taste',
        '1. In a large pot, sauté onion, carrots, and celery until soft.\n2. Add chicken breasts and broth.\n3. Bring to a boil, then simmer until chicken is cooked.\n4. Remove chicken, shred, and return to pot.\n5. Add noodles and cook until tender.\n6. Season and serve hot.',
        'sad',
        '/images/recipe_2.png',
        'A bowl of this classic soup is like a warm hug. Perfect for days when you need comfort and a little extra care.'
      );
      stmt.run(
        'Adventure Chickpea Curry',
        '1 can chickpeas, 1 can coconut milk, 1 onion (diced), 2 cloves garlic (minced), 1 tbsp curry powder, 1 tsp cumin, 1 tsp turmeric, salt to taste',
        '1. Sauté onion and garlic in a pan until fragrant.\n2. Add curry powder, cumin, and turmeric.\n3. Stir in chickpeas and coconut milk.\n4. Simmer for 15 minutes.\n5. Serve with rice or naan.',
        'adventurous',
        '/images/recipe_3.png',
        'Spice up your day with this bold, flavorful curry. Perfect for when you’re feeling adventurous and want to try something new!'
      );
      stmt.run(
        'Chill Berry Smoothie',
        '1 banana, 1/2 cup yogurt, 1/2 cup mixed berries, 1/2 cup milk, 1 tbsp honey',
        '1. Add banana, yogurt, berries, milk, and honey to a blender.\n2. Blend until smooth.\n3. Pour into a glass and enjoy chilled.',
        'relaxed',
        '/images/recipe_4.png',
        'A cool, refreshing treat for a laid-back afternoon. This smoothie is perfect for unwinding and recharging.'
      );
      stmt.run(
        'Energizer Spinach Salad',
        '2 cups spinach, 1/4 cup walnuts, 1/4 cup dried cranberries, 1/4 cup feta cheese, 2 tbsp balsamic vinaigrette',
        '1. Place spinach in a bowl.\n2. Top with walnuts, cranberries, and feta.\n3. Drizzle with vinaigrette and toss gently.\n4. Serve immediately.',
        'energetic',
        '/images/recipe_5.png',
        'Packed with nutrients and flavor, this salad will give you the boost you need to power through your day.'
      );
      stmt.run(
        'Cozy Mac & Cheese',
        '2 cups elbow macaroni, 2 cups shredded cheddar, 2 tbsp butter, 2 tbsp flour, 2 cups milk, salt & pepper',
        '1. Cook macaroni and drain.\n2. In a saucepan, melt butter and whisk in flour.\n3. Gradually add milk, stirring until thickened.\n4. Add cheese, stir until melted.\n5. Combine with macaroni, season, and serve hot.',
        'sad',
        '/images/recipe_6.png',
        'Creamy, cheesy, and oh-so-comforting. This dish is a classic for when you need a little extra warmth.'
      );
      stmt.run(
        'Sunshine Avocado Toast',
        '2 slices whole grain bread, 1 ripe avocado, 1/2 lemon, salt, pepper, chili flakes',
        '1. Toast bread slices.\n2. Mash avocado with lemon juice, salt, and pepper.\n3. Spread on toast and sprinkle with chili flakes.\n4. Enjoy immediately.',
        'happy',
        '/images/recipe_7.png',
        'Brighten your morning with this zesty, nutritious toast. It’s a simple pleasure that feels like a treat.'
      );
      stmt.run(
        'Explorer’s Veggie Stir-Fry',
        '1 cup broccoli florets, 1 bell pepper (sliced), 1 carrot (sliced), 1/2 cup snap peas, 2 tbsp soy sauce, 1 tbsp sesame oil, 1 clove garlic',
        '1. Heat sesame oil in a wok.\n2. Add garlic and vegetables, stir-fry for 5-7 minutes.\n3. Add soy sauce, toss to coat.\n4. Serve hot over rice.',
        'adventurous',
        '/images/recipe_8.png',
        'A colorful, crunchy stir-fry for when you’re ready to explore new flavors and textures.'
      );
      stmt.run(
        'Serenity Herbal Tea',
        '1 cup hot water, 1 chamomile tea bag, 1 tsp honey, 1 slice lemon',
        '1. Steep tea bag in hot water for 3-5 minutes.\n2. Add honey and lemon.\n3. Sip slowly and relax.',
        'relaxed',
        '/images/recipe_9.png',
        'A calming cup of tea to help you unwind and find your center. Perfect for quiet moments.'
      );
      stmt.run(
        'Power Protein Bowl',
        '1/2 cup cooked quinoa, 1/2 cup black beans, 1/2 cup corn, 1/4 cup diced tomatoes, 1/4 avocado, 1 tbsp olive oil, salt & pepper',
        '1. Combine quinoa, beans, corn, and tomatoes in a bowl.\n2. Top with avocado and drizzle with olive oil.\n3. Season and enjoy.',
        'energetic',
        '/images/recipe_10.png',
        'Fuel your body and mind with this protein-packed bowl. Great for days when you need lasting energy.'
      );
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

// Set db and utility dependencies for routers
recipeModule.setDb(db);
exerciseModule.setDb(db);
horoscopeModule.setDeps(db, getZodiacSign);

// --- AUTHENTICATION ENDPOINTS ---

// Register
app.post('/api/register', (req, res) => {
  const { firstName, lastName, birthday, email, password } = req.body;
  if (!firstName || !lastName || !birthday || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (user) return res.status(400).json({ error: 'Email already registered' });
    const [year, month, day] = birthday.split('-').map(Number);
    const sign = getZodiacSign(month, day);
    const passwordHash = bcrypt.hashSync(password, 10);
    db.run(
      'INSERT INTO users (first_name, last_name, birthday, email, password_hash, sign) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, birthday, email, passwordHash, sign],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        req.session.userId = this.lastID;
        res.json({ success: true });
      }
    );
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    req.session.userId = user.id;
    res.json({ success: true });
  });
});

// Logout
app.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Get current user
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json(null);
  db.get('SELECT id, first_name, last_name, birthday, email, sign FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
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

// Use modular routers for activities
app.use('/api/recipe', recipeModule.router);
app.use('/api/exercise', exerciseModule.router);
app.use('/api/horoscope', horoscopeModule.router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 
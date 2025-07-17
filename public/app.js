const moodTiles = document.getElementById('mood-tiles');
const optionsIcons = document.getElementById('options-icons');
const backBtn = document.getElementById('back-btn');
const logoutBtn = document.getElementById('logout-btn');
const authMessage = document.getElementById('auth-message');
const authSection = document.getElementById('auth-section');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerFirstName = document.getElementById('register-firstname');
const registerLastName = document.getElementById('register-lastname');
const registerBirthday = document.getElementById('register-birthday');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const mainSection = document.getElementById('main-section');

const moodIcons = {
  happy: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>',
  sad: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 14.828a4 4 0 005.656 0M9 10h.01M15 10h.01M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>',
  adventurous: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>',
  relaxed: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9M12 4v16m0 0H3m9 0a9 9 0 100-18 9 9 0 000 18z" /></svg>',
  energetic: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
};

let currentMood = '';
const recipeDiv = document.getElementById('recipe');
const recipeTitle = document.getElementById('recipe-title');
const recipeIngredients = document.getElementById('recipe-ingredients');
const recipeInstructions = document.getElementById('recipe-instructions');
const exerciseDiv = document.getElementById('exercise');
const exerciseTitle = document.getElementById('exercise-title');
const exerciseDescription = document.getElementById('exercise-description');
const horoscopeDiv = document.getElementById('horoscope');
const horoscopeSign = document.getElementById('horoscope-sign');
const horoscopeText = document.getElementById('horoscope-text');
const detailContent = document.getElementById('detail-content');
const detailScreen = document.getElementById('detail-screen');
const welcomeMessage = document.getElementById('welcome-message');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const selectedMoodHeader = document.getElementById('selected-mood-header');

function renderSelectedMoodHeader(mood) {
  if (!mood) {
    selectedMoodHeader.classList.add('hidden');
    selectedMoodHeader.innerHTML = '';
    return;
  }
  selectedMoodHeader.classList.remove('hidden');
  selectedMoodHeader.innerHTML = `
    <div class="flex flex-col items-center justify-center bg-blue-100 text-blue-700 rounded-xl p-4 shadow transition">
      ${(moodIcons[mood] || '')}
      <span class="text-xs font-semibold">${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
    </div>
  `;
}

function showMoodTiles() {
  moodTiles.classList.remove('hidden');
}

function hideMoodTiles() {
  moodTiles.classList.add('hidden');
}

function renderMoodTiles(moods) {
  moodTiles.innerHTML = '';
  moods.forEach(mood => {
    const tile = document.createElement('button');
    tile.className = 'flex flex-col items-center justify-center bg-gray-100 hover:bg-blue-200 text-gray-700 rounded-xl p-4 shadow transition';
    tile.innerHTML = `${moodIcons[mood] || ''}<span class="text-xs font-semibold">${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>`;
    tile.onclick = () => {
      currentMood = mood;
      optionsIcons.classList.remove('hidden');
      Array.from(moodTiles.children).forEach(child => child.classList.remove('ring-4', 'ring-blue-400'));
      tile.classList.add('ring-4', 'ring-blue-400');
      recipeDiv.classList.add('hidden');
      exerciseDiv.classList.add('hidden');
      horoscopeDiv.classList.add('hidden');
      renderSelectedMoodHeader(mood);
      hideMoodTiles();
    };
    moodTiles.appendChild(tile);
  });
}

async function fetchMoods() {
  const res = await fetch('/api/moods');
  const moods = await res.json();
  renderMoodTiles(moods);
  renderSelectedMoodHeader(currentMood);
  showMoodTiles();
}

function renderRecipeDetail(recipe) {
  // Split ingredients by comma or newline, trim, and filter out empty
  const ingredientsList = (recipe.ingredients || '')
    .split(/,|\n/)
    .map(i => i.trim())
    .filter(Boolean)
    .map(i => `<li class='mb-1'>${i}</li>`) // each ingredient in its own row
    .join('');
  return `
    <div class="flex flex-col items-center bg-yellow-50 rounded-2xl p-6 shadow-lg max-w-3xl mx-auto border-4 border-yellow-200">
      <img src="${recipe.image_url || ''}" alt="${recipe.title}" class="rounded-xl w-48 h-48 object-cover mb-4 shadow border-4 border-yellow-200" />
      <h2 class="text-3xl font-cursive font-bold mb-2 text-yellow-900">${recipe.title}</h2>
      <div class="italic text-gray-600 mb-4 text-center px-2">${recipe.flavor_text || ''}</div>
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold text-lg mb-1 text-yellow-800">Ingredients</h3>
          <ul class="bg-white rounded p-2 shadow-inner text-gray-800 list-disc list-inside">${ingredientsList}</ul>
        </div>
        <div>
          <h3 class="font-semibold text-lg mb-1 text-yellow-800">Instructions</h3>
          <div class="bg-white rounded p-2 shadow-inner text-gray-800 whitespace-pre-line">${recipe.instructions.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    </div>
  `;
}

async function fetchRecipe(mood) {
  const res = await fetch(`/api/recipe?mood=${encodeURIComponent(mood)}`);
  if (!res.ok) {
    recipeDiv.classList.add('hidden');
    alert('No recipe found for this mood!');
    return;
  }
  const recipe = await res.json();
  showDetail(renderRecipeDetail(recipe), `/recipe/${recipe.id}`);
  recipeDiv.classList.add('hidden');
  exerciseDiv.classList.add('hidden');
}

async function fetchExercise(mood) {
  const res = await fetch(`/api/exercise?mood=${encodeURIComponent(mood)}`);
  if (!res.ok) {
    exerciseDiv.classList.add('hidden');
    alert('No exercise found for this mood!');
    return;
  }
  const exercise = await res.json();
  exerciseTitle.textContent = exercise.title;
  exerciseDescription.textContent = exercise.description;
  exerciseDiv.classList.remove('hidden');
  recipeDiv.classList.add('hidden');
}

async function fetchHoroscope() {
  const res = await fetch('/api/horoscope');
  if (!res.ok) {
    horoscopeDiv.classList.add('hidden');
    alert('Could not fetch horoscope.');
    return;
  }
  const data = await res.json();
  horoscopeSign.textContent = data.sign.charAt(0).toUpperCase() + data.sign.slice(1);
  horoscopeText.textContent = data.description;
  horoscopeDiv.classList.remove('hidden');
  recipeDiv.classList.add('hidden');
  exerciseDiv.classList.add('hidden');
}

function showDetail(contentHtml, path) {
  optionsIcons.classList.add('hidden');
  recipeDiv.classList.add('hidden');
  exerciseDiv.classList.add('hidden');
  horoscopeDiv.classList.add('hidden');
  detailContent.innerHTML = contentHtml;
  detailScreen.classList.remove('hidden');
  if (path) {
    window.history.pushState({ path }, '', path);
  }
}

function hideDetail() {
  detailScreen.classList.add('hidden');
  optionsIcons.classList.remove('hidden');
  window.history.pushState({}, '', '/');
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.path) {
    // Re-render the detail screen for the path
    renderDetailFromPath(event.state.path);
  } else {
    hideDetail();
  }
});

async function renderDetailFromPath(path) {
  if (path.startsWith('/recipe/')) {
    const id = path.split('/')[2];
    const res = await fetch(`/api/recipe?id=${id}`);
    if (!res.ok) return hideDetail();
    const recipe = await res.json();
    showDetail(renderRecipeDetail(recipe));
  } else if (path.startsWith('/exercise/')) {
    const id = path.split('/')[2];
    const res = await fetch(`/api/exercise?id=${id}`);
    if (!res.ok) return hideDetail();
    const exercise = await res.json();
    showDetail(`
      <div class="flex flex-col items-center">
        <img src="${exercise.image_url || ''}" alt="${exercise.title}" class="rounded-xl w-48 h-48 object-contain mb-4 shadow bg-gray-50" />
        <h2 class="text-2xl font-bold mb-2">${exercise.title}</h2>
        <p class="mb-1"><span class="font-semibold">Description:</span> ${exercise.description}</p>
      </div>
    `);
  } else if (path.startsWith('/horoscope/')) {
    const sign = path.split('/')[2];
    const res = await fetch('/api/horoscope');
    if (!res.ok) return hideDetail();
    const data = await res.json();
    if (data.sign !== sign) return hideDetail();
    showDetail(`
      <div class="flex flex-col items-center">
        <p class="mb-1">${data.description}</p>
      </div>
    `);
  } else {
    hideDetail();
  }
}

backBtn.addEventListener('click', hideDetail);

const viewRecipeBtn = document.getElementById('view-recipe');
const doExerciseBtn = document.getElementById('do-exercise');
const viewHoroscopeBtn = document.getElementById('view-horoscope');
const newRecipeBtn = document.getElementById('new-recipe');
const newExerciseBtn = document.getElementById('new-exercise');
const newHoroscopeBtn = document.getElementById('new-horoscope');

viewRecipeBtn.addEventListener('click', async () => {
  if (!currentMood) return;
  const res = await fetch(`/api/recipe?mood=${encodeURIComponent(currentMood)}`);
  if (!res.ok) return alert('No recipe found for this mood!');
  const recipe = await res.json();
  showDetail(renderRecipeDetail(recipe), `/recipe/${recipe.id}`);
});

doExerciseBtn.addEventListener('click', async () => {
  if (!currentMood) return;
  const res = await fetch(`/api/exercise?mood=${encodeURIComponent(currentMood)}`);
  if (!res.ok) return alert('No exercise found for this mood!');
  const exercise = await res.json();
  showDetail(`
    <div class="flex flex-col items-center">
      <img src="${exercise.image_url || ''}" alt="${exercise.title}" class="rounded-xl w-48 h-48 object-contain mb-4 shadow bg-gray-50" />
      <h2 class="text-2xl font-bold mb-2">${exercise.title}</h2>
      <p class="mb-1"><span class="font-semibold">Description:</span> ${exercise.description}</p>
    </div>
  `, `/exercise/${exercise.id}`);
});

viewHoroscopeBtn.addEventListener('click', async () => {
  const res = await fetch('/api/horoscope');
  if (!res.ok) return alert('Could not fetch horoscope.');
  const data = await res.json();
  showDetail(`
    <div class="flex flex-col items-center">
      <p class="mb-1">${data.description}</p>
    </div>
  `, `/horoscope/${data.sign}`);
});

newRecipeBtn.addEventListener('click', () => {
  if (currentMood) fetchRecipe(currentMood);
});

newExerciseBtn.addEventListener('click', () => {
  if (currentMood) fetchExercise(currentMood);
});

newHoroscopeBtn.addEventListener('click', () => {
  fetchHoroscope();
});

selectedMoodHeader.addEventListener('click', () => {
  renderSelectedMoodHeader(null);
  showMoodTiles();
  optionsIcons.classList.add('hidden');
  currentMood = '';
});

function showLoginForm() {
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  authMessage.textContent = '';
}
function showRegisterForm() {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  authMessage.textContent = '';
}
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
showRegister.addEventListener('click', e => { e.preventDefault(); showRegisterForm(); });
showLogin.addEventListener('click', e => { e.preventDefault(); showLoginForm(); });

async function checkAuth() {
  const res = await fetch('/api/me');
  const user = await res.json();
  if (user) {
    authSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    welcomeMessage.textContent = `Welcome, ${user.first_name}!`;
    fetchMoods();
  } else {
    authSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
  }
}

const loginFormEl = document.getElementById('login-form-el');
const registerFormEl = document.getElementById('register-form-el');

loginFormEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  authMessage.textContent = '';
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password) {
    authMessage.textContent = 'Please enter email and password.';
    return;
  }
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.success) {
    loginEmail.value = '';
    loginPassword.value = '';
    checkAuth();
  } else {
    authMessage.textContent = data.error || 'Login failed.';
  }
});

registerFormEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  authMessage.textContent = '';
  const firstName = registerFirstName.value.trim();
  const lastName = registerLastName.value.trim();
  const birthday = registerBirthday.value;
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  if (!firstName || !lastName || !birthday || !email || !password) {
    authMessage.textContent = 'Please fill in all fields.';
    return;
  }
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, birthday, email, password })
  });
  const data = await res.json();
  if (data.success) {
    registerFirstName.value = '';
    registerLastName.value = '';
    registerBirthday.value = '';
    registerEmail.value = '';
    registerPassword.value = '';
    checkAuth();
  } else {
    authMessage.textContent = data.error || 'Registration failed.';
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout');
  checkAuth();
});

fetchMoods();
checkAuth();

// On page load, restore detail screen if path matches
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.startsWith('/recipe/') || path.startsWith('/exercise/') || path.startsWith('/horoscope/')) {
    renderDetailFromPath(path);
  }
}); 
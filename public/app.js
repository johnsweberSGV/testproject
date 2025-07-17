const moodSelect = document.getElementById('mood');
const optionsSection = document.getElementById('options-section');
const recipeDiv = document.getElementById('recipe');
const recipeTitle = document.getElementById('recipe-title');
const recipeIngredients = document.getElementById('recipe-ingredients');
const recipeInstructions = document.getElementById('recipe-instructions');
const newRecipeBtn = document.getElementById('new-recipe');
const viewRecipeBtn = document.getElementById('view-recipe');
const exerciseDiv = document.getElementById('exercise');
const exerciseTitle = document.getElementById('exercise-title');
const exerciseDescription = document.getElementById('exercise-description');
const newExerciseBtn = document.getElementById('new-exercise');
const doExerciseBtn = document.getElementById('do-exercise');
const authSection = document.getElementById('auth-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');
const mainSection = document.getElementById('main-section');
const welcomeMessage = document.getElementById('welcome-message');
const logoutBtn = document.getElementById('logout-btn');

// Auth form elements
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const registerFirstName = document.getElementById('register-firstname');
const registerLastName = document.getElementById('register-lastname');
const registerBirthday = document.getElementById('register-birthday');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerBtn = document.getElementById('register-btn');

const viewHoroscopeBtn = document.getElementById('view-horoscope');
const horoscopeDiv = document.getElementById('horoscope');
const horoscopeSign = document.getElementById('horoscope-sign');
const horoscopeText = document.getElementById('horoscope-text');
const newHoroscopeBtn = document.getElementById('new-horoscope');

const detailScreen = document.getElementById('detail-screen');
const detailContent = document.getElementById('detail-content');
const backBtn = document.getElementById('back-btn');
const optionsIcons = document.getElementById('options-icons');

let currentMood = '';

async function fetchMoods() {
  const res = await fetch('/api/moods');
  const moods = await res.json();
  moodSelect.innerHTML = '<option value="">Select a mood...</option>' +
    moods.map(m => `<option value="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</option>`).join('');
}

async function fetchRecipe(mood) {
  const res = await fetch(`/api/recipe?mood=${encodeURIComponent(mood)}`);
  if (!res.ok) {
    recipeDiv.classList.add('hidden');
    alert('No recipe found for this mood!');
    return;
  }
  const recipe = await res.json();
  recipeTitle.textContent = recipe.title;
  recipeIngredients.textContent = recipe.ingredients;
  recipeInstructions.textContent = recipe.instructions;
  recipeDiv.classList.remove('hidden');
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

moodSelect.addEventListener('change', () => {
  const mood = moodSelect.value;
  if (mood) {
    currentMood = mood;
    optionsSection.classList.remove('hidden');
    recipeDiv.classList.add('hidden');
    exerciseDiv.classList.add('hidden');
  } else {
    optionsSection.classList.add('hidden');
    recipeDiv.classList.add('hidden');
    exerciseDiv.classList.add('hidden');
  }
});

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
    showDetail(`
      <div class="flex flex-col items-center">
        <img src="${recipe.image_url || ''}" alt="${recipe.title}" class="rounded-xl w-48 h-48 object-cover mb-4 shadow" />
        <h2 class="text-2xl font-bold mb-2">${recipe.title}</h2>
        <p class="mb-1"><span class="font-semibold">Ingredients:</span> ${recipe.ingredients}</p>
        <p class="mb-1"><span class="font-semibold">Instructions:</span> ${recipe.instructions}</p>
      </div>
    `);
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
        <img src="/zodiac/${data.sign}.svg" alt="${data.sign}" class="rounded-xl w-32 h-32 object-contain mb-4" />
        <h2 class="text-2xl font-bold mb-2">${data.sign.charAt(0).toUpperCase() + data.sign.slice(1)}</h2>
        <p class="mb-1">${data.description}</p>
      </div>
    `);
  } else {
    hideDetail();
  }
}

backBtn.addEventListener('click', hideDetail);

viewRecipeBtn.addEventListener('click', async () => {
  if (!currentMood) return;
  const res = await fetch(`/api/recipe?mood=${encodeURIComponent(currentMood)}`);
  if (!res.ok) return alert('No recipe found for this mood!');
  const recipe = await res.json();
  showDetail(`
    <div class="flex flex-col items-center">
      <img src="${recipe.image_url || ''}" alt="${recipe.title}" class="rounded-xl w-48 h-48 object-cover mb-4 shadow" />
      <h2 class="text-2xl font-bold mb-2">${recipe.title}</h2>
      <p class="mb-1"><span class="font-semibold">Ingredients:</span> ${recipe.ingredients}</p>
      <p class="mb-1"><span class="font-semibold">Instructions:</span> ${recipe.instructions}</p>
    </div>
  `, `/recipe/${recipe.id}`);
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
      <img src="/zodiac/${data.sign}.svg" alt="${data.sign}" class="rounded-xl w-32 h-32 object-contain mb-4" />
      <h2 class="text-2xl font-bold mb-2">${data.sign.charAt(0).toUpperCase() + data.sign.slice(1)}</h2>
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

loginBtn.addEventListener('click', async () => {
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

registerBtn.addEventListener('click', async () => {
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
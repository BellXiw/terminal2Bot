const grid = document.getElementById('grid');
const slots = document.getElementById('slots');
const timerEl = document.getElementById('timer');
let cells = [];
let values = [];
let shown = [];
let matched = [];
let results = [];
let timer = 30;
let countdown;
let canClick = false;

function generateValues() {
  let nums = Array.from({ length: 20 }, (_, i) => i + 1);
  let pairs = [];
  let picked = [];
  while (picked.length < 3) {
    const r = nums.splice(Math.floor(Math.random() * nums.length), 1)[0];
    picked.push(r);
    pairs.push(r, r);
  }
  let remaining = 25 - 6;
  const rest = nums.slice(0, remaining);
  return [...pairs, ...rest].sort(() => Math.random() - 0.5);
}

function drawGrid() {
  grid.innerHTML = '';
  slots.innerHTML = '';
  cells = [];
  matched = [];
  results = [];
  shown = [];
  values = generateValues();
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.textContent = values[i];
    grid.appendChild(cell);
    cells.push(cell);
  }
  for (let i = 0; i < 3; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slots.appendChild(slot);
  }
  canClick = false;
  setTimeout(hideAll, 5000);
}

function hideAll() {
  cells.forEach((c, i) => {
    if (!matched.includes(i)) c.textContent = '';
  });
  canClick = true;
  countdown = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 0) endGame(false);
  }, 1000);
}

function cellClick(e) {
  if (!canClick) return;
  const idx = +e.target.dataset.index;
  if (matched.includes(idx) || shown.includes(idx)) return;
  e.target.textContent = values[idx];
  shown.push(idx);
  if (shown.length === 2) {
    canClick = false;
    setTimeout(() => checkMatch(), 600);
  }
}

function checkMatch() {
  const [i1, i2] = shown;
  if (values[i1] === values[i2]) {
    matched.push(i1, i2);
    results.push(values[i1]);
    cells[i1].textContent = '';
    cells[i2].textContent = '';
    const slot = slots.querySelectorAll('.slot')[results.length - 1];
    if (slot) slot.textContent = values[i1];
    if (results.length === 3) endGame(true);
  } else {
    cells[i1].textContent = '';
    cells[i2].textContent = '';
  }
  shown = [];
  canClick = true;
}

function endGame(win) {
  clearInterval(countdown);
  const emoji = document.createElement('div');
  emoji.style.fontSize = '40px';
  emoji.textContent = win ? '✅' : '❌';
  document.body.appendChild(emoji);
  setTimeout(() => emoji.remove(), 2000);
  if (typeof Telegram !== 'undefined') {
    Telegram.WebApp.sendData(win ? "win" : "fail");
  }
}

function restart() {
  clearInterval(countdown);
  timer = 30;
  timerEl.textContent = timer;
  drawGrid();
}

grid.addEventListener('click', (e) => {
  if (e.target.classList.contains('cell')) cellClick(e);
});

drawGrid();
const redEl = document.querySelector(".red");
const yellowEl = document.querySelector(".yellow");
const greenEl = document.querySelector(".green");
const timerEl = document.querySelector(".timer");

const startBtn = document.querySelector(".start");
const pauseBtn = document.querySelector(".pause");
const nightBtn = document.querySelector(".night");
const stopBtn = document.querySelector(".stop");

const inputs = {
  red: document.querySelector("#redInput"),
  green: document.querySelector("#greenInput"),
  yellow: document.querySelector("#yellowInput"),
};

let cfg = { red: 10, green: 10, yellow: 4 };
let phase = null; // "red" | "green" | "night" | null
let time = 0;
let paused = false;
let intervalId = null;

const showTimer = (value, color) => {
  timerEl.textContent = String(value).padStart(2, "0");
  timerEl.className = `timer ${color}`;
};

const readSettings = () => {
  const clamp = (v, min, max, def) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? def : Math.min(max, Math.max(min, n));
  };
  const red = clamp(inputs.red.value, 2, 99, 10);
  const green = clamp(inputs.green.value, 2, 99, 10);
  // sariq vaqt qizil va yashildan kichik bo'lishi kerak
  const yellow = clamp(inputs.yellow.value, 1, Math.min(red, green) - 1, 4);

  cfg = { red, green, yellow };
  inputs.red.value = red;
  inputs.green.value = green;
  inputs.yellow.value = yellow;
};

const setInputsDisabled = (disabled) => {
  Object.values(inputs).forEach((input) => (input.disabled = disabled));
};

const render = () => {
  [redEl, yellowEl, greenEl].forEach((el) => el.classList.remove("active"));

  if (!phase) {
    timerEl.textContent = "--";
    timerEl.className = "timer";
    return;
  }

  if (phase === "night") {
    if (time % 2 === 0) yellowEl.classList.add("active");
    timerEl.textContent = "--";
    timerEl.className = "timer yellow";
    return;
  }

  const warning = time <= cfg.yellow;

  if (phase === "red") {
    redEl.classList.add("active");
    if (warning) yellowEl.classList.add("active");
    showTimer(time, warning ? "yellow" : "red");
  }

  if (phase === "green") {
    greenEl.classList.add("active");
    if (warning && time % 2 === 0) yellowEl.classList.add("active");
    showTimer(time, warning ? "yellow" : "green");
  }
};

const tick = () => {
  if (phase === "night") {
    time += 1;
    render();
    return;
  }

  time -= 1;
  if (time <= 0) {
    phase = phase === "red" ? "green" : "red";
    time = cfg[phase];
  }
  render();
};

const startInterval = () => {
  clearInterval(intervalId);
  intervalId = setInterval(tick, 1000);
};

function hardStop() {
  clearInterval(intervalId);
  phase = null;
  time = 0;
  paused = false;
  pauseBtn.textContent = "Pause";
  pauseBtn.disabled = true;
  setInputsDisabled(false);
  render();
}

function start() {
  hardStop();
  readSettings();
  setInputsDisabled(true);
  pauseBtn.disabled = false;
  phase = "red";
  time = cfg.red;
  render();
  startInterval();
}

function nightMode() {
  hardStop();
  pauseBtn.disabled = false;
  phase = "night";
  time = 0;
  render();
  startInterval();
}

function togglePause() {
  if (!phase) return;

  if (paused) {
    paused = false;
    pauseBtn.textContent = "Pause";
    startInterval();
  } else {
    paused = true;
    pauseBtn.textContent = "Resume";
    clearInterval(intervalId);
  }
}

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", togglePause);
nightBtn.addEventListener("click", nightMode);
stopBtn.addEventListener("click", hardStop);

hardStop();
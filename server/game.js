'use strict';

// ============================================================
// Game logic. Pure and testable: no sockets, no I/O.
// ============================================================

// --- config ---
const DEFAULTS = {
  width: 40,
  height: 30,
  tickRate: 15,
  startLength: 3,
  foodCount: 5,
  orbCount: 1,
  shieldSeconds: 5,
};

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const COLORS = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45'];

function createGame(options = {}) {
  const cfg = Object.assign({}, DEFAULTS, options);
  const rng = cfg.random || Math.random;

  // --- state ---
  const state = {
    width: cfg.width,
    height: cfg.height,
    tick: 0,
    snakes: new Map(), // id -> snake
    food: [], // [{ x, y }]
    orbs: [], // shield orbs [{ x, y }]
  };
  let colorIndex = 0;
  let timer = null;

  // --- helpers ---
  function randInt(max) {
    return Math.floor(rng() * max);
  }

  function isOccupied(x, y) {
    for (const s of state.snakes.values()) {
      if (s.body.some((p) => p.x === x && p.y === y)) return true;
    }
    if (state.orbs.some((o) => o.x === x && o.y === y)) return true;
    return state.food.some((f) => f.x === x && f.y === y);
  }

  function randomFreeCell() {
    for (let i = 0; i < 200; i++) {
      const x = randInt(state.width);
      const y = randInt(state.height);
      if (!isOccupied(x, y)) return { x, y };
    }
    return { x: randInt(state.width), y: randInt(state.height) };
  }

  // --- players ---
  function spawnSnake(snake) {
    const margin = cfg.startLength + 2;
    const x = margin + randInt(Math.max(1, state.width - margin * 2));
    const y = 2 + randInt(Math.max(1, state.height - 4));
    snake.body = [];
    for (let i = 0; i < cfg.startLength; i++) snake.body.push({ x: x - i, y });
    snake.dir = 'right';
    snake.nextDir = 'right';
    snake.alive = true;
    snake.score = 0;
    snake.shield = 0; // remaining shield ticks
  }

  function addPlayer(id, name) {
    const snake = {
      id,
      name: String(name || 'anon').slice(0, 16),
      color: COLORS[colorIndex++ % COLORS.length],
      body: [],
      dir: 'right',
      nextDir: 'right',
      alive: true,
      dashing: false,
      score: 0,
      shield: 0,
    };
    spawnSnake(snake);
    state.snakes.set(id, snake);
    return snake;
  }

  function removePlayer(id) {
    state.snakes.delete(id);
  }

  function setDirection(id, dir) {
    const snake = state.snakes.get(id);
    if (!snake || !DIRS[dir]) return;
    const cur = DIRS[snake.dir];
    const nxt = DIRS[dir];
    // Ignore 180-degree reversals.
    if (cur.x + nxt.x === 0 && cur.y + nxt.y === 0) return;
    snake.nextDir = dir;
  }

  // --- dash ---
  function setDash(id, active) {
    const snake = state.snakes.get(id);
    if (!snake) return;
    snake.dashing = Boolean(active);
  }

  // --- food ---
  function spawnFood() {
    while (state.food.length < cfg.foodCount) {
      state.food.push(randomFreeCell());
    }
  }

  function eatFood(snake) {
    const head = snake.body[0];
    const i = state.food.findIndex((f) => f.x === head.x && f.y === head.y);
    if (i === -1) return false;
    state.food.splice(i, 1);
    snake.score += 1;
    return true;
  }

  // --- orbs ---
  function spawnOrbs() {
    while (state.orbs.length < cfg.orbCount) {
      state.orbs.push(randomFreeCell());
    }
  }

  function pickOrb(snake) {
    const head = snake.body[0];
    const i = state.orbs.findIndex((o) => o.x === head.x && o.y === head.y);
    if (i === -1) return false;
    state.orbs.splice(i, 1);
    snake.shield = cfg.shieldSeconds * cfg.tickRate;
    return true;
  }

  // --- movement ---
  function moveSnake(snake) {
    snake.dir = snake.nextDir;
    const d = DIRS[snake.dir];
    const head = snake.body[0];
    snake.body.unshift({ x: head.x + d.x, y: head.y + d.y });
    // Tail is removed after the eat check, so eating grows the snake.
  }

  // --- collisions ---
  function collides(snake) {
    // An active shield makes the snake immune to walls and snakes.
    if (snake.shield > 0) return false;
    const head = snake.body[0];
    // Wall
    if (head.x < 0 || head.y < 0 || head.x >= state.width || head.y >= state.height) return true;
    for (const other of state.snakes.values()) {
      if (!other.alive) continue;
      // Skip own head (index 0); check own body and every other body part.
      const start = other === snake ? 1 : 0;
      for (let i = start; i < other.body.length; i++) {
        if (other.body[i].x === head.x && other.body[i].y === head.y) return true;
      }
    }
    return false;
  }

  // --- respawn ---
  function respawn(snake) {
    spawnSnake(snake);
  }

  // --- tick ---
  function step() {
    state.tick += 1;
    const snakes = [...state.snakes.values()].filter((s) => s.alive);

    for (const s of snakes) {
      // Dashing needs length > 3: one extra cell per tick, paid with one tail segment.
      const dash = s.dashing && s.body.length > 3;
      for (let i = 0; i < (dash ? 2 : 1); i++) {
        moveSnake(s);
        if (!eatFood(s)) s.body.pop();
        pickOrb(s);
      }
      if (dash) s.body.pop();
    }

    // Evaluate all collisions first, then apply deaths, so head-to-head kills both.
    const dead = snakes.filter(collides);
    for (const s of dead) s.alive = false;
    for (const s of dead) respawn(s);

    // Shield ticks down once per tick.
    for (const s of state.snakes.values()) if (s.shield > 0) s.shield -= 1;

    spawnFood();
    spawnOrbs();
  }

  // --- snapshot ---
  function snapshot() {
    return {
      tick: state.tick,
      width: state.width,
      height: state.height,
      food: state.food.map((f) => ({ x: f.x, y: f.y })),
      orbs: state.orbs.map((o) => ({ x: o.x, y: o.y })),
      snakes: [...state.snakes.values()].map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        body: s.body,
        alive: s.alive,
        dashing: s.dashing,
        score: s.score,
        shielded: s.shield > 0,
      })),
    };
  }

  // --- loop ---
  function start(onSnapshot) {
    spawnFood();
    spawnOrbs();
    timer = setInterval(() => {
      step();
      if (onSnapshot) onSnapshot(snapshot());
    }, 1000 / cfg.tickRate);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  spawnFood();
  spawnOrbs();

  return { state, addPlayer, removePlayer, setDirection, setDash, step, snapshot, start, stop };
}

module.exports = { createGame, DIRS };

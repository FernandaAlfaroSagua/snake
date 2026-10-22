'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { createGame } = require('../server/game');

function setup() {
  const game = createGame({ foodCount: 0, orbCount: 0, width: 20, height: 20 });
  const snake = game.addPlayer('a', 'Ann');
  snake.body = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  snake.dir = snake.nextDir = 'right';
  return { game, snake };
}

test('snake moves one cell in its direction', () => {
  const { game, snake } = setup();
  game.step();
  assert.deepStrictEqual(snake.body[0], { x: 6, y: 5 });
  assert.strictEqual(snake.body.length, 3);
});

test('eating food grows the snake and raises score', () => {
  const { game, snake } = setup();
  game.state.food.push({ x: 6, y: 5 });
  game.step();
  assert.strictEqual(snake.body.length, 4);
  assert.strictEqual(snake.score, 1);
});

test('hitting a wall kills and respawns the snake', () => {
  const { game, snake } = setup();
  snake.body = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
  game.step();
  assert.strictEqual(snake.score, 0);
  assert.ok(snake.body.every((p) => p.x >= 0 && p.x < 20));
  assert.strictEqual(snake.alive, true);
});

// --- S01 dash ---
test('dashing snake moves two cells per tick', () => {
  const { game, snake } = setup();
  snake.body.push({ x: 2, y: 5 });
  game.setDash('a', true);
  game.step();
  assert.deepStrictEqual(snake.body[0], { x: 7, y: 5 });
});

test('each dash tick drops one tail segment', () => {
  const { game, snake } = setup();
  snake.body.push({ x: 2, y: 5 }, { x: 1, y: 5 });
  game.setDash('a', true);
  game.step();
  assert.strictEqual(snake.body.length, 4);
  game.step();
  assert.strictEqual(snake.body.length, 3);
});

test('dash has no effect at length 3', () => {
  const { game, snake } = setup();
  game.setDash('a', true);
  game.step();
  assert.deepStrictEqual(snake.body[0], { x: 6, y: 5 });
  assert.strictEqual(snake.body.length, 3);
});

test('speed returns to normal after releasing dash', () => {
  const { game, snake } = setup();
  snake.body.push({ x: 2, y: 5 }, { x: 1, y: 5 });
  game.setDash('a', true);
  game.step();
  game.setDash('a', false);
  const before = snake.body[0].x;
  game.step();
  assert.strictEqual(snake.body[0].x, before + 1);
  assert.strictEqual(snake.body.length, 4);
});

// --- S02 shield orb ---
test('picking up an orb grants a shield and removes the orb', () => {
  const { game, snake } = setup();
  game.state.orbs.push({ x: 6, y: 5 });
  game.step();
  assert.strictEqual(game.state.orbs.length, 0);
  assert.strictEqual(game.snapshot().snakes[0].shielded, true);
  assert.strictEqual(snake.shield > 0, true);
});

test('shield prevents death on a wall', () => {
  const { game, snake } = setup();
  snake.body = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
  snake.shield = 10;
  game.step();
  assert.strictEqual(snake.body[0].x, 20);
  assert.strictEqual(snake.score, 0);
});

test('shield prevents death on another snake', () => {
  const { game, snake } = setup();
  const other = game.addPlayer('b', 'Bob');
  other.body = [{ x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 }];
  other.dir = other.nextDir = 'up';
  snake.shield = 10;
  game.step();
  assert.deepStrictEqual(snake.body[0], { x: 6, y: 5 });
});

test('shield expires after 5 seconds of ticks and collisions kill again', () => {
  const game = createGame({ foodCount: 0, orbCount: 0, width: 100, height: 20, tickRate: 2 });
  const snake = game.addPlayer('a', 'Ann');
  snake.body = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  snake.dir = snake.nextDir = 'right';
  game.state.orbs.push({ x: 6, y: 5 });
  game.step(); // pickup: 10 ticks of shield
  for (let i = 0; i < 9; i++) game.step();
  assert.strictEqual(snake.shield, 0);
  assert.strictEqual(game.snapshot().snakes[0].shielded, false);
  snake.body = [{ x: 99, y: 5 }, { x: 98, y: 5 }, { x: 97, y: 5 }];
  snake.dir = snake.nextDir = 'right';
  game.step();
  assert.ok(snake.body.every((p) => p.x >= 0 && p.x < 100));
  assert.strictEqual(snake.body[0].x === 100, false);
});

// --- S03 shrinking zone ---
function zoneSetup(options = {}) {
  const game = createGame(Object.assign({ foodCount: 0, orbCount: 0, width: 20, height: 20 }, options));
  const snake = game.addPlayer('a', 'Ann');
  snake.body = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  snake.dir = snake.nextDir = 'right';
  return { game, snake };
}

test('zone starts covering the whole map', () => {
  const { game } = zoneSetup();
  assert.deepStrictEqual(game.snapshot().zone, { left: 0, top: 0, right: 19, bottom: 19 });
});

test('zone shrinks one cell per side after the configured interval', () => {
  const { game, snake } = zoneSetup({ zoneShrinkTicks: 3 });
  snake.dir = snake.nextDir = 'down';
  game.step();
  game.step();
  assert.deepStrictEqual(game.snapshot().zone, { left: 0, top: 0, right: 19, bottom: 19 });
  game.step();
  assert.deepStrictEqual(game.snapshot().zone, { left: 1, top: 1, right: 18, bottom: 18 });
});

test('snake with its head outside the zone loses one segment per tick', () => {
  const { game, snake } = zoneSetup();
  snake.body.push({ x: 7, y: 10 }, { x: 6, y: 10 });
  game.state.zone = { left: 0, top: 0, right: 5, bottom: 19 };
  game.step();
  assert.strictEqual(snake.body.length, 4);
  game.step();
  assert.strictEqual(snake.body.length, 3);
  assert.strictEqual(snake.alive, true);
});

test('snake outside the zone with length 1 dies and respawns inside the zone', () => {
  const { game, snake } = zoneSetup();
  snake.body = [{ x: 0, y: 10 }];
  snake.score = 4;
  game.state.zone = { left: 2, top: 2, right: 17, bottom: 17 };
  snake.dir = snake.nextDir = 'down';
  game.step();
  const zone = game.state.zone;
  assert.strictEqual(snake.alive, true);
  assert.strictEqual(snake.score, 0);
  assert.strictEqual(snake.body.length, 3);
  assert.ok(snake.body.every((p) => p.x >= zone.left && p.x <= zone.right && p.y >= zone.top && p.y <= zone.bottom));
});

test('zone stops shrinking at its minimum size', () => {
  const { game, snake } = zoneSetup({ zoneShrinkTicks: 1, zoneMinSize: 12 });
  for (let i = 0; i < 20; i++) {
    snake.body = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    snake.dir = snake.nextDir = 'right';
    game.step();
  }
  assert.deepStrictEqual(game.snapshot().zone, { left: 4, top: 4, right: 15, bottom: 15 });
});

test('a newly added player spawns inside the shrunken zone', () => {
  const game = createGame({ foodCount: 0, orbCount: 0, width: 40, height: 30, random: () => 0.999 });
  game.state.zone = { left: 10, top: 5, right: 25, bottom: 20 };
  const snake = game.addPlayer('b', 'Bob');
  assert.ok(snake.body.every((p) => p.x >= 10 && p.x <= 25 && p.y >= 5 && p.y <= 20));
});

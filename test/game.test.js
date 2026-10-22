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

// --- S09 kill streaks ---
test('streak rises by 1 when another snake dies hitting its body', () => {
  const { game, snake } = setup();
  const other = game.addPlayer('b', 'Bob');
  other.body = [{ x: 7, y: 4 }, { x: 7, y: 3 }, { x: 7, y: 2 }];
  other.dir = other.nextDir = 'down';
  snake.body = [{ x: 8, y: 5 }, { x: 7, y: 5 }, { x: 6, y: 5 }];
  snake.dir = snake.nextDir = 'right';
  game.step(); // Ann -> (9,5),(8,5),(7,5); Bob -> (7,5) hits Ann's body
  assert.strictEqual(snake.streak, 1);
  assert.strictEqual(snake.alive, true);
  assert.strictEqual(other.streak, 0);
});

test('hitting a wall gives no streak to anyone', () => {
  const { game, snake } = setup();
  const other = game.addPlayer('b', 'Bob');
  other.body = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  snake.body = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
  game.step();
  assert.strictEqual(snake.streak, 0);
  assert.strictEqual(other.streak, 0);
});

test('hitting its own body gives no streak to anyone', () => {
  const { game, snake } = setup();
  const other = game.addPlayer('b', 'Bob');
  other.body = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  other.streak = 2;
  snake.body = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 5 }, { x: 7, y: 5 }];
  snake.dir = snake.nextDir = 'up';
  snake.streak = 2;
  game.setDirection('a', 'right');
  game.step(); // head moves to (6,5), part of its own body
  assert.strictEqual(other.streak, 2);
  assert.strictEqual(snake.streak, 0); // reset by respawn, not raised
});

test('head-to-head collision gives no streak to anyone', () => {
  const { game, snake } = setup();
  const other = game.addPlayer('b', 'Bob');
  other.body = [{ x: 7, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 }];
  other.dir = other.nextDir = 'left';
  game.step(); // both heads land on (6,5)
  assert.strictEqual(snake.streak, 0);
  assert.strictEqual(other.streak, 0);
});

test('streak resets to 0 when the snake dies and respawns', () => {
  const { game, snake } = setup();
  snake.streak = 4;
  snake.body = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
  game.step();
  assert.strictEqual(snake.alive, true);
  assert.strictEqual(snake.streak, 0);
});

test('shielded snake passing through a body gives no streak', () => {
  const { game, snake } = setup();
  const other = game.addPlayer('b', 'Bob');
  other.body = [{ x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 }];
  other.dir = other.nextDir = 'up';
  snake.shield = 10;
  game.step();
  assert.strictEqual(other.streak, 0);
  assert.strictEqual(snake.streak, 0);
});

test('snapshot includes the streak of every snake', () => {
  const { game, snake } = setup();
  game.addPlayer('b', 'Bob');
  snake.streak = 3;
  const snap = game.snapshot();
  assert.deepStrictEqual(snap.snakes.map((s) => s.streak), [3, 0]);
});

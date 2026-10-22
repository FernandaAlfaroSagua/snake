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

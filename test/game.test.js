'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { createGame } = require('../server/game');

function setup() {
  const game = createGame({ foodCount: 0, width: 20, height: 20 });
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

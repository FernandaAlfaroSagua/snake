# Snake.io Worktree Demo

Minimal multiplayer snake (Node, express, socket.io, canvas). No build step.

## Run

```
npm install && npm start   # http://localhost:3000
npm test
```

## Getting started

```
git clone https://github.com/FernandaAlfaroSagua/snake.git
cd snake
npm install
npm start   # http://localhost:3000
```

Each person runs their own server locally, so players on different machines do not see each other. To play together, one person runs the server and the others open `http://<host-ip>:3000` on the same network.

## Branch rules

- Never push to `main`.
- Create your integration branch from `main`: `git switch -c feature/<your-name>-<story-a>-<story-b>`.
- Push only that branch: `git push -u origin feature/<your-name>-<story-a>-<story-b>`.

## Worktree workflow

1. Pick two stories from `STORIES.md`.
2. From your integration branch, create one worktree per story under `tree/` (already git-ignored): `git worktree add tree/s01-dash -b s01-dash`.
3. Implement each story inside its own worktree; add a test if you can.
4. Commit with a conventional message, e.g. `feat(S01): add dash`.
5. Expect conflicts: stories share `server/game.js` and `client/render.js`.
6. Back on your integration branch, merge both story branches one at a time and resolve the conflicts. Run `npm test`.
7. Clean up with `git worktree remove tree/s01-dash`, then push your integration branch.

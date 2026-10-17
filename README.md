# Snake.io Worktree Demo

Minimal multiplayer snake (Node, express, socket.io, canvas). No build step.

## Run

```
npm install && npm start   # http://localhost:3000
npm test
```

## Worktree workflow

1. Pick two stories from `STORIES.md`.
2. `git worktree add tree/s01-dash -b s01-dash` (one worktree per story).
3. Implement the story inside its worktree; add a test if you can.
4. Commit with a conventional message, e.g. `feat(S01): add dash`.
5. Expect conflicts: stories share `server/game.js` and `client/render.js`.
6. The orchestrator merges every branch into `main` and resolves conflicts.

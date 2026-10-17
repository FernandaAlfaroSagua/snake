# User Stories

## S01 Dash
As a player, I want to press space to accelerate so that I can escape danger or catch food.
- Given I am alive with length above 3, When I hold space, Then my snake moves faster.
- Given I am dashing, When each dash tick passes, Then my snake loses one tail segment.
- Given my length is 3, When I press space, Then nothing happens.
- Given I release space, When the next tick runs, Then my speed returns to normal.

Touches: server/game.js, client/render.js

## S02 Shield orb
As a player, I want to pick up a shield orb so that I am immune to collisions for 5 seconds.
- Given a shield orb is on the map, When my head reaches it, Then I gain a shield and the orb disappears.
- Given I have a shield, When I hit a wall or a snake, Then I do not die.
- Given I have a shield, When 5 seconds pass, Then the shield expires.
- Given I have a shield, When other players look at me, Then my snake shows a visible glow.

Touches: server/game.js, client/render.js

## S03 Shrinking zone
As a player, I want the safe area to shrink over time so that matches become a battle royale.
- Given a round is running, When time passes, Then the safe zone border moves inward.
- Given I am outside the safe zone, When each tick passes, Then I take damage by losing a segment.
- Given I am outside the zone with length 1, When damage applies, Then I die and respawn.
- Given the zone reached its minimum size, When time passes, Then it stops shrinking.

Touches: server/game.js, client/render.js

## S04 Golden food
As a player, I want rare golden food worth x5 so that risky pickups pay off.
- Given food spawns, When the spawn roll is rare, Then it is golden.
- Given I eat golden food, When my head reaches it, Then my score rises by 5.
- Given I eat golden food, When it is consumed, Then my snake grows by 5 segments.
- Given golden food exists, When it is drawn, Then it looks different from normal food.

Touches: server/game.js, client/render.js

## S05 Portals
As a player, I want paired portals that teleport me so that I can take shortcuts.
- Given a portal pair exists, When my head enters one portal, Then I appear at the other portal.
- Given I just teleported, When I keep moving, Then I keep my direction and length.
- Given portals exist, When they are drawn, Then each pair shares a distinct color.
- Given a portal exit is blocked by a snake, When I enter, Then I die.

Touches: server/game.js, client/render.js

## S06 Poison mines
As a player, I want dead snakes to drop mines so that the map stays dangerous.
- Given a snake dies, When it respawns, Then mines appear where its body was.
- Given a mine exists, When another snake's head touches it, Then that snake loses 3 segments.
- Given a mine was hit, When the hit resolves, Then the mine is removed.
- Given mines exist, When they are drawn, Then they are clearly marked as hazards.

Touches: server/game.js, client/render.js

## S07 Control storm
As a player, I want a global storm event that inverts controls so that matches have chaotic moments.
- Given the game is running, When a storm triggers, Then all players are notified on screen.
- Given a storm is active, When I press left, Then my snake turns right (and likewise for up and down).
- Given a storm is active, When 5 seconds pass, Then controls return to normal.
- Given no storm is active, When I press a direction, Then it behaves normally.

Touches: server/game.js, client/render.js

## S08 Magnet orb
As a player, I want a magnet orb that pulls nearby food so that I can collect it faster.
- Given a magnet orb is on the map, When my head reaches it, Then I gain a magnet effect.
- Given I have a magnet, When food is within 5 cells of my head, Then it moves one cell closer each tick.
- Given I have a magnet, When 8 seconds pass, Then the effect ends.
- Given I have a magnet, When I am drawn, Then a ring around my head shows the pull radius.

Touches: server/game.js, client/render.js

## S09 Live leaderboard with kill streaks
As a player, I want a live leaderboard with kill streaks so that I can see who dominates.
- Given players are connected, When scores change, Then the leaderboard shows the top 5 by score.
- Given I kill another snake, When it dies by hitting my body, Then my kill streak increases by 1.
- Given I die, When I respawn, Then my kill streak resets to 0.
- Given a player has a streak of 3 or more, When the leaderboard is drawn, Then a streak badge appears next to the name.

Touches: server/game.js, client/render.js, client/index.html

## S10 Chat bubbles
As a player, I want chat bubbles above snake heads so that I can taunt friends.
- Given I am connected, When I type a message and press Enter, Then it is sent to the server.
- Given the server receives a message, When it broadcasts it, Then all players see a bubble above that snake's head.
- Given a bubble is shown, When 4 seconds pass, Then it disappears.
- Given a message is longer than 60 characters, When it is sent, Then it is truncated.

Touches: server/index.js, client/main.js, client/render.js

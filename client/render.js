// All canvas drawing lives here.
const Render = (function () {
  // --- grid ---
  function drawGrid(ctx, cell, w, h) {
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell, 0);
      ctx.lineTo(x * cell, h * cell);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell);
      ctx.lineTo(w * cell, y * cell);
      ctx.stroke();
    }
  }

  // --- zone ---
  function drawZone(ctx, cell, w, h, zone) {
    if (!zone) return;
    const x = zone.left * cell;
    const y = zone.top * cell;
    const zw = (zone.right - zone.left + 1) * cell;
    const zh = (zone.bottom - zone.top + 1) * cell;
    // Shade everything outside the safe zone.
    ctx.fillStyle = 'rgba(200, 30, 30, 0.25)';
    ctx.fillRect(0, 0, w * cell, y);
    ctx.fillRect(0, y + zh, w * cell, h * cell - (y + zh));
    ctx.fillRect(0, y, x, zh);
    ctx.fillRect(x + zw, y, w * cell - (x + zw), zh);
    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, zw, zh);
    ctx.lineWidth = 1;
  }

  // --- food ---
  function drawFood(ctx, cell, food) {
    ctx.fillStyle = '#ffd400';
    for (const f of food) {
      ctx.beginPath();
      ctx.arc(f.x * cell + cell / 2, f.y * cell + cell / 2, cell * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- orbs ---
  function drawOrbs(ctx, cell, orbs) {
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    for (const o of orbs) {
      ctx.beginPath();
      ctx.arc(o.x * cell + cell / 2, o.y * cell + cell / 2, cell * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // --- snakes ---
  function drawSnakes(ctx, cell, snakes, myId) {
    for (const s of snakes) {
      ctx.fillStyle = s.color;
      // Shielded snakes get a glow.
      if (s.shielded) {
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 15;
      }
      for (const p of s.body) ctx.fillRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
      ctx.shadowBlur = 0;
      if (s.id === myId) {
        const head = s.body[0];
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(head.x * cell + 1, head.y * cell + 1, cell - 2, cell - 2);
      }
      // Dash indicator: bright outline around every segment.
      if (s.dashing) {
        ctx.strokeStyle = '#ffd400';
        for (const p of s.body) ctx.strokeRect(p.x * cell + 1, p.y * cell + 1, cell - 2, cell - 2);
      }
    }
  }

  // --- names ---
  function drawNames(ctx, cell, snakes) {
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (const s of snakes) {
      const head = s.body[0];
      ctx.fillText(s.name, head.x * cell + cell / 2, head.y * cell - 4);
    }
  }

  // --- hud ---
  function drawHud(ctx, snap, myId) {
    const me = snap.snakes.find((s) => s.id === myId);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(me ? `Score: ${me.score}` : 'Press Play to join', 10, 20);
  }

  // --- draw ---
  function draw(canvas, snap, myId) {
    const ctx = canvas.getContext('2d');
    const cell = Math.floor(Math.min(canvas.width / snap.width, canvas.height / snap.height));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, cell, snap.width, snap.height);
    drawZone(ctx, cell, snap.width, snap.height, snap.zone);
    drawFood(ctx, cell, snap.food);
    drawOrbs(ctx, cell, snap.orbs);
    drawSnakes(ctx, cell, snap.snakes, myId);
    drawNames(ctx, cell, snap.snakes);
    drawHud(ctx, snap, myId);
  }

  return { draw };
})();

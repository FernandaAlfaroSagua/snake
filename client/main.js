// Socket connection, input, and join. All drawing lives in render.js.
const socket = io();
const canvas = document.getElementById('game');
let myId = null;
let latest = null;

// --- join ---
document.getElementById('play').addEventListener('click', () => {
  const name = document.getElementById('name').value.trim() || 'anon';
  socket.emit('join', name);
  document.getElementById('join').style.display = 'none';
});

socket.on('joined', (info) => {
  myId = info.id;
});

// --- state ---
socket.on('state', (snap) => {
  latest = snap;
});

function frame() {
  if (latest) Render.draw(canvas, latest, myId);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// --- input ---
const KEYS = {
  ArrowUp: 'up', w: 'up',
  ArrowDown: 'down', s: 'down',
  ArrowLeft: 'left', a: 'left',
  ArrowRight: 'right', d: 'right',
};

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  const dir = KEYS[e.key];
  if (dir) {
    e.preventDefault();
    socket.emit('direction', dir);
  }
});

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') {
    e.preventDefault();
    if (!e.repeat) socket.emit('dash', true);
  }
});

window.addEventListener('keyup', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') {
    e.preventDefault();
    socket.emit('dash', false);
  }
});

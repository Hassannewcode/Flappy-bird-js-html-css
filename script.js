const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRAVITY = 0.25, FLAP = -4.6;
const BASE_SPEED = 2, SPEED_ACCEL = 0.0001;
const PIPE_WIDTH = 52, PIPE_GAP = 100, PIPE_INTERVAL = 90;
const BASE_Y = canvas.height - 112;

let frame = 0, score = 0, gameOver = false, autoplay = false;
let bird = { x: 50, y: 150, w: 34, h: 24, vel: 0 };
let pipes = [], lastAutoflap = 0, flapCooldown = 150;

// Load sprites
const images = {
  bg: loadImg("background-day.png"),
  base: loadImg("base.png"),
  pipe: loadImg("pipe-green.png"),
  gameover: loadImg("gameover.png"),
  title: loadImg("title.png"),
  birdFrames: ["upflap", "midflap", "downflap"].map(i => loadImg(`yellowbird-${i}.png`))
};

function loadImg(name) {
  const img = new Image();
  img.src = `https://raw.githubusercontent.com/sourabhv/FlapPyBird/master/assets/sprites/${name}`;
  return img;
}

// Draw helpers
function draw() {
  ctx.drawImage(images.bg, 0, 0, canvas.width, canvas.height);
  pipes.forEach(p => {
    ctx.save();
    ctx.translate(p.x + PIPE_WIDTH / 2, p.y);
    ctx.rotate(Math.PI);
    ctx.drawImage(images.pipe, -PIPE_WIDTH / 2, 0);
    ctx.restore();
    ctx.drawImage(images.pipe, p.x, p.y + PIPE_GAP);
  });
  ctx.drawImage(images.base, 0, BASE_Y);
  const bf = images.birdFrames[Math.floor(frame / 5) % 3];
  ctx.drawImage(bf, bird.x, bird.y);
  ctx.fillStyle = "#fff";
  ctx.font = "20px 'Press Start 2P'";
  ctx.fillText(score, 10, 25);
}

// Game loop
function update() {
  if (!gameOver) {
    if (autoplay && pipes.length) {
      const now = performance.now();
      const next = pipes.find(p => p.x + PIPE_WIDTH > bird.x);
      if (next && bird.y > next.y + PIPE_GAP * 0.6 && now - lastAutoflap > flapCooldown) {
        bird.vel = FLAP;
        lastAutoflap = now;
      }
    }
    bird.vel += GRAVITY;
    bird.y += bird.vel;

    pipes.forEach(p => p.x -= BASE_SPEED + frame * SPEED_ACCEL);
    if (pipes.length && pipes[0].x < -PIPE_WIDTH) {
      pipes.shift(); score++;
    }
    if (frame % PIPE_INTERVAL === 0) {
      const y = Math.random() * (BASE_Y - PIPE_GAP - 40) + 40;
      pipes.push({ x: canvas.width, y });
    }
    if (collide()) endGame();
    frame++;
    requestAnimationFrame(loop);
  }
}

// Collision
function collide() {
  if (bird.y <= 0 || bird.y + bird.h >= BASE_Y) return true;
  return pipes.some(p =>
    bird.x + bird.w > p.x && bird.x < p.x + PIPE_WIDTH &&
    (bird.y < p.y || bird.y + bird.h > p.y + PIPE_GAP)
  );
}

// Input
function flap() { if (!gameOver) bird.vel = FLAP; }
document.addEventListener("keydown", e => {
  if (e.code === "Space" || e.code === "ArrowUp") flap();
});
canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", e => { e.preventDefault(); flap(); }, { passive: false });

// Menu/UI
document.getElementById("startBtn").onclick = () => startGame();
document.getElementById("restartBtn").onclick = () => startGame();
document.getElementById("howToBtn").onclick = () => {
  document.getElementById("instructions").classList.toggle("hidden");
};
document.getElementById("autoplayBtn").onclick = () => {
  autoplay = !autoplay;
  document.getElementById("autoplayBtn").textContent = `Toggle Autoplay: ${autoplay ? "ON" : "OFF"}`;
};

function startGame() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameOverScreen").classList.add("hidden");
  frame = 0; score = 0; gameOver = false;
  bird = { x: 50, y: 150, w: 34, h: 24, vel: 0 };
  pipes = [];
  update();
}

function endGame() {
  gameOver = true;
  document.getElementById("gameOverScreen").classList.remove("hidden");
  document.getElementById("finalScore").textContent = `Final Score: ${score}`;
  ctx.drawImage(images.gameover, (canvas.width-images.gameover.width)/2, canvas.height/2-50);
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(); update();
}

// Initial
startGame();

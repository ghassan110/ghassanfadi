let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let car = { x: 180, y: 500, width: 40, height: 60, speed: 5 };
let obstacles = [];
let keys = {};
let gameRunning = false;
let score = 0;
let obstacleSpeed = 4;

// الخطوط المتحركة
let roadLines = [];
for (let i = 0; i < 10; i++) {
  roadLines.push({ x: canvas.width / 2 - 5, y: i * 80 });
}

// إنشاء سياق صوت
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, type = "sine", duration = 0.2) {
  let oscillator = audioCtx.createOscillator();
  let gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

function startGame() {
  document.getElementById("startMenu").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("controls").style.display =
    /Mobi|Android/i.test(navigator.userAgent) ? "block" : "none";
  resetGame();
  gameRunning = true;
  requestAnimationFrame(updateGame);
}

function resetGame() {
  car.x = 180;
  car.y = 500;
  obstacles = [];
  score = 0;
  obstacleSpeed = 4;
}

function updateGame() {
  if (!gameRunning) return;

  // خلفية الطريق
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // رسم الخطوط البيضاء
  ctx.fillStyle = "white";
  for (let i = 0; i < roadLines.length; i++) {
    let line = roadLines[i];
    ctx.fillRect(line.x, line.y, 10, 40);
    line.y += obstacleSpeed;
    if (line.y > canvas.height) line.y = -40;
  }

  // سيارة اللاعب
  ctx.fillStyle = "red";
  ctx.fillRect(car.x, car.y, car.width, car.height);

  // رسم الحواجز
  ctx.fillStyle = "blue";
  for (let i = 0; i < obstacles.length; i++) {
    let ob = obstacles[i];
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    ob.y += obstacleSpeed;

    // الاصطدام
    if (
      car.x < ob.x + ob.width &&
      car.x + car.width > ob.x &&
      car.y < ob.y + ob.height &&
      car.y + car.height > ob.y
    ) {
      playSound(120, "sawtooth", 0.5); // صوت الاصطدام
      gameOver();
      return;
    }
  }

  // إضافة حواجز جديدة
  if (Math.random() < 0.02) {
    let obX = Math.random() * (canvas.width - 60);
    obstacles.push({ x: obX, y: -50, width: 60, height: 20 });
  }

  // إزالة الحواجز القديمة
  obstacles = obstacles.filter((ob) => ob.y < canvas.height);

  // حركة السيارة
  if (keys["ArrowLeft"] || keys["a"]) car.x -= car.speed;
  if (keys["ArrowRight"] || keys["d"]) car.x += car.speed;

  // حدود الشاشة
  if (car.x < 0) car.x = 0;
  if (car.x + car.width > canvas.width) car.x = canvas.width - car.width;

  // تحديث النقاط + تشغيل صوت خفيف
  score++;
  if (score % 50 === 0) {
    playSound(600, "triangle", 0.1); // صوت عند زيادة النقاط
  }

  ctx.fillStyle = "yellow";
  ctx.font = "20px Arial";
  ctx.fillText("النقاط: " + score, 10, 30);

  requestAnimationFrame(updateGame);
}

function gameOver() {
  gameRunning = false;
  alert("💥 انتهت اللعبة! نقاطك: " + score);
  document.getElementById("startMenu").style.display = "block";
  canvas.style.display = "none";
  document.getElementById("controls").style.display = "none";
}

// تحكم الكيبورد
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// تحكم الجوال
function moveLeft() {
  car.x -= car.speed * 2;
}
function moveRight() {
  car.x += car.speed * 2;
       }

// ===== لعبة سيارة وحواجز — مع أصوات =====

// إنشاء عناصر DOM
const body = document.body;
body.style.margin = "0";
body.style.background = "#0b0b0f";
body.style.color = "#fff";
body.style.fontFamily = "Tahoma, Arial, sans-serif";
body.style.textAlign = "center";

// عنوان
const title = document.createElement("h2");
title.textContent = "🚗 لعبة سيارة وحواجز — غسان قيمز";
body.appendChild(title);

// لوحة النتائج + إعادة
const hud = document.createElement("div");
hud.style.margin = "8px";
const scoreEl = document.createElement("span");
scoreEl.textContent = "النقاط: 0";
scoreEl.style.marginRight = "10px";
hud.appendChild(scoreEl);

const restartBtn = document.createElement("button");
restartBtn.textContent = "إعادة تشغيل";
restartBtn.style.padding = "6px 12px";
hud.appendChild(restartBtn);
body.appendChild(hud);

// كانفس
const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 600;
canvas.style.background = "linear-gradient(#0c1220,#071018)";
canvas.style.borderRadius = "12px";
body.appendChild(canvas);

const ctx = canvas.getContext("2d");

// أزرار لمس (للجوال)
const controls = document.createElement("div");
controls.style.display = "flex";
controls.style.justifyContent = "center";
controls.style.marginTop = "12px";

const leftBtn = document.createElement("button");
leftBtn.textContent = "◀️";
leftBtn.style.margin = "0 5px";
const brakeBtn = document.createElement("button");
brakeBtn.textContent = "🛑";
brakeBtn.style.margin = "0 5px";
const rightBtn = document.createElement("button");
rightBtn.textContent = "▶️";
rightBtn.style.margin = "0 5px";

controls.appendChild(leftBtn);
controls.appendChild(brakeBtn);
controls.appendChild(rightBtn);
body.appendChild(controls);

// ==================== بيانات اللعبة ====================
let W = canvas.width, H = canvas.height;
let player = { w: 50, h: 25, x: (W-50)/2, y: H-80 };
let obstacles = [];
let running = true;
let score = 0;
let spawnTimer = 0;
let keys = {};

// ==================== الأصوات ====================
const crashSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
const pointSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const moveSound = new Audio("https://actions.google.com/sounds/v1/cartoon/woodpecker_pecking.ogg");

// ==================== تحكم ====================
// كيبورد
window.addEventListener("keydown", e => {
  if(["ArrowLeft","a","A"].includes(e.key)) { keys.left = true; playMove(); }
  if(["ArrowRight","d","D"].includes(e.key)) { keys.right = true; playMove(); }
  if(["ArrowDown","s","S"].includes(e.key)) keys.brake = true;
});
window.addEventListener("keyup", e => {
  if(["ArrowLeft","a","A"].includes(e.key)) keys.left = false;
  if(["ArrowRight","d","D"].includes(e.key)) keys.right = false;
  if(["ArrowDown","s","S"].includes(e.key)) keys.brake = false;
});

// لمس
leftBtn.addEventListener("touchstart", ()=> { keys.left=true; playMove(); });
leftBtn.addEventListener("touchend", ()=> keys.left=false);
rightBtn.addEventListener("touchstart", ()=> { keys.right=true; playMove(); });
rightBtn.addEventListener("touchend", ()=> keys.right=false);
brakeBtn.addEventListener("touchstart", ()=> keys.brake=true);
brakeBtn.addEventListener("touchend", ()=> keys.brake=false);

// ==================== دوال ====================
function clampPlayer(){
  if(player.x < 5) player.x = 5;
  if(player.x + player.w > W-5) player.x = W - player.w - 5;
}

function spawnObstacle(){
  const w = 40 + Math.random()*40;
  const x = 5 + Math.random()*(W - w - 10);
  obstacles.push({x, y: -40, w, h: 20 + Math.random()*20, speed: 2 + Math.random()*2});
}

function update(dt){
  if(!running) return;
  if(keys.left) player.x -= 200*dt;
  if(keys.right) player.x += 200*dt;
  if(keys.brake) player.y = H-60; else player.y = H-80;
  clampPlayer();

  spawnTimer -= dt;
  if(spawnTimer <= 0){
    spawnTimer = 1;
    spawnObstacle();
  }

  for(let i=obstacles.length-1;i>=0;i--){
    const o = obstacles[i];
    o.y += o.speed * (1 + score/200) * dt * 60/1;
    if(o.y > H+30){
      obstacles.splice(i,1);
      score += 10;
      pointSound.currentTime = 0;
      pointSound.play();
    }
  }

  // اصطدام
  for(const o of obstacles){
    if(o.x < player.x + player.w && o.x + o.w > player.x &&
       o.y < player.y + player.h && o.y + o.h > player.y){
      running = false;
      crashSound.currentTime = 0;
      crashSound.play();
    }
  }

  scoreEl.textContent = "النقاط: " + score;
}

function draw(){
  ctx.clearRect(0,0,W,H);

  // الطريق
  ctx.fillStyle = "#11161a";
  ctx.fillRect(0,0,W,H);

  // السيارة
  ctx.fillStyle = "#107ac0";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // العجلات
  ctx.fillStyle = "#000";
  ctx.fillRect(player.x+5, player.y+player.h-4, 8,4);
  ctx.fillRect(player.x+player.w-13, player.y+player.h-4, 8,4);

  // العقبات
  ctx.fillStyle = "#c0262e";
  obstacles.forEach(o => ctx.fillRect(o.x,o.y,o.w,o.h));

  // المستوى
  ctx.fillStyle = "#fff";
  ctx.font = "14px Tahoma";
  ctx.fillText("المستوى: " + Math.floor(1+score/100), 10,20);
}

let last = performance.now();
function loop(now){
  const dt = (now-last)/1000; last = now;
  update(dt);
  draw();
  if(running) requestAnimationFrame(loop);
}

// ==================== إعادة ====================
function reset(){
  player.x = (W-player.w)/2;
  obstacles = [];
  score = 0;
  running = true;
  last = performance.now();
  requestAnimationFrame(loop);
}

restartBtn.addEventListener("click", reset);

// ===== أصوات مساعدة =====
function playMove(){
  moveSound.currentTime = 0;
  moveSound.play();
}

// بدء
reset();

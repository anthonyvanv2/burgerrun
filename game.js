
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth / 0.8;
canvas.height = window.innerHeight / 0.8;

let gameStarted = false;
let gameOver = false;
let showingHowToPlay = false;
let gravity = 1;
let score = 0;
let startTime = Date.now();
let gameSpeed = 5;
let lives = 2;
let burgersCollected = 0;

const GROUND_Y = canvas.height / 2;
const nameInput = document.getElementById('nameInput');
const submitScoreBtn = document.getElementById('submitScoreBtn');
const playNowBtn = document.getElementById('playNowBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const backBtn = document.getElementById('backBtn');

const player = {
  x: 100,
  y: GROUND_Y - 60,
  width: 48,
  height: 60,
  yVelocity: 0,
  jumping: false
};

const runFrames = [new Image(), new Image()];
runFrames[0].src = "https://static.wixstatic.com/media/3a780f_cfbec724c8cd43d98b8801d95c9e1c99~mv2.png";
runFrames[1].src = "https://static.wixstatic.com/media/3a780f_bc96a62415894cf0a678e6641c9c43a2~mv2.png";
const jumpFrame = new Image();
jumpFrame.src = "https://static.wixstatic.com/media/3a780f_50bda9657e6346dba944ff921846a595~mv2.png";
const groundTile = new Image();
groundTile.src = "https://static.wixstatic.com/media/3a780f_3d90abdf58ce494a9ea6f51eb6512cab~mv2.png";
const heartImage = new Image();
heartImage.src = "https://static.wixstatic.com/media/3a780f_3c08ae764e9e42a29a2b8d9994a0e991~mv2.png";
const saladImage = new Image();
saladImage.src = "https://static.wixstatic.com/media/3a780f_db190564d4fc4c32866358aba4de77f3~mv2.png";
const broccoliImage = new Image();
broccoliImage.src = "https://static.wixstatic.com/media/3a780f_f1923ae5c5384be191060caf3e454a03~mv2.png";
const bgImage = new Image();
bgImage.src = "https://static.wixstatic.com/media/3a780f_7112db826f3843d0b337ad7190491bdc~mv2.png";
const howToPlayImage = new Image();
howToPlayImage.src = "https://static.wixstatic.com/media/3a780f_168398e77a1741479fc563c8eef9ea01~mv2.png";

const burgerFrames = [new Image(), new Image(), new Image(), new Image()];
burgerFrames[0].src = "https://static.wixstatic.com/media/3a780f_83a8fca0cc95454aab36a1f82b7a04e1~mv2.png";
burgerFrames[1].src = "https://static.wixstatic.com/media/3a780f_c24d3a80dd384b62b4ece899320b2b72~mv2.png";
burgerFrames[2].src = "https://static.wixstatic.com/media/3a780f_41d2015c52ca4befa134f4a51874c3de~mv2.png";
burgerFrames[3].src = "https://static.wixstatic.com/media/3a780f_5d9951f7210a4859937482eb98bf0027~mv2.png";

const burgers = [], salads = [], broccolis = [], holes = [], platforms = [];
let frameTimer = 0, currentFrame = 0, groundOffset = 0;

function submitScore() {
  const name = nameInput.value.trim();
  if (!name) return alert('Please enter your name.');
  window.parent.postMessage({
    type: 'submitScore',
    data: { title: name, score: score }
  }, '*');
  nameInput.style.display = 'none';
  submitScoreBtn.style.display = 'none';
  tryAgainBtn.style.display = 'block';
}
submitScoreBtn.addEventListener('click', submitScore);

function spawnBurger(x, y) {
  burgers.push({
    x: x || canvas.width + Math.random() * 1000,
    y: y || (Math.random() < 0.4 ? GROUND_Y - 100 - Math.random() * 150 : GROUND_Y - 32),
    width: 32,
    height: 32,
    frame: 0,
    frameTick: 0
  });
}
function spawnSalad() {
  salads.push({ x: canvas.width + Math.random() * 800, y: GROUND_Y - 32, width: 32, height: 32 });
}
function spawnBroccoli() {
  const h = player.height * 1.5;
  broccolis.push({ x: canvas.width + Math.random() * 1000, y: GROUND_Y - h, width: (122 / 227) * h, height: h });
}
function spawnHole() {
  holes.push({ x: canvas.width + Math.random() * 1000, width: 100, y: GROUND_Y + 10, height: 50 });
}
function spawnPlatform() {
  const x = canvas.width + Math.random() * 1200;
  const y = GROUND_Y - 100 - Math.random() * 100;
  platforms.push({ x, y, width: 100, height: 10 });
  if (Math.random() < 0.5) spawnBurger(x + 18, y - 34);
}
function resetGame() {
  player.y = GROUND_Y - player.height;
  player.yVelocity = 0;
  burgers.length = 0;
  holes.length = 0;
  platforms.length = 0;
  salads.length = 0;
  broccolis.length = 0;
  burgersCollected = 0;
  lives = 2;
  startTime = Date.now();
  gameOver = false;
  currentFrame = 0;
  frameTimer = 0;
  gameSpeed = 5;
  tryAgainBtn.style.display = 'none';
  update();
}
function jump() {
  if (!player.jumping && !gameOver) {
    player.yVelocity = -20;
    player.jumping = true;
  }
}
window.addEventListener('keydown', e => { if (e.code === 'Space') jump(); });
window.addEventListener('touchstart', jump);
playNowBtn.addEventListener('click', () => { gameStarted = true; playNowBtn.style.display = 'none'; howToPlayBtn.style.display = 'none'; resetGame(); });
howToPlayBtn.addEventListener('click', () => { showingHowToPlay = true; drawHowToPlay(); });
backBtn.addEventListener('click', () => { showingHowToPlay = false; drawTitleScreen(); });
tryAgainBtn.addEventListener('click', resetGame);

setInterval(spawnBurger, 2000);
setInterval(spawnHole, 4000);
setInterval(spawnPlatform, 3000);
setInterval(spawnSalad, 5000);
setInterval(spawnBroccoli, 7000);

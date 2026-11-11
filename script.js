
'use strict';

/* =========================================================
   VILAREJOS — BRUXOS VS VAMPIROS
   Versão aprimorada: modos distintos, combate balanceado,
   controles responsivos e salvamento local de progresso.
========================================================= */

const characters = [
  { name: 'Luna', class: 'BRUXA', rarity: 'RARO', emoji: '🧙‍♀️', hp: 1150, damage: 150, speed: 5, description: 'Uma jovem bruxa que domina a magia da lua.' },
  { name: 'Dante', class: 'VAMPIRO', rarity: 'RARO', emoji: '🧛‍♂️', hp: 1250, damage: 165, speed: 5, description: 'Um vampiro sombrio que luta com sua espada.' },
  { name: 'Íris', class: 'BRUXA', rarity: 'SUPER-RARO', emoji: '🧙', hp: 1350, damage: 145, speed: 5, description: 'Uma feiticeira ligada às flores e à natureza.' },
  { name: 'Noah', class: 'VAMPIRO', rarity: 'SUPER-RARO', emoji: '🧛', hp: 1400, damage: 180, speed: 5, description: 'Um espadachim vampiro extremamente veloz.' },
  { name: 'Maya', class: 'BRUXA', rarity: 'ÉPICO', emoji: '🧙‍♀️', hp: 1250, damage: 220, speed: 4, description: 'Uma poderosa bruxa que controla o fogo arcano.' },
  { name: 'Caio', class: 'VAMPIRO', rarity: 'ÉPICO', emoji: '🧛‍♂️', hp: 1750, damage: 190, speed: 4, description: 'Um vampiro forte que prefere o combate direto.' },
  { name: 'Celeste', class: 'BRUXA', rarity: 'MÍTICO', emoji: '🔮', hp: 1450, damage: 250, speed: 5, description: 'Uma bruxa das estrelas capaz de manipular o cosmos.' },
  { name: 'Ravi', class: 'VAMPIRO', rarity: 'MÍTICO', emoji: '🧛', hp: 1550, damage: 245, speed: 5, description: 'Um vampiro que domina a energia das sombras.' },
  { name: 'Amélia', class: 'BRUXA', rarity: 'CROMÁTICO', emoji: '🧙‍♀️', hp: 1650, damage: 280, speed: 6, description: 'Uma bruxa extremamente poderosa e colorida.' },
  { name: 'Enzo', class: 'VAMPIRO', rarity: 'CROMÁTICO', emoji: '🧛‍♂️', hp: 1700, damage: 270, speed: 6, description: 'Um vampiro ligado aos mistérios da noite.' }
];

const $ = id => document.getElementById(id);
const screens = ['lobby', 'charactersScreen', 'modesScreen', 'battleScreen', 'resultScreen', 'pauseScreen']
  .map(id => $(id));
const canvas = $('arenaCanvas');
const ctx = canvas.getContext('2d');

let selectedCharacter = characters[0];
let trophies = 0;
let coins = 250;
let player = null;
let enemy = null;
let keys = Object.create(null);
let currentMode = 'duelo';
let wave = 1;
let score = 0;
let effects = [];
let particles = [];
let lastFrame = 0;
let elapsed = 0;
let battleEnded = false;
let pausedFrom = 'playing';
let messageTimer = 0;
let joystickActive = false;
let joystickPointerId = null;
let joystickX = 0;
let joystickY = 0;
let attackCooldown = 0;
let enemyAttackCooldown = 0;
let superEnergy = 100;
let superCooldown = 0;
let trainingHits = 0;
let arenaWins = 0;

const joystick = $('joystick');
const joystickKnob = $('joystickKnob');

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('vilarejos-save') || '{}');
    trophies = Number.isFinite(saved.trophies) ? Math.max(0, saved.trophies) : 0;
    coins = Number.isFinite(saved.coins) ? Math.max(0, saved.coins) : 250;
  } catch (_) {
    trophies = 0;
    coins = 250;
  }
  updateResources();
}

function saveProgress() {
  try {
    localStorage.setItem('vilarejos-save', JSON.stringify({ trophies, coins }));
  } catch (_) {
    // O jogo continua funcionando mesmo se o navegador bloquear o armazenamento.
  }
}

function updateResources() {
  $('trophies').textContent = trophies;
  $('coins').textContent = coins;
}

function showScreen(target) {
  screens.forEach(screen => screen.classList.toggle('active', screen === target));
  if (target === $('battleScreen')) resizeCanvas();
}

function updateLobby() {
  $('heroAvatar').textContent = selectedCharacter.emoji;
  $('heroName').textContent = selectedCharacter.name;
  $('heroTitle').textContent = selectedCharacter.name;
  $('heroClass').textContent = selectedCharacter.class;
  $('heroRarity').textContent = selectedCharacter.rarity;
  $('heroHP').textContent = selectedCharacter.hp;
  $('heroDamage').textContent = selectedCharacter.damage;
  $('heroSpeed').textContent = selectedCharacter.speed;
  $('heroDescription').textContent = selectedCharacter.description;
  $('heroClass').className = `badge ${selectedCharacter.class === 'BRUXA' ? 'witch' : 'vampire'}`;
  const rarityClass = {
    'RARO': 'rare', 'SUPER-RARO': 'superrare', 'ÉPICO': 'epic',
    'MÍTICO': 'mythic', 'CROMÁTICO': 'chromatic'
  }[selectedCharacter.rarity] || 'rare';
  $('heroRarity').className = `badge ${rarityClass}`;
}

function createCharacters() {
  const grid = $('charactersGrid');
  grid.replaceChildren();
  characters.forEach(character => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `character-card${character === selectedCharacter ? ' selected' : ''}`;
    card.setAttribute('aria-pressed', String(character === selectedCharacter));

    const avatar = document.createElement('div');
    avatar.className = 'card-avatar';
    avatar.textContent = character.emoji;
    const name = document.createElement('h3');
    name.textContent = character.name;
    const kind = document.createElement('div');
    kind.className = 'card-class';
    kind.textContent = `${character.class} • ${character.rarity}`;
    const stats = document.createElement('div');
    stats.className = 'card-stats';
    stats.textContent = `❤️ ${character.hp}     💥 ${character.damage}     ⚡ ${character.speed}`;

    card.append(avatar, name, kind, stats);
    card.addEventListener('click', () => {
      selectedCharacter = character;
      updateLobby();
      createCharacters();
      showScreen($('lobby'));
    });
    grid.appendChild(card);
  });
}

$('charactersButton').addEventListener('click', () => {
  createCharacters();
  showScreen($('charactersScreen'));
});
$('backCharacters').addEventListener('click', () => showScreen($('lobby')));
$('playButton').addEventListener('click', () => showScreen($('modesScreen')));
$('backModes').addEventListener('click', () => showScreen($('lobby')));
$('continueButton').addEventListener('click', () => showScreen($('lobby')));

document.querySelectorAll('.mode-card').forEach(button => {
  button.addEventListener('click', () => startBattle(button.dataset.mode));
});

/* -------------------- CANVAS E ARENA -------------------- */
function getCanvasSize() {
  const rect = canvas.getBoundingClientRect();
  return { width: Math.max(320, rect.width), height: Math.max(240, rect.height) };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(rect.width * dpr);
  const height = Math.round(rect.height * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (player && enemy) {
    const size = getCanvasSize();
    player.x = clamp(player.x, player.radius + 8, size.width * 0.48);
    player.y = clamp(player.y, size.height * 0.25 + player.radius, size.height - player.radius - 8);
    enemy.x = clamp(enemy.x, size.width * 0.52, size.width - enemy.radius - 8);
    enemy.y = clamp(enemy.y, size.height * 0.25 + enemy.radius, size.height - enemy.radius - 8);
  }
}
window.addEventListener('resize', resizeCanvas);

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function randomBetween(min, max) { return min + Math.random() * (max - min); }

function makeFighter({ x, y, radius, hp, damage, speed, color, emoji, isTrainingDummy = false }) {
  return {
    x, y, radius, hp, maxHp: hp, damage, speed, color, emoji,
    isTrainingDummy, facingX: -1, facingY: 0, hitFlash: 0,
    attackAnim: 0
  };
}

function startBattle(mode = 'duelo') {
  currentMode = mode;
  wave = 1;
  score = 0;
  elapsed = 0;
  battleEnded = false;
  effects = [];
  particles = [];
  attackCooldown = 0;
  enemyAttackCooldown = 1.0;
  superEnergy = 100;
  superCooldown = 0;
  trainingHits = 0;
  keys = Object.create(null);
  resetJoystick();
  showScreen($('battleScreen'));
  resizeCanvas();
  const { width, height } = getCanvasSize();
  const floorTop = height * 0.25;

  player = makeFighter({
    x: width * 0.23, y: height * 0.57, radius: 28,
    hp: selectedCharacter.hp, damage: selectedCharacter.damage,
    speed: selectedCharacter.speed * 43,
    color: selectedCharacter.class === 'BRUXA' ? '#8c58ff' : '#d94361',
    emoji: selectedCharacter.emoji
  });

  const training = mode === 'treinamento';
  const enemyHP = training ? 100000 : 1250 + (mode === 'arena' ? (wave - 1) * 220 : 0);
  const enemyDamage = training ? 0 : 110 + (mode === 'arena' ? (wave - 1) * 15 : 0);
  enemy = makeFighter({
    x: width * 0.76, y: height * 0.57, radius: 30,
    hp: enemyHP, damage: enemyDamage,
    speed: training ? 0 : 85 + (mode === 'arena' ? (wave - 1) * 7 : 0),
    color: '#b93255', emoji: '🧛', isTrainingDummy: training
  });

  $('battlePlayerName').textContent = selectedCharacter.name;
  $('battleEnemyName').textContent = training ? 'Boneco de Treino' : 'Guardião Sombrio';
  $('modeLabel').textContent = mode === 'duelo' ? 'DUELO 1V1' : mode === 'treinamento' ? 'TREINAMENTO' : 'ARENA';
  $('waveLabel').textContent = mode === 'arena' ? `ONDA ${wave} / 5` : '';
  $('battleMessage').textContent = mode === 'treinamento' ? 'TREINE SEUS MOVIMENTOS!' : 'PREPARE-SE!';
  messageTimer = 1.5;
  $('superButton').disabled = false;
  updateBattleUI();
}

function drawBlock(x, y, w, h) {
  ctx.fillStyle = '#4a3b70';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#705a9e';
  ctx.fillRect(x + 3, y + 3, w - 6, 5);
  ctx.strokeStyle = 'rgba(255,255,255,.17)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function drawArena() {
  const { width: w, height: h } = getCanvasSize();
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#191447');
  gradient.addColorStop(1, '#080714');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 36; i++) {
    const x = (i * 137) % w;
    const y = 85 + ((i * 71) % Math.max(100, h * 0.22));
    ctx.fillStyle = i % 3 === 0 ? '#c4b5fd88' : '#ffffff55';
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = '#211c3d';
  ctx.fillRect(0, h * 0.25, w, h * 0.75);
  ctx.strokeStyle = 'rgba(255,255,255,.055)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 70) {
    ctx.beginPath(); ctx.moveTo(x, h * 0.25); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = h * 0.25; y < h; y += 70) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  drawBlock(w * 0.5 - 100, h * 0.48, 200, 70);
  drawBlock(w * 0.15, h * 0.7, 100, 70);
  drawBlock(w * 0.75, h * 0.7, 100, 70);

  if (player) drawFighter(player, player.emoji);
  if (enemy) drawFighter(enemy, enemy.emoji);
  drawEffects();
}

function drawFighter(fighter, emoji) {
  ctx.save();
  ctx.globalAlpha = fighter.hitFlash > 0 ? 0.55 : 1;
  ctx.shadowColor = fighter.color;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.ellipse(fighter.x, fighter.y + fighter.radius + 7, fighter.radius * 1.05, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(fighter.x, fighter.y, fighter.radius, 0, Math.PI * 2);
  ctx.fillStyle = fighter.color;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,.38)';
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = `${fighter.radius * 1.45}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, fighter.x, fighter.y + 1);
  if (fighter.attackAnim > 0) {
    ctx.strokeStyle = '#fff4c2';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(fighter.x + fighter.facingX * 18, fighter.y + fighter.facingY * 18, fighter.radius + 12, -0.8, 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

/* -------------------- MOVIMENTO E COLISÕES -------------------- */
function circleRectCollision(cx, cy, radius, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

function getObstacles(width, height) {
  return [
    { x: width * 0.5 - 100, y: height * 0.48, w: 200, h: 70 },
    { x: width * 0.15, y: height * 0.7, w: 100, h: 70 },
    { x: width * 0.75, y: height * 0.7, w: 100, h: 70 }
  ];
}

function movePlayer(dt) {
  if (!player) return;
  const horizontal = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
  const vertical = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  let dx = horizontal + joystickX;
  let dy = vertical + joystickY;
  const length = Math.hypot(dx, dy);
  if (length > 1) { dx /= length; dy /= length; }

  const { width, height } = getCanvasSize();
  const obstacles = getObstacles(width, height);
  const stepX = dx * player.speed * dt;
  const stepY = dy * player.speed * dt;
  const minY = height * 0.25 + player.radius;
  const maxY = height - player.radius - 8;

  const nextX = clamp(player.x + stepX, player.radius + 8, width - player.radius - 8);
  if (!obstacles.some(rect => circleRectCollision(nextX, player.y, player.radius, rect))) player.x = nextX;
  const nextY = clamp(player.y + stepY, minY, maxY);
  if (!obstacles.some(rect => circleRectCollision(player.x, nextY, player.radius, rect))) player.y = nextY;

  if (length > 0.08) {
    player.facingX = dx / Math.max(length, 0.001);
    player.facingY = dy / Math.max(length, 0.001);
  }
}

function moveEnemy(dt) {
  if (!enemy || !player || enemy.isTrainingDummy) return;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.hypot(dx, dy);
  if (distance > 105) {
    const nx = dx / Math.max(distance, 0.001);
    const ny = dy / Math.max(distance, 0.001);
    const { width, height } = getCanvasSize();
    const obstacles = getObstacles(width, height);
    const nextX = clamp(enemy.x + nx * enemy.speed * dt, enemy.radius + 8, width - enemy.radius - 8);
    const nextY = clamp(enemy.y + ny * enemy.speed * dt, height * 0.25 + enemy.radius, height - enemy.radius - 8);
    if (!obstacles.some(rect => circleRectCollision(nextX, enemy.y, enemy.radius, rect))) enemy.x = nextX;
    if (!obstacles.some(rect => circleRectCollision(enemy.x, nextY, enemy.radius, rect))) enemy.y = nextY;
    enemy.facingX = -nx;
    enemy.facingY = -ny;
  }

  if (distance < player.radius + enemy.radius + 28 && enemyAttackCooldown <= 0) {
    player.hp = Math.max(0, player.hp - enemy.damage);
    player.hitFlash = 0.18;
    enemyAttackCooldown = 1.05;
    createBurst(player.x, player.y, '#ff536b', 12);
    updateBattleUI();
    if (player.hp <= 0) finishBattle(false);
  }
}

/* -------------------- ATAQUES -------------------- */
function attack() {
  if (!player || !enemy || battleEnded || !$('battleScreen').classList.contains('active')) return;
  if (attackCooldown > 0) return;
  attackCooldown = 0.42;
  player.attackAnim = 0.18;
  const dx = enemy.x - player.x;
  const dy = enemy.y - player.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= 205) {
    const damage = player.damage;
    damageEnemy(damage, '#ffd166');
    if (currentMode === 'treinamento') trainingHits++;
  } else {
    showBattleMessage('CHEGUE MAIS PERTO!');
  }
}

function superAttack() {
  if (!player || !enemy || battleEnded || !$('battleScreen').classList.contains('active')) return;
  if (superEnergy < 100 || superCooldown > 0) {
    showBattleMessage('SUPER AINDA NÃO CARREGADO!');
    return;
  }
  superEnergy = 0;
  superCooldown = 1.2;
  const damage = player.damage * 2.4;
  damageEnemy(damage, '#c4a1ff', true);
  createBurst(enemy.x, enemy.y, '#c4a1ff', 34);
  updateBattleUI();
}

function damageEnemy(amount, color, isSuper = false) {
  if (!enemy || battleEnded) return;
  enemy.hp = Math.max(0, enemy.hp - amount);
  enemy.hitFlash = 0.2;
  createAttackEffect(enemy.x, enemy.y, color, isSuper);
  score += Math.round(amount / 10);
  updateBattleUI();
  if (enemy.hp <= 0) handleEnemyDefeated();
}

function handleEnemyDefeated() {
  if (battleEnded || !enemy) return;
  if (currentMode === 'treinamento') {
    enemy.hp = enemy.maxHp;
    createBurst(enemy.x, enemy.y, '#7dd3fc', 22);
    showBattleMessage('ÓTIMO GOLPE! CONTINUE TREINANDO!');
    updateBattleUI();
    return;
  }
  if (currentMode === 'arena' && wave < 5) {
    wave++;
    const { width, height } = getCanvasSize();
    const newHp = 1250 + (wave - 1) * 220;
    enemy = makeFighter({
      x: width * 0.76, y: randomBetween(height * 0.38, height * 0.76),
      radius: 30 + Math.min(5, wave - 1), hp: newHp,
      damage: 110 + (wave - 1) * 15, speed: 85 + (wave - 1) * 7,
      color: wave % 2 ? '#b93255' : '#7c3aed', emoji: wave % 2 ? '🧛' : '👹'
    });
    enemyAttackCooldown = 1.1;
    superEnergy = Math.min(100, superEnergy + 25);
    $('battleEnemyName').textContent = `Guardião — Onda ${wave}`;
    $('waveLabel').textContent = `ONDA ${wave} / 5`;
    showBattleMessage(`ONDA ${wave}!`);
    updateBattleUI();
    return;
  }
  finishBattle(true);
}

/* -------------------- EFEITOS VISUAIS -------------------- */
function createAttackEffect(x, y, color = '#be78ff', large = false) {
  effects.push({ x, y, radius: 8, life: large ? 28 : 17, maxLife: large ? 28 : 17, color, growth: large ? 5 : 3 });
  createBurst(x, y, color, large ? 18 : 7);
}
function createBurst(x, y, color, amount = 12) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(35, 190);
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: randomBetween(0.2, 0.55), maxLife: 0.55, color, size: randomBetween(2, 6) });
  }
}
function updateEffects(dt) {
  effects.forEach(effect => { effect.radius += effect.growth * dt * 60; effect.life -= dt * 60; });
  effects = effects.filter(effect => effect.life > 0);
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.pow(0.08, dt); p.vy *= Math.pow(0.08, dt); p.life -= dt; });
  particles = particles.filter(p => p.life > 0);
  [player, enemy].filter(Boolean).forEach(f => { f.hitFlash = Math.max(0, f.hitFlash - dt); f.attackAnim = Math.max(0, f.attackAnim - dt); });
}
function drawEffects() {
  effects.forEach(effect => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, effect.life / effect.maxLife);
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  });
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.restore();
  });
}

/* -------------------- HUD, MENSAGENS E RESULTADO -------------------- */
function updateBattleUI() {
  if (!player || !enemy) return;
  const playerPercent = clamp(player.hp / player.maxHp, 0, 1) * 100;
  const enemyPercent = clamp(enemy.hp / enemy.maxHp, 0, 1) * 100;
  $('playerHealth').style.width = `${playerPercent}%`;
  $('enemyHealth').style.width = `${enemyPercent}%`;
  $('playerHealthText').textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
  $('enemyHealthText').textContent = enemy.isTrainingDummy ? 'ALVO DE TREINO' : `${Math.ceil(enemy.hp)} / ${enemy.maxHp}`;
  $('playerEnergy').style.width = `${superEnergy}%`;
  $('superButton').disabled = superEnergy < 100 || superCooldown > 0;
  $('battleScore').textContent = score;
  if (currentMode === 'arena') $('waveLabel').textContent = `ONDA ${wave} / 5`;
}

function showBattleMessage(text) {
  $('battleMessage').textContent = text;
  messageTimer = 1.15;
}

function finishBattle(won) {
  if (battleEnded) return;
  battleEnded = true;
  player = null;
  enemy = null;
  keys = Object.create(null);
  resetJoystick();

  let trophyReward = 0;
  let coinReward = 0;
  if (won) {
    if (currentMode === 'duelo') { trophyReward = 8; coinReward = 20; }
    if (currentMode === 'arena') { trophyReward = 8 + wave * 3; coinReward = 20 + wave * 8; arenaWins++; }
    trophies += trophyReward;
    coins += coinReward;
    $('resultIcon').textContent = '🏆';
    $('resultTitle').textContent = currentMode === 'treinamento' ? 'TREINO CONCLUÍDO!' : currentMode === 'arena' ? 'ARENA CONCLUÍDA!' : 'VITÓRIA!';
    $('resultText').textContent = currentMode === 'treinamento'
      ? `Você acertou ${trainingHits} golpes. Continue praticando para dominar seu personagem!`
      : `Você venceu com ${Math.floor(elapsed)} segundos de batalha e fez ${score} pontos!`;
  } else {
    coinReward = currentMode === 'treinamento' ? 0 : 5;
    coins += coinReward;
    $('resultIcon').textContent = '💀';
    $('resultTitle').textContent = 'DERROTA';
    $('resultText').textContent = 'O Guardião Sombrio venceu desta vez. Treine e tente novamente!';
  }
  $('rewardTrophies').textContent = trophyReward ? `+${trophyReward}` : '0';
  $('rewardCoins').textContent = coinReward ? `+${coinReward}` : '0';
  updateResources();
  saveProgress();
  showScreen($('resultScreen'));
}

/* -------------------- PAUSA E SAÍDA -------------------- */
function pauseGame() {
  if (!$('battleScreen').classList.contains('active') || battleEnded) return;
  pausedFrom = 'playing';
  keys = Object.create(null);
  resetJoystick();
  showScreen($('pauseScreen'));
}
function resumeGame() {
  if (battleEnded || !player || !enemy) return;
  showScreen($('battleScreen'));
  lastFrame = performance.now();
}
function exitBattle() {
  battleEnded = true;
  player = null;
  enemy = null;
  keys = Object.create(null);
  resetJoystick();
  showScreen($('lobby'));
}
$('pauseButton').addEventListener('click', pauseGame);
$('resumeButton').addEventListener('click', resumeGame);
$('exitBattleButton').addEventListener('click', exitBattle);
$('pauseExitButton').addEventListener('click', exitBattle);

/* -------------------- TECLADO E MOUSE -------------------- */
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
  keys[key] = true;
  if (event.code === 'Space' && !event.repeat) superAttack();
  if (key === 'escape') {
    if ($('battleScreen').classList.contains('active')) pauseGame();
    else if ($('pauseScreen').classList.contains('active')) resumeGame();
  }
});
window.addEventListener('keyup', event => { keys[event.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { keys = Object.create(null); resetJoystick(); });
canvas.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button === 0) attack();
});
$('attackButton').addEventListener('pointerdown', event => { event.preventDefault(); attack(); });
$('superButton').addEventListener('pointerdown', event => { event.preventDefault(); superAttack(); });

/* -------------------- JOYSTICK MOBILE -------------------- */
function updateJoystick(event) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const max = Math.max(1, rect.width / 2 - 30);
  const distance = Math.hypot(dx, dy);
  if (distance > max) { dx = dx / distance * max; dy = dy / distance * max; }
  joystickKnob.style.left = `calc(50% + ${dx}px)`;
  joystickKnob.style.top = `calc(50% + ${dy}px)`;
  joystickX = dx / max;
  joystickY = dy / max;
}
function resetJoystick() {
  joystickActive = false;
  joystickPointerId = null;
  joystickX = 0;
  joystickY = 0;
  if (joystickKnob) { joystickKnob.style.left = '50%'; joystickKnob.style.top = '50%'; }
}
joystick.addEventListener('pointerdown', event => {
  event.preventDefault();
  joystickActive = true;
  joystickPointerId = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
});
joystick.addEventListener('pointermove', event => {
  if (!joystickActive || event.pointerId !== joystickPointerId) return;
  updateJoystick(event);
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => joystick.addEventListener(type, resetJoystick));

/* -------------------- LOOP PRINCIPAL -------------------- */
function update(dt) {
  if (!$('battleScreen').classList.contains('active') || battleEnded || !player || !enemy) return;
  elapsed += dt;
  attackCooldown = Math.max(0, attackCooldown - dt);
  enemyAttackCooldown = Math.max(0, enemyAttackCooldown - dt);
  superCooldown = Math.max(0, superCooldown - dt);
  superEnergy = Math.min(100, superEnergy + dt * 13);
  movePlayer(dt);
  moveEnemy(dt);
  updateEffects(dt);
  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) $('battleMessage').textContent = '';
  }
  updateBattleUI();
}
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - (lastFrame || timestamp)) / 1000, 0.033);
  lastFrame = timestamp;
  if ($('battleScreen').classList.contains('active')) {
    update(dt);
    drawArena();
  }
  requestAnimationFrame(gameLoop);
}

loadProgress();
updateLobby();
createCharacters();
resizeCanvas();
requestAnimationFrame(gameLoop);

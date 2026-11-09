const characters = [

  {
    name: "Luna",
    class: "BRUXA",
    rarity: "RARO",
    emoji: "🧙‍♀️",
    hp: 1150,
    damage: 150,
    speed: 5,
    description: "Uma jovem bruxa que domina a magia da lua."
  },

  {
    name: "Dante",
    class: "VAMPIRO",
    rarity: "RARO",
    emoji: "🧛‍♂️",
    hp: 1250,
    damage: 165,
    speed: 5,
    description: "Um vampiro sombrio que luta com sua espada."
  },

  {
    name: "Íris",
    class: "BRUXA",
    rarity: "SUPER-RARO",
    emoji: "🧙",
    hp: 1350,
    damage: 145,
    speed: 5,
    description: "Uma feiticeira ligada às flores e à natureza."
  },

  {
    name: "Noah",
    class: "VAMPIRO",
    rarity: "SUPER-RARO",
    emoji: "🧛",
    hp: 1400,
    damage: 180,
    speed: 5,
    description: "Um espadachim vampiro extremamente veloz."
  },

  {
    name: "Maya",
    class: "BRUXA",
    rarity: "ÉPICO",
    emoji: "🧙‍♀️",
    hp: 1250,
    damage: 220,
    speed: 4,
    description: "Uma poderosa bruxa que controla o fogo arcano."
  },

  {
    name: "Caio",
    class: "VAMPIRO",
    rarity: "ÉPICO",
    emoji: "🧛‍♂️",
    hp: 1750,
    damage: 190,
    speed: 4,
    description: "Um vampiro forte que prefere o combate direto."
  },

  {
    name: "Celeste",
    class: "BRUXA",
    rarity: "MÍTICO",
    emoji: "🔮",
    hp: 1450,
    damage: 250,
    speed: 5,
    description: "Uma bruxa das estrelas capaz de manipular o cosmos."
  },

  {
    name: "Ravi",
    class: "VAMPIRO",
    rarity: "MÍTICO",
    emoji: "🧛",
    hp: 1550,
    damage: 245,
    speed: 5,
    description: "Um vampiro que domina a energia das sombras."
  },

  {
    name: "Amélia",
    class: "BRUXA",
    rarity: "CROMÁTICO",
    emoji: "🧙‍♀️",
    hp: 1650,
    damage: 280,
    speed: 6,
    description: "Uma bruxa extremamente poderosa e colorida."
  },

  {
    name: "Enzo",
    class: "VAMPIRO",
    rarity: "CROMÁTICO",
    emoji: "🧛‍♂️",
    hp: 1700,
    damage: 270,
    speed: 6,
    description: "Um vampiro ligado aos mistérios da noite."
  }

];


let selectedCharacter = characters[0];

let trophies = 0;
let coins = 250;

let player = null;
let enemy = null;

let keys = {};

let mouseX = 0;
let mouseY = 0;

let attacking = false;

let joystickActive = false;
let joystickX = 0;
let joystickY = 0;


/* =========================
   ELEMENTOS
========================= */

const lobby = document.getElementById("lobby");
const charactersScreen = document.getElementById("charactersScreen");
const modesScreen = document.getElementById("modesScreen");
const battleScreen = document.getElementById("battleScreen");
const resultScreen = document.getElementById("resultScreen");

const heroAvatar = document.getElementById("heroAvatar");
const heroName = document.getElementById("heroName");
const heroTitle = document.getElementById("heroTitle");

const heroClass = document.getElementById("heroClass");
const heroRarity = document.getElementById("heroRarity");

const heroHP = document.getElementById("heroHP");
const heroDamage = document.getElementById("heroDamage");
const heroSpeed = document.getElementById("heroSpeed");

const heroDescription =
  document.getElementById("heroDescription");

const charactersGrid =
  document.getElementById("charactersGrid");


/* =========================
   TELAS
========================= */

function showScreen(screen) {

  document.querySelectorAll(".screen")
    .forEach(s => s.classList.remove("active"));

  screen.classList.add("active");
}


/* =========================
   LOBBY
========================= */

function updateLobby() {

  heroAvatar.textContent = selectedCharacter.emoji;

  heroName.textContent = selectedCharacter.name;
  heroTitle.textContent = selectedCharacter.name;

  heroClass.textContent =
    selectedCharacter.class;

  heroRarity.textContent =
    selectedCharacter.rarity;

  heroHP.textContent =
    selectedCharacter.hp;

  heroDamage.textContent =
    selectedCharacter.damage;

  heroSpeed.textContent =
    selectedCharacter.speed;

  heroDescription.textContent =
    selectedCharacter.description;

  heroClass.className =
    "badge " +
    (selectedCharacter.class === "BRUXA"
      ? "witch"
      : "vampire");

  heroRarity.className =
    "badge " +
    selectedCharacter.rarity
      .toLowerCase()
      .replace("-", "")
      .replace("í", "i")
      .replace("ê", "e");
}


/* =========================
   PERSONAGENS
========================= */

function createCharacters() {

  charactersGrid.innerHTML = "";

  characters.forEach((character, index) => {

    const card =
      document.createElement("div");

    card.className = "character-card";

    if (character === selectedCharacter) {
      card.classList.add("selected");
    }

    card.innerHTML = `

      <div class="card-avatar">
        ${character.emoji}
      </div>

      <h3>${character.name}</h3>

      <div class="card-class">
        ${character.class} • ${character.rarity}
      </div>

      <div class="card-stats">
        <span>❤️ ${character.hp}</span>
        <span>💥 ${character.damage}</span>
      </div>

    `;

    card.addEventListener("click", () => {

      selectedCharacter = character;

      updateLobby();

      createCharacters();

      showScreen(lobby);

    });

    charactersGrid.appendChild(card);

  });

}


/* =========================
   BOTÕES
========================= */

document
  .getElementById("charactersButton")
  .addEventListener("click", () => {

    createCharacters();

    showScreen(charactersScreen);

  });


document
  .getElementById("backCharacters")
  .addEventListener("click", () => {

    showScreen(lobby);

  });


document
  .getElementById("playButton")
  .addEventListener("click", () => {

    showScreen(modesScreen);

  });


document
  .getElementById("backModes")
  .addEventListener("click", () => {

    showScreen(lobby);

  });


document
  .querySelectorAll(".mode-card")
  .forEach(button => {

    button.addEventListener("click", () => {

      startBattle();

    });

  });


document
  .getElementById("continueButton")
  .addEventListener("click", () => {

    showScreen(lobby);

  });


/* =========================
   CANVAS
========================= */

const canvas =
  document.getElementById("arenaCanvas");

const ctx =
  canvas.getContext("2d");


function resizeCanvas() {

  canvas.width =
    canvas.clientWidth *
    window.devicePixelRatio;

  canvas.height =
    canvas.clientHeight *
    window.devicePixelRatio;

  ctx.setTransform(
    window.devicePixelRatio,
    0,
    0,
    window.devicePixelRatio,
    0,
    0
  );

}

window.addEventListener(
  "resize",
  resizeCanvas
);


/* =========================
   BATALHA
========================= */

function startBattle() {

  showScreen(battleScreen);

  resizeCanvas();

  player = {

    x: canvas.clientWidth * .25,
    y: canvas.clientHeight * .5,

    radius: 28,

    hp: selectedCharacter.hp,
    maxHp: selectedCharacter.hp,

    damage: selectedCharacter.damage,

    color:
      selectedCharacter.class === "BRUXA"
        ? "#8c58ff"
        : "#d94361"

  };


  enemy = {

    x: canvas.clientWidth * .75,
    y: canvas.clientHeight * .5,

    radius: 30,

    hp: 1250,
    maxHp: 1250,

    damage: 110,

    color: "#b93255"

  };


  document
    .getElementById("battlePlayerName")
    .textContent =
    selectedCharacter.name;


  document
    .getElementById("battleEnemyName")
    .textContent =
    "Guardião Sombrio";


  updateBattleUI();

  document
    .getElementById("battleMessage")
    .textContent =
    "PREPARE-SE!";

  setTimeout(() => {

    document
      .getElementById("battleMessage")
      .textContent = "";

  }, 1000);

}


/* =========================
   DESENHAR ARENA
========================= */

function drawArena() {

  if (!player || !enemy) return;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;


  /* FUNDO */

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      h
    );

  gradient.addColorStop(
    0,
    "#191447"
  );

  gradient.addColorStop(
    1,
    "#080714"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    w,
    h
  );


  /* PISO */

  ctx.fillStyle =
    "#211c3d";

  ctx.fillRect(
    0,
    h * .25,
    w,
    h * .75
  );


  /* LINHAS DA ARENA */

  ctx.strokeStyle =
    "rgba(255,255,255,.08)";

  ctx.lineWidth = 2;

  for (
    let x = 0;
    x < w;
    x += 70
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x,
      h * .25
    );

    ctx.lineTo(
      x,
      h
    );

    ctx.stroke();

  }


  for (
    let y = h * .25;
    y < h;
    y += 70
  ) {

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      w,
      y
    );

    ctx.stroke();

  }


  /* OBSTÁCULOS */

  drawBlock(
    w * .5 - 100,
    h * .48,
    200,
    70
  );


  drawBlock(
    w * .15,
    h * .7,
    100,
    70
  );


  drawBlock(
    w * .75,
    h * .7,
    100,
    70
  );


  /* PERSONAGENS */

  drawFighter(
    player,
    selectedCharacter.emoji
  );

  drawFighter(
    enemy,
    "🧛"
  );

}


function drawBlock(x,y,w,h) {

  ctx.fillStyle =
    "#4a3b70";

  ctx.fillRect(
    x,
    y,
    w,
    h
  );

  ctx.strokeStyle =
    "rgba(255,255,255,.15)";

  ctx.strokeRect(
    x,
    y,
    w,
    h
  );

}


function drawFighter(
  fighter,
  emoji
) {

  /* sombra */

  ctx.beginPath();

  ctx.ellipse(
    fighter.x,
    fighter.y + 28,
    32,
    12,
    0,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(0,0,0,.35)";

  ctx.fill();


  /* círculo */

  ctx.beginPath();

  ctx.arc(
    fighter.x,
    fighter.y,
    fighter.radius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    fighter.color;

  ctx.fill();

  ctx.lineWidth = 4;

  ctx.strokeStyle =
    "rgba(255,255,255,.35)";

  ctx.stroke();


  /* personagem */

  ctx.font =
    `${fighter.radius * 1.5}px Arial`;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    emoji,
    fighter.x,
    fighter.y
  );

}


/* =========================
   VIDA
========================= */

function updateBattleUI() {

  if (!player || !enemy) return;

  const playerPercent =
    Math.max(
      0,
      player.hp / player.maxHp
    ) * 100;

  const enemyPercent =
    Math.max(
      0,
      enemy.hp / enemy.maxHp
    ) * 100;


  document
    .getElementById("playerHealth")
    .style.width =
    playerPercent + "%";


  document
    .getElementById("enemyHealth")
    .style.width =
    enemyPercent + "%";


  document
    .getElementById("playerHealthText")
    .textContent =
    `${Math.max(0,Math.round(player.hp))} / ${player.maxHp}`;


  document
    .getElementById("enemyHealthText")
    .textContent =
    `${Math.max(0,Math.round(enemy.hp))} / ${enemy.maxHp}`;

}


/* =========================
   ATAQUE
========================= */

function attack() {

  if (!player || !enemy) return;

  const dx =
    enemy.x - player.x;

  const dy =
    enemy.y - player.y;

  const distance =
    Math.hypot(dx,dy);


  if (distance < 230) {

    enemy.hp -= player.damage;

    createAttackEffect(
      enemy.x,
      enemy.y
    );

    updateBattleUI();

    if (enemy.hp <= 0) {

      winBattle();

    }

  }

}


function superAttack() {

  if (!player || !enemy) return;

  enemy.hp -=
    player.damage * 2;

  createSuperEffect();

  updateBattleUI();

  if (enemy.hp <= 0) {

    winBattle();

  }

}


/* =========================
   EFEITOS
========================= */

let effects = [];


function createAttackEffect(x,y) {

  effects.push({

    x,
    y,
    radius: 5,
    life: 20

  });

}


function createSuperEffect() {

  for(let i=0;i<25;i++){

    effects.push({

      x: enemy.x +
        (Math.random()-.5)*100,

      y: enemy.y +
        (Math.random()-.5)*100,

      radius: 5 +
        Math.random()*10,

      life: 40

    });

  }

}


function drawEffects() {

  effects.forEach(effect => {

    ctx.beginPath();

    ctx.arc(
      effect.x,
      effect.y,
      effect.radius,
      0,
      Math.PI*2
    );

    ctx.fillStyle =
      "rgba(190,120,255,.8)";

    ctx.fill();

    effect.radius += 2;

    effect.life--;

  });

  effects =
    effects.filter(
      e => e.life > 0
    );

}


/* =========================
   MOVIMENTO
========================= */

function updatePlayer() {

  if (!player) return;

  let dx = 0;
  let dy = 0;


  if (
    keys["w"] ||
    keys["ArrowUp"]
  ) dy--;

  if (
    keys["s"] ||
    keys["ArrowDown"]
  ) dy++;

  if (
    keys["a"] ||
    keys["ArrowLeft"]
  ) dx--;

  if (
    keys["d"] ||
    keys["ArrowRight"]
  ) dx++;


  dx += joystickX;
  dy += joystickY;


  const length =
    Math.hypot(dx,dy);


  if (length > 0) {

    dx /= length;
    dy /= length;

    player.x +=
      dx * selectedCharacter.speed;

    player.y +=
      dy * selectedCharacter.speed;

  }


  const w = canvas.clientWidth;
  const h = canvas.clientHeight;


  player.x =
    Math.max(
      35,
      Math.min(
        w - 35,
        player.x
      )
    );


  player.y =
    Math.max(
      h*.25 + 35,
      Math.min(
        h - 35,
        player.y
      )
    );

}


/* =========================
   INIMIGO
========================= */

let enemyAttackTimer = 0;


function updateEnemy() {

  if (!enemy || !player) return;


  const dx =
    player.x - enemy.x;

  const dy =
    player.y - enemy.y;

  const distance =
    Math.hypot(dx,dy);


  if (distance > 110) {

    enemy.x +=
      (dx / distance) * 1.4;

    enemy.y +=
      (dy / distance) * 1.4;

  }


  enemyAttackTimer--;


  if (
    distance < 100 &&
    enemyAttackTimer <= 0
  ) {

    player.hp -=
      enemy.damage;

    enemyAttackTimer = 60;

    updateBattleUI();

    if (player.hp <= 0) {

      loseBattle();

    }

  }

}


/* =========================
   RESULTADO
========================= */

function winBattle() {

  player = null;
  enemy = null;

  trophies += 8;
  coins += 20;

  document
    .getElementById("trophies")
    .textContent =
    trophies;

  document
    .getElementById("coins")
    .textContent =
    coins;


  document
    .getElementById("resultIcon")
    .textContent =
    "🏆";


  document
    .getElementById("resultTitle")
    .textContent =
    "VITÓRIA!";


  document
    .getElementById("resultText")
    .textContent =
    "Você venceu a batalha!";


  document
    .getElementById("rewardTrophies")
    .textContent =
    "+8";


  document
    .getElementById("rewardCoins")
    .textContent =
    "+20";


  showScreen(resultScreen);

}


function loseBattle() {

  player = null;
  enemy = null;


  document
    .getElementById("resultIcon")
    .textContent =
    "💀";


  document
    .getElementById("resultTitle")
    .textContent =
    "DERROTA";


  document
    .getElementById("resultText")
    .textContent =
    "O Guardião Sombrio venceu desta vez.";


  document
    .getElementById("rewardTrophies")
    .textContent =
    "0";


  document
    .getElementById("rewardCoins")
    .textContent =
    "+5";


  coins += 5;


  document
    .getElementById("coins")
    .textContent =
    coins;


  showScreen(resultScreen);

}


/* =========================
   TECLADO
========================= */

window.addEventListener(
  "keydown",
  event => {

    keys[event.key] = true;

    if (
      event.code === "Space"
    ) {

      event.preventDefault();

      superAttack();

    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    keys[event.key] = false;

  }
);


/* =========================
   MOUSE
========================= */

canvas.addEventListener(
  "mousemove",
  event => {

    const rect =
      canvas.getBoundingClientRect();

    mouseX =
      event.clientX -
      rect.left;

    mouseY =
      event.clientY -
      rect.top;

  }
);


canvas.addEventListener(
  "mousedown",
  event => {

    if (
      event.button === 0
    ) {

      attack();

    }

  }
);


/* =========================
   BOTÕES MOBILE
========================= */

document
  .getElementById("attackButton")
  .addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      attack();

    }
  );


document
  .getElementById("superButton")
  .addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      superAttack();

    }
  );


/* =========================
   JOYSTICK
========================= */

const joystick =
  document.getElementById("joystick");

const joystickKnob =
  document.getElementById("joystickKnob");


joystick.addEventListener(
  "pointerdown",
  event => {

    joystickActive = true;

    joystick.setPointerCapture(
      event.pointerId
    );

    updateJoystick(event);

  }
);


joystick.addEventListener(
  "pointermove",
  event => {

    if (!joystickActive) return;

    updateJoystick(event);

  }
);


joystick.addEventListener(
  "pointerup",
  resetJoystick
);


joystick.addEventListener(
  "pointercancel",
  resetJoystick
);


function updateJoystick(event) {

  const rect =
    joystick.getBoundingClientRect();

  const centerX =
    rect.left + rect.width/2;

  const centerY =
    rect.top + rect.height/2;

  let dx =
    event.clientX - centerX;

  let dy =
    event.clientY - centerY;


  const max =
    rect.width/2 - 30;

  const distance =
    Math.hypot(dx,dy);


  if (distance > max) {

    dx =
      dx / distance * max;

    dy =
      dy / distance * max;

  }


  joystickKnob.style.left =
    `calc(50% + ${dx}px)`;

  joystickKnob.style.top =
    `calc(50% + ${dy}px)`;


  joystickX =
    dx / max;

  joystickY =
    dy / max;

}


function resetJoystick() {

  joystickActive = false;

  joystickX = 0;
  joystickY = 0;

  joystickKnob.style.left =
    "50%";

  joystickKnob.style.top =
    "50%";

}


/* =========================
   LOOP
========================= */

function gameLoop() {

  if (
    battleScreen.classList.contains("active")
  ) {

    updatePlayer();

    updateEnemy();

    drawArena();

    drawEffects();

  }

  requestAnimationFrame(gameLoop);

}


updateLobby();

createCharacters();

gameLoop();

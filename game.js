const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  coins: document.getElementById("coinText"),
  wave: document.getElementById("waveText"),
  base: document.getElementById("baseText"),
  cap: document.getElementById("capText"),
  buff: document.getElementById("buffText"),
  best: document.getElementById("bestText"),
  pauseBtn: document.getElementById("pauseBtn"),
  pauseIcon: document.getElementById("pauseIcon"),
  speedBtn: document.getElementById("speedBtn"),
  restartBtn: document.getElementById("restartBtn"),
  gameOver: document.getElementById("gameOver"),
  endTitle: document.getElementById("endTitle"),
  endStats: document.getElementById("endStats"),
  choiceModal: document.getElementById("choiceModal"),
  choiceGrid: document.getElementById("choiceGrid"),
  choiceNote: document.getElementById("choiceNote"),
  toast: document.getElementById("toast"),
  waveRibbon: document.getElementById("waveRibbon"),
  costs: {
    rifle: document.getElementById("cost-rifle"),
    guard: document.getElementById("cost-guard"),
    medic: document.getElementById("cost-medic"),
    turret: document.getElementById("cost-turret"),
  },
  shopButtons: [...document.querySelectorAll("[data-buy]")],
};

const WORLD = {
  width: 0,
  height: 0,
  baseX: 76,
  lanes: [],
};

const UNIT_TYPES = {
  rifle: {
    name: "步枪兵",
    baseCost: 60,
    hp: 86,
    damage: 16,
    range: 270,
    fireRate: 1.05,
    color: "#588fc7",
  },
  guard: {
    name: "盾卫",
    baseCost: 90,
    hp: 190,
    damage: 12,
    range: 50,
    fireRate: 0.72,
    color: "#7b9aa6",
  },
  medic: {
    name: "医师",
    baseCost: 120,
    hp: 82,
    damage: 4,
    range: 230,
    fireRate: 1.25,
    color: "#78b889",
  },
  turret: {
    name: "机枪塔",
    baseCost: 180,
    hp: 135,
    damage: 13,
    range: 330,
    fireRate: 1.85,
    color: "#b78c4a",
  },
};

const ENEMY_TYPES = {
  grunt: {
    name: "小兵",
    hp: 72,
    damage: 8,
    speed: 32,
    reward: 18,
    color: "#7ca35f",
  },
  runner: {
    name: "快兵",
    hp: 52,
    damage: 7,
    speed: 54,
    reward: 20,
    color: "#d4ad47",
  },
  brute: {
    name: "重兵",
    hp: 150,
    damage: 14,
    speed: 23,
    reward: 35,
    color: "#b85b4f",
  },
  shield: {
    name: "盾兵",
    hp: 118,
    damage: 10,
    speed: 27,
    reward: 32,
    armor: 4,
    color: "#6c8c99",
  },
  boss: {
    name: "首领",
    hp: 520,
    damage: 24,
    speed: 18,
    reward: 120,
    armor: 5,
    color: "#8b5ac4",
  },
};

const UPGRADE_POOL = [
  {
    title: "士兵攻击力提升 8%",
    desc: "所有我方伤害永久提高",
    apply: () => {
      state.upgrades.damage *= 1.08;
    },
  },
  {
    title: "士兵生命提升 18%",
    desc: "现有和新招募单位都更耐打",
    apply: () => {
      state.upgrades.hp *= 1.18;
      state.units.forEach((unit) => {
        unit.maxHp *= 1.18;
        unit.hp *= 1.18;
      });
    },
  },
  {
    title: "射速提升 7%",
    desc: "步枪兵和机枪塔出手更快",
    apply: () => {
      state.upgrades.fireRate *= 1.07;
    },
  },
  {
    title: "敌人攻击力降低 4%",
    desc: "后续敌人的伤害会变低",
    apply: () => {
      state.upgrades.enemyDamage *= 0.96;
    },
  },
  {
    title: "金币收益提升 15%",
    desc: "击败敌人获得更多金币",
    apply: () => {
      state.upgrades.gold *= 1.15;
    },
  },
  {
    title: "城门生命提升 120",
    desc: "立即修复并提高上限",
    apply: () => {
      state.baseMaxHp += 120;
      state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 180);
    },
  },
  {
    title: "兵力上限增加 2",
    desc: "可以同时部署更多单位",
    apply: () => {
      state.unitCap += 2;
    },
  },
  {
    title: "暴击率提升 5%",
    desc: "攻击有概率造成双倍伤害",
    apply: () => {
      state.upgrades.crit += 0.05;
    },
  },
  {
    title: "城门每秒修复 2",
    desc: "没有失守前持续恢复",
    apply: () => {
      state.upgrades.regen += 2;
    },
  },
  {
    title: "爆裂弹概率提升 6%",
    desc: "子弹偶尔会伤到周围敌人",
    apply: () => {
      state.upgrades.splash += 0.06;
    },
  },
  {
    title: "招募费用降低 8%",
    desc: "所有兵种价格一起下降",
    apply: () => {
      state.upgrades.discount *= 0.92;
    },
  },
  {
    title: "医师治疗提升 25%",
    desc: "医师治疗量永久提高",
    apply: () => {
      state.upgrades.heal *= 1.25;
    },
  },
];

let state;
let lastFrame = 0;
let entityId = 1;
let resizeObserver;

function newState() {
  return {
    running: true,
    paused: false,
    modalOpen: false,
    gameOver: false,
    speed: 1,
    time: 0,
    wave: 0,
    waveClock: 0,
    nextWaveDelay: 0,
    spawnQueue: [],
    coins: 160,
    lifetimeCoins: 0,
    nextChoiceAt: 600,
    choices: 0,
    kills: 0,
    baseHp: 500,
    baseMaxHp: 500,
    unitCap: 12,
    units: [],
    enemies: [],
    projectiles: [],
    particles: [],
    floaters: [],
    bought: { rifle: 0, guard: 0, medic: 0, turret: 0 },
    upgrades: {
      damage: 1,
      hp: 1,
      fireRate: 1,
      enemyDamage: 1,
      gold: 1,
      discount: 1,
      crit: 0,
      splash: 0,
      regen: 0,
      heal: 1,
    },
    bestWave: Number(localStorage.getItem("endlessDefenseBestWave") || 0),
  };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  WORLD.width = rect.width;
  WORLD.height = rect.height;
  WORLD.baseX = Math.max(58, rect.width * 0.16);
  const top = rect.height * 0.29;
  const bottom = rect.height * 0.74;
  WORLD.lanes = [top, top + (bottom - top) / 3, top + (bottom - top) * 2 / 3, bottom];
}

function laneY(index) {
  return WORLD.lanes[index] || WORLD.height * 0.5;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function costOf(type) {
  const meta = UNIT_TYPES[type];
  const growth = Math.pow(1.12, state.bought[type]);
  return Math.max(1, Math.round(meta.baseCost * growth * state.upgrades.discount));
}

function currentUnitCount() {
  return state.units.length;
}

function chooseLaneForUnit() {
  const counts = WORLD.lanes.map((_, lane) => state.units.filter((unit) => unit.lane === lane).length);
  const min = Math.min(...counts);
  const choices = counts.map((count, lane) => (count === min ? lane : -1)).filter((lane) => lane >= 0);
  return choices[Math.floor(Math.random() * choices.length)];
}

function buyUnit(type) {
  if (state.gameOver || state.modalOpen) return;
  const cost = costOf(type);
  if (state.coins < cost) {
    showToast("金币不够");
    return;
  }
  if (currentUnitCount() >= state.unitCap) {
    showToast("兵力已满");
    return;
  }
  state.coins -= cost;
  state.bought[type] += 1;
  spawnUnit(type, chooseLaneForUnit());
  updateUi();
}

function spawnUnit(type, lane) {
  const meta = UNIT_TYPES[type];
  const maxHp = meta.hp * state.upgrades.hp;
  const spread = type === "turret" ? 55 : 120;
  const xBase = WORLD.baseX + (type === "turret" ? 30 : 66);
  const unit = {
    id: entityId++,
    side: "unit",
    type,
    lane,
    x: xBase + rand(0, spread),
    y: laneY(lane) + rand(-7, 7),
    hp: maxHp,
    maxHp,
    cooldown: rand(0.05, 0.35),
    attackFlash: 0,
  };
  state.units.push(unit);
  burst(unit.x, unit.y, "#ffe28e", 8);
}

function scheduleWave() {
  state.wave += 1;
  state.waveClock = 0;
  state.spawnQueue = [];

  const count = Math.min(11 + Math.floor(state.wave * 1.35), 58);
  for (let i = 0; i < count; i += 1) {
    state.spawnQueue.push({
      at: i * rand(0.33, 0.58),
      type: pickEnemyType(state.wave),
      lane: Math.floor(Math.random() * WORLD.lanes.length),
    });
  }

  if (state.wave % 5 === 0) {
    state.spawnQueue.push({
      at: count * 0.5 + 1.1,
      type: "boss",
      lane: Math.floor(Math.random() * WORLD.lanes.length),
    });
  }

  state.spawnQueue.sort((a, b) => a.at - b.at);
  ui.waveRibbon.textContent = `第 ${state.wave} 波`;
  ui.waveRibbon.classList.remove("show");
  void ui.waveRibbon.offsetWidth;
  ui.waveRibbon.classList.add("show");
}

function pickEnemyType(wave) {
  const roll = Math.random();
  if (wave < 3) return roll < 0.82 ? "grunt" : "runner";
  if (wave < 7) {
    if (roll < 0.48) return "grunt";
    if (roll < 0.75) return "runner";
    return "brute";
  }
  if (roll < 0.34) return "grunt";
  if (roll < 0.56) return "runner";
  if (roll < 0.82) return "brute";
  return "shield";
}

function spawnEnemy(type, lane) {
  const meta = ENEMY_TYPES[type];
  const wave = Math.max(1, state.wave);
  const scale = 1 + Math.pow(wave, 1.12) * 0.095;
  const speedBonus = 1 + Math.min(wave * 0.006, 0.5);
  const enemy = {
    id: entityId++,
    side: "enemy",
    type,
    lane,
    name: meta.name,
    x: WORLD.width + rand(26, 80),
    y: laneY(lane) + rand(-9, 9),
    hp: meta.hp * scale,
    maxHp: meta.hp * scale,
    damage: meta.damage * (1 + wave * 0.045) * state.upgrades.enemyDamage,
    speed: meta.speed * speedBonus,
    armor: meta.armor || 0,
    reward: Math.round(meta.reward * (1 + wave * 0.018) * state.upgrades.gold),
    color: meta.color,
    cooldown: rand(0.35, 0.8),
    attackFlash: 0,
  };
  state.enemies.push(enemy);
}

function update(dt) {
  if (!state.running || state.paused || state.modalOpen || state.gameOver) return;

  state.time += dt;
  if (state.upgrades.regen > 0) {
    state.baseHp = Math.min(state.baseMaxHp, state.baseHp + state.upgrades.regen * dt);
  }

  if (state.wave === 0) scheduleWave();
  processWave(dt);
  updateUnits(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateEffects(dt);
  removeDead();
  checkUpgradeChoice();
  checkGameOver();
}

function processWave(dt) {
  if (state.nextWaveDelay > 0) {
    state.nextWaveDelay -= dt;
    if (state.nextWaveDelay <= 0) scheduleWave();
    return;
  }

  state.waveClock += dt;
  while (state.spawnQueue.length && state.spawnQueue[0].at <= state.waveClock) {
    const item = state.spawnQueue.shift();
    spawnEnemy(item.type, item.lane);
  }

  if (state.spawnQueue.length === 0 && state.enemies.length === 0) {
    state.nextWaveDelay = 2.2;
    const bonus = Math.round(35 + state.wave * 6);
    state.coins += bonus;
    state.lifetimeCoins += bonus;
    addFloater(WORLD.width * 0.5, WORLD.height * 0.25, `守住 +${bonus}`, "#ffe28e");
  }
}

function updateUnits(dt) {
  state.units.forEach((unit) => {
    unit.cooldown -= dt;
    unit.attackFlash = Math.max(0, unit.attackFlash - dt * 4);
    if (unit.type === "medic") {
      healWithMedic(unit);
      return;
    }

    const target = findTarget(unit);
    if (!target || unit.cooldown > 0) return;

    const meta = UNIT_TYPES[unit.type];
    const fireRate = meta.fireRate * state.upgrades.fireRate;
    unit.cooldown = 1 / fireRate;
    unit.attackFlash = 1;

    if (unit.type === "guard") {
      hitEnemy(target, meta.damage * state.upgrades.damage, unit);
      return;
    }

    state.projectiles.push({
      id: entityId++,
      x: unit.x + 16,
      y: unit.y - 10,
      target,
      damage: meta.damage * state.upgrades.damage,
      speed: unit.type === "turret" ? 620 : 510,
      color: unit.type === "turret" ? "#ffe05f" : "#f8f2cd",
      splash: Math.random() < state.upgrades.splash,
    });
  });
}

function healWithMedic(unit) {
  const wounded = state.units
    .filter((ally) => ally.id !== unit.id && ally.lane === unit.lane && ally.hp < ally.maxHp)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

  if (wounded && unit.cooldown <= 0) {
    const heal = 22 * state.upgrades.heal;
    wounded.hp = Math.min(wounded.maxHp, wounded.hp + heal);
    unit.cooldown = 0.85 / state.upgrades.fireRate;
    unit.attackFlash = 1;
    addFloater(wounded.x, wounded.y - 24, `+${Math.round(heal)}`, "#aaf2b0");
    burst(wounded.x, wounded.y - 14, "#aaf2b0", 5);
    return;
  }

  const target = findTarget(unit);
  if (target && unit.cooldown <= 0) {
    unit.cooldown = 1 / (UNIT_TYPES.medic.fireRate * state.upgrades.fireRate);
    state.projectiles.push({
      id: entityId++,
      x: unit.x + 14,
      y: unit.y - 10,
      target,
      damage: UNIT_TYPES.medic.damage * state.upgrades.damage,
      speed: 450,
      color: "#9df3b4",
      splash: false,
    });
  }
}

function findTarget(unit) {
  const range = UNIT_TYPES[unit.type].range;
  return state.enemies
    .filter((enemy) => enemy.lane === unit.lane && enemy.hp > 0 && enemy.x >= unit.x - 10 && enemy.x - unit.x <= range)
    .sort((a, b) => a.x - b.x)[0];
}

function updateEnemies(dt) {
  state.enemies.forEach((enemy) => {
    enemy.cooldown -= dt;
    enemy.attackFlash = Math.max(0, enemy.attackFlash - dt * 4);

    const blocker = state.units
      .filter((unit) => unit.lane === enemy.lane && unit.hp > 0 && Math.abs(enemy.x - unit.x) < 38)
      .sort((a, b) => b.x - a.x)[0];

    if (blocker) {
      attackUnit(enemy, blocker);
      return;
    }

    if (enemy.x <= WORLD.baseX + 25) {
      attackBase(enemy);
      return;
    }

    enemy.x -= enemy.speed * dt;
  });
}

function attackUnit(enemy, unit) {
  if (enemy.cooldown > 0) return;
  enemy.cooldown = 0.82;
  enemy.attackFlash = 1;
  unit.hp -= enemy.damage;
  addFloater(unit.x, unit.y - 24, `-${Math.round(enemy.damage)}`, "#ff9f85");
  burst(unit.x, unit.y, "#d64b45", 4);
}

function attackBase(enemy) {
  if (enemy.cooldown > 0) return;
  enemy.cooldown = 0.7;
  enemy.attackFlash = 1;
  state.baseHp -= enemy.damage;
  addFloater(WORLD.baseX, enemy.y - 24, `-${Math.round(enemy.damage)}`, "#ff9f85");
  burst(WORLD.baseX, enemy.y, "#d64b45", 6);
}

function updateProjectiles(dt) {
  state.projectiles.forEach((projectile) => {
    const target = projectile.target;
    if (!target || target.hp <= 0) {
      projectile.dead = true;
      return;
    }
    const dx = target.x - projectile.x;
    const dy = target.y - projectile.y - 8;
    const distance = Math.hypot(dx, dy);
    const travel = projectile.speed * dt;
    if (distance <= travel || distance < 8) {
      hitEnemy(target, projectile.damage, projectile);
      projectile.dead = true;
      if (projectile.splash) {
        splashDamage(target, projectile.damage * 0.42);
      }
      return;
    }
    projectile.x += (dx / distance) * travel;
    projectile.y += (dy / distance) * travel;
  });
  state.projectiles = state.projectiles.filter((projectile) => !projectile.dead);
}

function hitEnemy(enemy, rawDamage, source) {
  const isCrit = Math.random() < state.upgrades.crit;
  const damage = Math.max(1, rawDamage * (isCrit ? 2 : 1) - enemy.armor);
  enemy.hp -= damage;
  enemy.attackFlash = Math.max(enemy.attackFlash, 0.45);
  if (isCrit) addFloater(enemy.x, enemy.y - 30, "暴击", "#ffe05f");
  burst(enemy.x, enemy.y - 8, source.color || "#f8f2cd", isCrit ? 7 : 4);
}

function splashDamage(origin, damage) {
  state.enemies.forEach((enemy) => {
    if (enemy.id === origin.id || enemy.hp <= 0) return;
    if (Math.abs(enemy.x - origin.x) < 62 && Math.abs(enemy.y - origin.y) < 46) {
      enemy.hp -= Math.max(1, damage - enemy.armor);
      burst(enemy.x, enemy.y, "#ffcc69", 3);
    }
  });
}

function removeDead() {
  state.units = state.units.filter((unit) => {
    if (unit.hp > 0) return true;
    burst(unit.x, unit.y, "#8d6250", 10);
    return false;
  });

  const survivors = [];
  state.enemies.forEach((enemy) => {
    if (enemy.hp > 0) {
      survivors.push(enemy);
      return;
    }
    state.kills += 1;
    state.coins += enemy.reward;
    state.lifetimeCoins += enemy.reward;
    addFloater(enemy.x, enemy.y - 22, `+${enemy.reward}`, "#ffe28e");
    burst(enemy.x, enemy.y, "#f1c85b", 12);
  });
  state.enemies = survivors;
}

function checkUpgradeChoice() {
  if (state.lifetimeCoins < state.nextChoiceAt || state.modalOpen || state.gameOver) return;
  state.modalOpen = true;
  state.choices += 1;
  state.nextChoiceAt += 600;
  showChoiceCards();
}

function showChoiceCards() {
  const cards = [...UPGRADE_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  ui.choiceGrid.innerHTML = "";
  cards.forEach((upgrade) => {
    const card = document.createElement("button");
    card.className = "choice-card";
    card.type = "button";
    card.innerHTML = `
      <span class="choice-icon" aria-hidden="true"></span>
      <strong>${upgrade.title}</strong>
      <span>${upgrade.desc}</span>
    `;
    card.addEventListener("click", () => {
      upgrade.apply();
      state.modalOpen = false;
      ui.choiceModal.hidden = true;
      showToast(upgrade.title);
      updateUi();
    });
    ui.choiceGrid.appendChild(card);
  });
  ui.choiceNote.textContent = "每收集 600 金币可选择一次能力加成";
  ui.choiceModal.hidden = false;
}

function checkGameOver() {
  if (state.baseHp > 0) return;
  state.baseHp = 0;
  state.gameOver = true;
  state.running = false;
  if (state.wave > state.bestWave) {
    state.bestWave = state.wave;
    localStorage.setItem("endlessDefenseBestWave", String(state.wave));
  }
  ui.endTitle.textContent = `守到第 ${state.wave} 波`;
  ui.endStats.textContent = `击败 ${state.kills} 个敌人，收集 ${Math.round(state.lifetimeCoins)} 金币`;
  ui.gameOver.hidden = false;
  updateUi();
}

function updateEffects(dt) {
  state.particles.forEach((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 75 * dt;
  });
  state.particles = state.particles.filter((particle) => particle.life > 0);

  state.floaters.forEach((floater) => {
    floater.life -= dt;
    floater.y -= 28 * dt;
  });
  state.floaters = state.floaters.filter((floater) => floater.life > 0);
}

function burst(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    state.particles.push({
      x,
      y,
      vx: rand(-55, 55),
      vy: rand(-80, 18),
      r: rand(2, 4.5),
      color,
      life: rand(0.35, 0.75),
    });
  }
}

function addFloater(x, y, text, color) {
  state.floaters.push({ x, y, text, color, life: 0.85 });
}

function showToast(text) {
  ui.toast.textContent = text;
  ui.toast.classList.remove("show");
  void ui.toast.offsetWidth;
  ui.toast.classList.add("show");
}

function updateUi() {
  ui.coins.textContent = Math.floor(state.coins);
  ui.wave.textContent = state.wave || 1;
  ui.base.textContent = `${Math.ceil(state.baseHp)}/${state.baseMaxHp}`;
  ui.cap.textContent = `兵力 ${currentUnitCount()}/${state.unitCap}`;
  ui.buff.textContent = `攻击 x${state.upgrades.damage.toFixed(2)}`;
  ui.best.textContent = `最佳 ${Math.max(state.bestWave, state.wave)}`;
  ui.pauseIcon.textContent = state.paused ? "▶" : "II";
  ui.pauseBtn.setAttribute("aria-label", state.paused ? "继续" : "暂停");
  ui.speedBtn.textContent = `${state.speed}x`;

  Object.keys(UNIT_TYPES).forEach((type) => {
    ui.costs[type].textContent = costOf(type);
  });

  ui.shopButtons.forEach((button) => {
    const type = button.dataset.buy;
    button.disabled = state.gameOver || state.modalOpen || currentUnitCount() >= state.unitCap || state.coins < costOf(type);
  });
}

function render() {
  const w = WORLD.width;
  const h = WORLD.height;
  if (!w || !h) return;

  ctx.clearRect(0, 0, w, h);
  drawBackground(w, h);
  drawBase(w, h);
  drawEntities();
  drawProjectiles();
  drawParticles();
  drawFloaters();
  drawForeground(w, h);
}

function drawBackground(w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.35);
  sky.addColorStop(0, "#7a9d69");
  sky.addColorStop(1, "#617f52");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#4e7143";
  drawHill(0, h * 0.21, w * 0.45, 70);
  drawHill(w * 0.38, h * 0.18, w * 0.54, 88);
  drawHill(w * 0.72, h * 0.23, w * 0.34, 58);

  ctx.fillStyle = "#5d8b4a";
  ctx.fillRect(0, h * 0.25, w, h * 0.75);

  ctx.strokeStyle = "rgba(29, 31, 23, 0.22)";
  ctx.lineWidth = 2;
  for (let i = 0; i < WORLD.lanes.length; i += 1) {
    const y = laneY(i);
    ctx.beginPath();
    ctx.moveTo(0, y + 25);
    ctx.lineTo(w, y + 25);
    ctx.stroke();

    ctx.fillStyle = i % 2 === 0 ? "rgba(217, 179, 91, 0.16)" : "rgba(255, 236, 174, 0.10)";
    roundRect(0, y - 28, w, 58, 0, true, false);
  }

  drawFence(w, h);
}

function drawHill(x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.quadraticCurveTo(x + width * 0.45, y - height * 0.4, x + width, y + height);
  ctx.closePath();
  ctx.fill();
}

function drawFence(w, h) {
  const y = h * 0.27;
  ctx.strokeStyle = "#293221";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y + 10);
  ctx.stroke();
  for (let x = -10; x < w; x += 34) {
    ctx.fillStyle = "#6a4d2f";
    roundRect(x, y - 22, 10, 54, 4, true, false);
    ctx.strokeStyle = "#221711";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y - 22, 10, 54);
  }
}

function drawBase(w, h) {
  const x = WORLD.baseX - 62;
  const top = h * 0.3;
  const bottom = h * 0.79;
  ctx.fillStyle = "#c69050";
  roundRect(x, top, 82, bottom - top, 8, true, false);
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 4;
  roundRect(x, top, 82, bottom - top, 8, false, true);

  ctx.fillStyle = "#8a5d32";
  for (let y = top + 20; y < bottom - 18; y += 44) {
    ctx.fillRect(x + 6, y, 70, 12);
  }

  ctx.fillStyle = "#e6c36d";
  ctx.beginPath();
  ctx.moveTo(x - 8, top + 12);
  ctx.lineTo(x + 41, top - 38);
  ctx.lineTo(x + 92, top + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const hpWidth = 86;
  const hpPct = clamp(state.baseHp / state.baseMaxHp, 0, 1);
  ctx.fillStyle = "#231a15";
  roundRect(x - 4, top - 58, hpWidth, 14, 7, true, false);
  ctx.fillStyle = hpPct > 0.35 ? "#cf4740" : "#edb248";
  roundRect(x - 2, top - 56, (hpWidth - 4) * hpPct, 10, 5, true, false);
}

function drawEntities() {
  const ordered = [...state.units, ...state.enemies].sort((a, b) => a.y - b.y);
  ordered.forEach((entity) => {
    if (entity.side === "unit") drawUnit(entity);
    else drawEnemy(entity);
  });
}

function drawUnit(unit) {
  const meta = UNIT_TYPES[unit.type];
  const bob = Math.sin(state.time * 4 + unit.id) * 1.5;
  const x = unit.x;
  const y = unit.y + bob;
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = meta.color;
  roundRect(-14, -3, 28, 26, 8, true, false);
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  roundRect(-14, -3, 28, 26, 8, false, true);

  ctx.fillStyle = "#f3bd75";
  ctx.beginPath();
  ctx.arc(0, -13, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1b1713";
  ctx.fillRect(-6, -16, 3, 7);
  ctx.fillRect(5, -16, 3, 7);

  if (unit.type === "guard") {
    ctx.fillStyle = "#8fb0bd";
    roundRect(11, -12, 15, 30, 7, true, true);
  } else if (unit.type === "medic") {
    ctx.fillStyle = "#f1f1d8";
    ctx.fillRect(-13, -30, 26, 6);
    ctx.fillStyle = "#cf4740";
    ctx.fillRect(-2, -34, 4, 14);
    ctx.fillRect(-7, -29, 14, 4);
  } else {
    ctx.strokeStyle = unit.attackFlash > 0 ? "#ffdf5b" : "#1b1713";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(31, -12);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(16, 5);
    ctx.lineTo(37, -7);
    ctx.stroke();
  }
  ctx.restore();
  drawHpBar(unit.x - 21, unit.y - 43, 42, unit.hp / unit.maxHp, "#77cf8a");
}

function drawEnemy(enemy) {
  const x = enemy.x;
  const y = enemy.y + Math.sin(state.time * enemy.speed * 0.06 + enemy.id) * 2;
  const scale = enemy.type === "boss" ? 1.35 : enemy.type === "brute" ? 1.15 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 17, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = enemy.attackFlash > 0 ? "#f07f57" : enemy.color;
  roundRect(-17, -22, 34, 42, 14, true, false);
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  roundRect(-17, -22, 34, 42, 14, false, true);

  ctx.fillStyle = "#1b1713";
  ctx.fillRect(-8, -9, 4, 9);
  ctx.fillRect(5, -9, 4, 9);

  ctx.strokeStyle = "#7a251c";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-20, 7);
  ctx.lineTo(-36, 18);
  ctx.stroke();

  if (enemy.type === "shield") {
    ctx.fillStyle = "#b8ced2";
    roundRect(-4, -26, 24, 30, 7, true, true);
  }
  if (enemy.type === "boss") {
    ctx.fillStyle = "#f0ba3e";
    ctx.beginPath();
    ctx.moveTo(-18, -24);
    ctx.lineTo(-8, -40);
    ctx.lineTo(0, -24);
    ctx.lineTo(10, -40);
    ctx.lineTo(18, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  drawHpBar(x - 24 * scale, y - 45 * scale, 48 * scale, enemy.hp / enemy.maxHp, "#e85c4f");
}

function drawHpBar(x, y, width, pct, color) {
  ctx.fillStyle = "#1b1713";
  roundRect(x, y, width, 7, 4, true, false);
  ctx.fillStyle = color;
  roundRect(x + 1, y + 1, (width - 2) * clamp(pct, 0, 1), 5, 3, true, false);
}

function drawProjectiles() {
  state.projectiles.forEach((projectile) => {
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.splash ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.globalAlpha = clamp(particle.life * 1.8, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawFloaters() {
  ctx.textAlign = "center";
  ctx.font = "900 15px Microsoft YaHei, sans-serif";
  state.floaters.forEach((floater) => {
    ctx.globalAlpha = clamp(floater.life, 0, 1);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1b1713";
    ctx.strokeText(floater.text, floater.x, floater.y);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, floater.x, floater.y);
  });
  ctx.globalAlpha = 1;
}

function drawForeground(w, h) {
  ctx.fillStyle = "rgba(35, 31, 25, 0.16)";
  ctx.fillRect(0, h - 18, w, 18);

  ctx.fillStyle = "#dfbd69";
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 61 + Math.sin(i) * 20) % w;
    const y = h * 0.82 + (i % 3) * 26;
    ctx.beginPath();
    ctx.ellipse(x, y, 13 + (i % 4), 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#584120";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function roundRect(x, y, width, height, radius, fill, stroke) {
  const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function loop(timestamp) {
  const elapsed = Math.min(0.05, (timestamp - lastFrame) / 1000 || 0);
  lastFrame = timestamp;
  update(elapsed * state.speed);
  render();
  updateUi();
  requestAnimationFrame(loop);
}

function restart() {
  state = newState();
  entityId = 1;
  ui.gameOver.hidden = true;
  ui.choiceModal.hidden = true;
  spawnUnit("rifle", 1);
  spawnUnit("guard", 2);
  showToast("新的防线已建立");
  updateUi();
}

function init() {
  state = newState();
  resizeCanvas();
  if (resizeObserver) resizeObserver.disconnect();
  resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);

  ui.shopButtons.forEach((button) => {
    button.addEventListener("click", () => buyUnit(button.dataset.buy));
  });
  ui.pauseBtn.addEventListener("click", () => {
    if (state.gameOver || state.modalOpen) return;
    state.paused = !state.paused;
    updateUi();
  });
  ui.speedBtn.addEventListener("click", () => {
    state.speed = state.speed === 1 ? 2 : 1;
    updateUi();
  });
  ui.restartBtn.addEventListener("click", restart);

  spawnUnit("rifle", 1);
  spawnUnit("guard", 2);
  updateUi();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resizeCanvas);
init();

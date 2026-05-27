const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  coins: document.getElementById("coinText"),
  territory: document.getElementById("territoryText"),
  wave: document.getElementById("waveText"),
  base: document.getElementById("baseText"),
  cap: document.getElementById("capText"),
  selected: document.getElementById("selectedText"),
  best: document.getElementById("bestText"),
  pauseBtn: document.getElementById("pauseBtn"),
  pauseIcon: document.getElementById("pauseIcon"),
  speedBtn: document.getElementById("speedBtn"),
  restartBtn: document.getElementById("restartBtn"),
  upgradeSelectedBtn: document.getElementById("upgradeSelectedBtn"),
  techBtn: document.getElementById("techBtn"),
  claimBtn: document.getElementById("claimBtn"),
  gameOver: document.getElementById("gameOver"),
  endTitle: document.getElementById("endTitle"),
  endStats: document.getElementById("endStats"),
  choiceModal: document.getElementById("choiceModal"),
  choiceTitle: document.getElementById("choiceTitle"),
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
  baseX: 66,
  enemyGateX: 0,
  deployLeft: 96,
  deployRight: 0,
  deployTop: 0,
  deployBottom: 0,
  bridges: [],
};

const UNIT_TYPES = {
  rifle: {
    name: "步枪兵",
    baseCost: 65,
    hp: 88,
    damage: 17,
    range: 230,
    fireRate: 1.05,
    moveSpeed: 165,
    color: "#5f94c8",
  },
  guard: {
    name: "盾卫",
    baseCost: 95,
    hp: 220,
    damage: 13,
    range: 46,
    fireRate: 0.72,
    moveSpeed: 130,
    color: "#7f9dab",
  },
  medic: {
    name: "医师",
    baseCost: 125,
    hp: 84,
    damage: 5,
    range: 205,
    fireRate: 1.2,
    moveSpeed: 155,
    color: "#78b889",
  },
  turret: {
    name: "机枪塔",
    baseCost: 190,
    hp: 150,
    damage: 14,
    range: 280,
    fireRate: 1.9,
    moveSpeed: 70,
    color: "#b88d50",
  },
};

const ENEMY_TYPES = {
  grunt: { name: "小兵", hp: 74, damage: 8, speed: 32, reward: 18, color: "#7fa65f" },
  runner: { name: "快兵", hp: 54, damage: 7, speed: 55, reward: 20, color: "#d4ad47" },
  brute: { name: "重兵", hp: 158, damage: 14, speed: 23, reward: 34, color: "#b95b50" },
  shield: { name: "盾兵", hp: 126, damage: 10, speed: 27, reward: 32, armor: 4, color: "#6e8f9c" },
  boss: { name: "首领", hp: 560, damage: 25, speed: 19, reward: 125, armor: 6, color: "#8b5bc4" },
};

const TECHS = [
  {
    id: "arms",
    title: "军械科技",
    desc: "全体攻击 +12%，射程 +5%",
    cost: (level) => 180 + level * 150,
    apply: () => {
      state.tech.arms += 1;
      state.upgrades.damage *= 1.12;
      state.upgrades.range *= 1.05;
    },
  },
  {
    id: "fort",
    title: "筑城科技",
    desc: "城门上限 +160，缓慢修复",
    cost: (level) => 170 + level * 145,
    apply: () => {
      state.tech.fort += 1;
      state.baseMaxHp += 160;
      state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 220);
      state.upgrades.regen += 1.8;
    },
  },
  {
    id: "supply",
    title: "后勤科技",
    desc: "金币收益 +15%，兵力 +1",
    cost: (level) => 160 + level * 135,
    apply: () => {
      state.tech.supply += 1;
      state.upgrades.gold *= 1.15;
      state.unitCap += 1;
    },
  },
];

const UPGRADE_POOL = [
  {
    title: "士兵攻击力提升 8%",
    desc: "所有部队伤害永久提高",
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
    desc: "远程与近战出手都更快",
    apply: () => {
      state.upgrades.fireRate *= 1.07;
    },
  },
  {
    title: "行军速度提升 12%",
    desc: "拖动后部队归位更快",
    apply: () => {
      state.upgrades.move *= 1.12;
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
    desc: "击败敌人和守波奖励更多",
    apply: () => {
      state.upgrades.gold *= 1.15;
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
    title: "爆裂弹概率提升 6%",
    desc: "远程攻击偶尔伤到周围敌人",
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
    bridgeCount: 1,
    territory: 1,
    canClaim: false,
    coins: 180,
    lifetimeCoins: 0,
    nextChoiceAt: 700,
    choices: 0,
    kills: 0,
    baseHp: 560,
    baseMaxHp: 560,
    unitCap: 10,
    selectedId: null,
    draggingId: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    units: [],
    enemies: [],
    projectiles: [],
    particles: [],
    floaters: [],
    bought: { rifle: 0, guard: 0, medic: 0, turret: 0 },
    tech: { arms: 0, fort: 0, supply: 0 },
    upgrades: {
      damage: 1,
      hp: 1,
      fireRate: 1,
      range: 1,
      move: 1,
      enemyDamage: 1,
      gold: 1,
      discount: 1,
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
  WORLD.baseX = Math.max(54, rect.width * 0.14);
  WORLD.enemyGateX = rect.width - Math.max(42, rect.width * 0.08);
  WORLD.deployLeft = WORLD.baseX + 58;
  WORLD.deployRight = rect.width - 72;
  WORLD.deployTop = rect.height * 0.24;
  WORLD.deployBottom = rect.height * 0.78;
  WORLD.bridges = [
    { y: rect.height * 0.42 },
    { y: rect.height * 0.64 },
  ];
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function selectedUnit() {
  return state.units.find((unit) => unit.id === state.selectedId) || null;
}

function currentUnitCount() {
  return state.units.length;
}

function activeBridgeCount() {
  return Math.min(2, state.bridgeCount);
}

function bridgeY(index) {
  return WORLD.bridges[index]?.y || WORLD.height * 0.5;
}

function clampDeployX(x) {
  return clamp(x, WORLD.deployLeft, WORLD.deployRight);
}

function clampDeployY(y) {
  return clamp(y, WORLD.deployTop, WORLD.deployBottom);
}

function costOf(type) {
  const meta = UNIT_TYPES[type];
  const growth = Math.pow(1.13, state.bought[type]);
  return Math.max(1, Math.round(meta.baseCost * growth * state.upgrades.discount));
}

function selectedUpgradeCost() {
  const unit = selectedUnit();
  if (!unit) return 0;
  return Math.round(95 + unit.level * 85 + Math.pow(unit.level, 1.4) * 18);
}

function claimCost() {
  return Math.round(160 + state.territory * 120);
}

function spawnUnit(type, x, y) {
  const meta = UNIT_TYPES[type];
  const maxHp = meta.hp * state.upgrades.hp;
  const unit = {
    id: entityId++,
    side: "unit",
    type,
    level: 1,
    x: clampDeployX(x),
    y: clampDeployY(y),
    targetX: clampDeployX(x),
    targetY: clampDeployY(y),
    hp: maxHp,
    maxHp,
    cooldown: rand(0.05, 0.35),
    attackFlash: 0,
    selectedPulse: rand(0, Math.PI * 2),
  };
  state.units.push(unit);
  state.selectedId = unit.id;
  burst(unit.x, unit.y, "#ffe28e", 8);
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
  const x = WORLD.deployLeft + 44 + rand(0, 110);
  const y = bridgeY(state.bought[type] % activeBridgeCount()) + rand(-38, 38);
  spawnUnit(type, x, y);
  updateUi();
}

function upgradeSelectedUnit() {
  const unit = selectedUnit();
  if (!unit || state.gameOver || state.modalOpen) return;
  const cost = selectedUpgradeCost();
  if (state.coins < cost) {
    showToast("金币不够");
    return;
  }
  state.coins -= cost;
  unit.level += 1;
  unit.maxHp *= 1.16;
  unit.hp = unit.maxHp;
  burst(unit.x, unit.y, "#f7ce5d", 14);
  addFloater(unit.x, unit.y - 36, `Lv.${unit.level}`, "#ffe28e");
  updateUi();
}

function showTechPanel() {
  if (state.gameOver || state.modalOpen) return;
  state.modalOpen = true;
  ui.choiceTitle.textContent = "选择科技";
  ui.choiceGrid.innerHTML = "";

  TECHS.forEach((tech) => {
    const level = state.tech[tech.id];
    const cost = tech.cost(level);
    const card = document.createElement("button");
    card.className = "choice-card";
    card.type = "button";
    card.innerHTML = `
      <span class="choice-icon" aria-hidden="true"></span>
      <strong>${tech.title} Lv.${level}</strong>
      <span>${tech.desc}<br>消耗 ${cost} 金币</span>
    `;
    card.addEventListener("click", () => {
      if (state.coins < cost) {
        state.modalOpen = false;
        ui.choiceModal.hidden = true;
        showToast("金币不够");
        updateUi();
        return;
      }
      state.coins -= cost;
      tech.apply();
      state.modalOpen = false;
      ui.choiceModal.hidden = true;
      showToast(`${tech.title} 提升`);
      updateUi();
    });
    ui.choiceGrid.appendChild(card);
  });

  ui.choiceNote.textContent = "科技是永久成长，会影响后续所有战斗";
  ui.choiceModal.hidden = false;
}

function claimTerritory() {
  if (!state.canClaim || state.gameOver || state.modalOpen) return;
  const cost = claimCost();
  if (state.coins < cost) {
    showToast("金币不够");
    return;
  }
  state.coins -= cost;
  state.territory += 1;
  state.canClaim = false;
  state.baseMaxHp += 80;
  state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 150);
  state.unitCap += state.territory % 2 === 0 ? 1 : 0;
  state.bridgeCount = state.territory >= 3 ? 2 : 1;
  burst(WORLD.width * 0.62, WORLD.height * 0.22, "#ffe28e", 22);
  showToast(`占领第 ${state.territory} 块领地`);
  updateUi();
}

function scheduleWave() {
  state.wave += 1;
  state.waveClock = 0;
  state.spawnQueue = [];
  state.canClaim = false;

  const count = Math.min(9 + Math.floor(state.wave * 1.25) + state.territory, 64);
  for (let i = 0; i < count; i += 1) {
    state.spawnQueue.push({
      at: i * rand(0.36, 0.62),
      type: pickEnemyType(state.wave),
      bridge: Math.floor(Math.random() * activeBridgeCount()),
    });
  }

  if (state.wave % 5 === 0) {
    state.spawnQueue.push({
      at: count * 0.42 + 1.2,
      type: "boss",
      bridge: Math.floor(Math.random() * activeBridgeCount()),
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
  if (wave < 3) return roll < 0.76 ? "grunt" : "runner";
  if (wave < 7) {
    if (roll < 0.46) return "grunt";
    if (roll < 0.72) return "runner";
    return "brute";
  }
  if (roll < 0.3) return "grunt";
  if (roll < 0.52) return "runner";
  if (roll < 0.78) return "brute";
  return "shield";
}

function spawnEnemy(type, bridge) {
  const meta = ENEMY_TYPES[type];
  const scale = 1 + Math.pow(state.wave, 1.1) * 0.085 + state.territory * 0.035;
  const enemy = {
    id: entityId++,
    side: "enemy",
    type,
    bridge,
    x: WORLD.width + rand(24, 76),
    y: bridgeY(bridge) + rand(-5, 5),
    hp: meta.hp * scale,
    maxHp: meta.hp * scale,
    damage: meta.damage * (1 + state.wave * 0.04 + state.territory * 0.025) * state.upgrades.enemyDamage,
    speed: meta.speed * (1 + Math.min(state.wave * 0.006, 0.45)),
    armor: meta.armor || 0,
    reward: Math.round(meta.reward * (1 + state.wave * 0.016 + state.territory * 0.025) * state.upgrades.gold),
    color: meta.color,
    cooldown: rand(0.35, 0.8),
    attackFlash: 0,
    blockedBy: null,
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
  updateUnitMovement(dt);
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
    spawnEnemy(item.type, item.bridge);
  }

  if (state.spawnQueue.length === 0 && state.enemies.length === 0) {
    state.nextWaveDelay = 2.4;
    state.canClaim = true;
    const bonus = Math.round((42 + state.wave * 7 + state.territory * 10) * state.upgrades.gold);
    state.coins += bonus;
    state.lifetimeCoins += bonus;
    addFloater(WORLD.width * 0.54, WORLD.height * 0.24, `守住 +${bonus}`, "#ffe28e");
  }
}

function updateUnitMovement(dt) {
  state.units.forEach((unit) => {
    if (unit.id === state.draggingId) return;
    const dx = unit.targetX - unit.x;
    const dy = unit.targetY - unit.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const speed = UNIT_TYPES[unit.type].moveSpeed * state.upgrades.move;
    const step = Math.min(dist, speed * dt);
    unit.x += (dx / dist) * step;
    unit.y += (dy / dist) * step;
  });
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
    const rate = meta.fireRate * state.upgrades.fireRate * (1 + (unit.level - 1) * 0.055);
    const damage = meta.damage * state.upgrades.damage * (1 + (unit.level - 1) * 0.18);
    unit.cooldown = 1 / rate;
    unit.attackFlash = 1;

    if (unit.type === "guard") {
      hitEnemy(target, damage, unit);
      return;
    }

    state.projectiles.push({
      id: entityId++,
      x: unit.x + 12,
      y: unit.y - 12,
      target,
      damage,
      speed: unit.type === "turret" ? 620 : 510,
      color: unit.type === "turret" ? "#ffe05f" : "#f8f2cd",
      splash: Math.random() < state.upgrades.splash,
    });
  });
}

function healWithMedic(unit) {
  const wounded = state.units
    .filter((ally) => ally.id !== unit.id && ally.hp < ally.maxHp && distance(unit, ally) <= 170 * state.upgrades.range)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

  if (wounded && unit.cooldown <= 0) {
    const heal = (23 + unit.level * 5) * state.upgrades.heal;
    wounded.hp = Math.min(wounded.maxHp, wounded.hp + heal);
    unit.cooldown = 0.8 / state.upgrades.fireRate;
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
      x: unit.x + 12,
      y: unit.y - 10,
      target,
      damage: (UNIT_TYPES.medic.damage + unit.level * 1.5) * state.upgrades.damage,
      speed: 450,
      color: "#9df3b4",
      splash: false,
    });
  }
}

function findTarget(unit) {
  const range = UNIT_TYPES[unit.type].range * state.upgrades.range * (1 + (unit.level - 1) * 0.035);
  return state.enemies
    .filter((enemy) => enemy.hp > 0 && enemy.x >= unit.x - 28 && distance(unit, enemy) <= range)
    .sort((a, b) => a.x - b.x)[0];
}

function updateEnemies(dt) {
  state.enemies.forEach((enemy) => {
    enemy.cooldown -= dt;
    enemy.attackFlash = Math.max(0, enemy.attackFlash - dt * 4);

    const blocker = state.units
      .filter((unit) => unit.hp > 0 && Math.abs(unit.y - enemy.y) < 42 && Math.abs(unit.x - enemy.x) < 34)
      .sort((a, b) => b.hp - a.hp)[0];

    if (blocker) {
      attackUnit(enemy, blocker);
      return;
    }

    if (enemy.x <= WORLD.baseX + 28) {
      attackBase(enemy);
      return;
    }

    const targetY = bridgeY(enemy.bridge);
    enemy.y += (targetY - enemy.y) * Math.min(1, dt * 5);
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
    const dist = Math.hypot(dx, dy);
    const travel = projectile.speed * dt;
    if (dist <= travel || dist < 8) {
      hitEnemy(target, projectile.damage, projectile);
      projectile.dead = true;
      if (projectile.splash) splashDamage(target, projectile.damage * 0.44);
      return;
    }
    projectile.x += (dx / dist) * travel;
    projectile.y += (dy / dist) * travel;
  });
  state.projectiles = state.projectiles.filter((projectile) => !projectile.dead);
}

function hitEnemy(enemy, rawDamage, source) {
  const damage = Math.max(1, rawDamage - enemy.armor);
  enemy.hp -= damage;
  enemy.attackFlash = Math.max(enemy.attackFlash, 0.45);
  burst(enemy.x, enemy.y - 8, source.color || "#f8f2cd", 4);
}

function splashDamage(origin, damage) {
  state.enemies.forEach((enemy) => {
    if (enemy.id === origin.id || enemy.hp <= 0) return;
    if (Math.abs(enemy.x - origin.x) < 66 && Math.abs(enemy.y - origin.y) < 48) {
      enemy.hp -= Math.max(1, damage - enemy.armor);
      burst(enemy.x, enemy.y, "#ffcc69", 3);
    }
  });
}

function removeDead() {
  state.units = state.units.filter((unit) => {
    if (unit.hp > 0) return true;
    if (state.selectedId === unit.id) state.selectedId = null;
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
  state.nextChoiceAt += 700;
  showChoiceCards();
}

function showChoiceCards() {
  const cards = [...UPGRADE_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  ui.choiceTitle.textContent = "请选择能力加成";
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
  ui.choiceNote.textContent = "每收集 700 金币可选择一次能力加成";
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
  ui.endStats.textContent = `占领 ${state.territory} 块领地，击败 ${state.kills} 个敌人`;
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
  ui.territory.textContent = state.territory;
  ui.wave.textContent = state.wave || 1;
  ui.base.textContent = `${Math.ceil(state.baseHp)}/${state.baseMaxHp}`;
  ui.cap.textContent = `兵力 ${currentUnitCount()}/${state.unitCap}`;
  ui.best.textContent = `最佳 ${Math.max(state.bestWave, state.wave)}`;
  ui.pauseIcon.textContent = state.paused ? "▶" : "II";
  ui.pauseBtn.setAttribute("aria-label", state.paused ? "继续" : "暂停");
  ui.speedBtn.textContent = `${state.speed}x`;

  const unit = selectedUnit();
  ui.selected.textContent = unit ? `${UNIT_TYPES[unit.type].name} Lv.${unit.level}` : "未选中";
  ui.upgradeSelectedBtn.textContent = unit ? `升级 ${selectedUpgradeCost()}` : "升级选中";
  ui.upgradeSelectedBtn.disabled = !unit || state.coins < selectedUpgradeCost() || state.modalOpen || state.gameOver;
  ui.claimBtn.textContent = state.canClaim ? `推进 ${claimCost()}` : "推进领地";
  ui.claimBtn.disabled = !state.canClaim || state.coins < claimCost() || state.modalOpen || state.gameOver;
  ui.techBtn.disabled = state.modalOpen || state.gameOver;

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
  drawMapNodes(w, h);
  drawBridges(w, h);
  drawBase(w, h);
  drawEnemyFort(w, h);
  drawEntities();
  drawProjectiles();
  drawParticles();
  drawFloaters();
  drawForeground(w, h);
}

function drawBackground(w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.34);
  sky.addColorStop(0, "#82a46c");
  sky.addColorStop(1, "#617d52");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#4f7446";
  drawHill(-30, h * 0.23, w * 0.5, 78);
  drawHill(w * 0.34, h * 0.19, w * 0.55, 92);
  drawHill(w * 0.74, h * 0.24, w * 0.34, 60);

  ctx.fillStyle = "#5d8b4a";
  ctx.fillRect(0, h * 0.25, w, h * 0.75);

  ctx.fillStyle = "rgba(57, 91, 99, 0.92)";
  roundRect(WORLD.baseX + 42, h * 0.32, w - WORLD.baseX - 86, h * 0.42, 20, true, false);
  ctx.fillStyle = "rgba(70, 112, 119, 0.75)";
  roundRect(WORLD.baseX + 54, h * 0.34, w - WORLD.baseX - 110, h * 0.38, 18, true, false);

  ctx.fillStyle = "rgba(222, 188, 102, 0.16)";
  roundRect(WORLD.deployLeft - 24, WORLD.deployTop - 28, WORLD.deployRight - WORLD.deployLeft + 48, WORLD.deployBottom - WORLD.deployTop + 56, 12, true, false);
}

function drawHill(x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.quadraticCurveTo(x + width * 0.45, y - height * 0.42, x + width, y + height);
  ctx.closePath();
  ctx.fill();
}

function drawMapNodes(w, h) {
  const count = 7;
  const startX = w * 0.18;
  const endX = w * 0.82;
  const y = h * 0.2;
  for (let i = 0; i < count; i += 1) {
    const x = startX + ((endX - startX) / (count - 1)) * i;
    if (i > 0) {
      ctx.strokeStyle = i < state.territory ? "#f0ba3e" : "rgba(32, 26, 18, 0.35)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX + ((endX - startX) / (count - 1)) * (i - 1), y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.fillStyle = i < state.territory ? "#f0ba3e" : "#8c7b58";
    ctx.beginPath();
    ctx.arc(x, y, i + 1 === state.territory ? 11 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawBridges(w) {
  WORLD.bridges.forEach((bridge, index) => {
    const active = index < activeBridgeCount();
    const x = WORLD.baseX + 44;
    const width = w - x - 78;
    ctx.fillStyle = active ? "#c99a58" : "rgba(95, 79, 55, 0.42)";
    roundRect(x, bridge.y - 21, width, 42, 8, true, false);
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 4;
    roundRect(x, bridge.y - 21, width, 42, 8, false, true);

    for (let plankX = x + 18; plankX < x + width - 10; plankX += 36) {
      ctx.strokeStyle = active ? "#73502e" : "rgba(37, 28, 20, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(plankX, bridge.y - 20);
      ctx.lineTo(plankX + 8, bridge.y + 20);
      ctx.stroke();
    }
  });
}

function drawBase(w, h) {
  const x = WORLD.baseX - 54;
  const top = h * 0.34;
  const bottom = h * 0.75;
  ctx.fillStyle = "#c69050";
  roundRect(x, top, 82, bottom - top, 8, true, false);
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 4;
  roundRect(x, top, 82, bottom - top, 8, false, true);

  ctx.fillStyle = "#8a5d32";
  for (let y = top + 18; y < bottom - 18; y += 42) {
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

  const hpWidth = 88;
  const hpPct = clamp(state.baseHp / state.baseMaxHp, 0, 1);
  ctx.fillStyle = "#231a15";
  roundRect(x - 4, top - 58, hpWidth, 14, 7, true, false);
  ctx.fillStyle = hpPct > 0.35 ? "#cf4740" : "#edb248";
  roundRect(x - 2, top - 56, (hpWidth - 4) * hpPct, 10, 5, true, false);
}

function drawEnemyFort(w, h) {
  const x = w - 52;
  const top = h * 0.32;
  const bottom = h * 0.76;
  ctx.fillStyle = "#716a52";
  roundRect(x, top, 42, bottom - top, 6, true, true);
  ctx.fillStyle = "#3c3329";
  roundRect(x + 8, top + 44, 22, bottom - top - 88, 6, true, false);
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
  const selected = state.selectedId === unit.id;
  const bob = Math.sin(state.time * 4 + unit.id) * 1.5;
  const x = unit.x;
  const y = unit.y + bob;

  if (selected) {
    ctx.strokeStyle = "rgba(255, 226, 110, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + 1, UNIT_TYPES[unit.type].range * state.upgrades.range * 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 21, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = meta.color;
  roundRect(-14, -3, 28, 26, 8, true, false);
  ctx.strokeStyle = selected ? "#ffe26e" : "#1b1713";
  ctx.lineWidth = selected ? 4 : 3;
  roundRect(-14, -3, 28, 26, 8, false, true);

  ctx.fillStyle = "#f3bd75";
  ctx.beginPath();
  ctx.arc(0, -13, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
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

  ctx.fillStyle = "#fff2c7";
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  ctx.font = "900 11px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.strokeText(String(unit.level), 0, 28);
  ctx.fillText(String(unit.level), 0, 28);
  ctx.restore();

  drawHpBar(unit.x - 22, unit.y - 43, 44, unit.hp / unit.maxHp, "#77cf8a");
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

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX || event.touches?.[0]?.clientX || 0) - rect.left,
    y: (event.clientY || event.touches?.[0]?.clientY || 0) - rect.top,
  };
}

function unitAt(x, y) {
  return [...state.units]
    .reverse()
    .find((unit) => Math.hypot(unit.x - x, unit.y - y) <= 30);
}

function handlePointerDown(event) {
  if (state.gameOver || state.modalOpen) return;
  const pos = pointerPosition(event);
  const unit = unitAt(pos.x, pos.y);
  if (!unit) {
    state.selectedId = null;
    updateUi();
    return;
  }
  state.selectedId = unit.id;
  state.draggingId = unit.id;
  state.dragOffsetX = unit.x - pos.x;
  state.dragOffsetY = unit.y - pos.y;
  canvas.setPointerCapture?.(event.pointerId);
  updateUi();
}

function handlePointerMove(event) {
  if (!state.draggingId) return;
  const unit = state.units.find((item) => item.id === state.draggingId);
  if (!unit) return;
  const pos = pointerPosition(event);
  unit.x = clampDeployX(pos.x + state.dragOffsetX);
  unit.y = clampDeployY(pos.y + state.dragOffsetY);
  unit.targetX = unit.x;
  unit.targetY = unit.y;
}

function handlePointerUp() {
  state.draggingId = null;
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
  spawnUnit("rifle", WORLD.deployLeft + 62, bridgeY(0) - 44);
  spawnUnit("guard", WORLD.deployLeft + 96, bridgeY(0) + 4);
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
  ui.upgradeSelectedBtn.addEventListener("click", upgradeSelectedUnit);
  ui.techBtn.addEventListener("click", showTechPanel);
  ui.claimBtn.addEventListener("click", claimTerritory);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);

  spawnUnit("rifle", WORLD.deployLeft + 62, bridgeY(0) - 44);
  spawnUnit("guard", WORLD.deployLeft + 96, bridgeY(0) + 4);
  updateUi();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resizeCanvas);
init();

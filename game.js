const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "endlessDefenseV3Save";

const ELEMENTS = {
  metal: { label: "金", color: "#f1d067", beats: "wood" },
  wood: { label: "木", color: "#77c66e", beats: "earth" },
  water: { label: "水", color: "#73c7e8", beats: "fire" },
  fire: { label: "火", color: "#e86847", beats: "metal" },
  earth: { label: "土", color: "#c69b62", beats: "water" },
};

const ELEMENT_ORDER = ["metal", "wood", "water", "fire", "earth"];

const ui = {
  coins: document.getElementById("coinText"),
  territory: document.getElementById("territoryText"),
  wave: document.getElementById("waveText"),
  base: document.getElementById("baseText"),
  cap: document.getElementById("capText"),
  selected: document.getElementById("selectedText"),
  gift: document.getElementById("giftText"),
  best: document.getElementById("bestText"),
  pauseBtn: document.getElementById("pauseBtn"),
  pauseIcon: document.getElementById("pauseIcon"),
  speedBtn: document.getElementById("speedBtn"),
  restartBtn: document.getElementById("restartBtn"),
  upgradeSelectedBtn: document.getElementById("upgradeSelectedBtn"),
  techBtn: document.getElementById("techBtn"),
  claimBtn: document.getElementById("claimBtn"),
  saveBtn: document.getElementById("saveBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  saveModal: document.getElementById("saveModal"),
  saveTitle: document.getElementById("saveTitle"),
  saveText: document.getElementById("saveText"),
  copySaveBtn: document.getElementById("copySaveBtn"),
  loadSaveBtn: document.getElementById("loadSaveBtn"),
  closeSaveBtn: document.getElementById("closeSaveBtn"),
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
    mage: document.getElementById("cost-mage"),
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
  paths: [],
};

const UNIT_TYPES = {
  rifle: {
    name: "金弩手",
    baseCost: 70,
    hp: 90,
    damage: 18,
    range: 250,
    fireRate: 1.12,
    moveSpeed: 168,
    element: "metal",
    color: "#d9b956",
    role: "穿甲远程",
  },
  guard: {
    name: "土盾卫",
    baseCost: 95,
    hp: 230,
    damage: 13,
    range: 50,
    fireRate: 0.74,
    moveSpeed: 132,
    element: "earth",
    color: "#a7835b",
    role: "堵桥承伤",
  },
  medic: {
    name: "木医师",
    baseCost: 125,
    hp: 86,
    damage: 5,
    range: 210,
    fireRate: 1.15,
    moveSpeed: 156,
    element: "wood",
    color: "#77b978",
    role: "治疗续航",
  },
  mage: {
    name: "水术士",
    baseCost: 150,
    hp: 78,
    damage: 11,
    range: 235,
    fireRate: 0.92,
    moveSpeed: 150,
    element: "water",
    color: "#73bfe0",
    role: "减速控场",
  },
  turret: {
    name: "火炮台",
    baseCost: 190,
    hp: 155,
    damage: 16,
    range: 285,
    fireRate: 1.55,
    moveSpeed: 72,
    element: "fire",
    color: "#d96d43",
    role: "范围爆发",
  },
};

const ENEMY_TYPES = {
  sprout: {
    name: "木藤妖",
    hp: 82,
    damage: 8,
    speed: 31,
    reward: 19,
    armor: 0,
    element: "wood",
    color: "#6cad57",
    trait: "缓慢回血",
  },
  cinder: {
    name: "火爆怪",
    hp: 66,
    damage: 10,
    speed: 41,
    reward: 24,
    armor: 0,
    element: "fire",
    color: "#d85a43",
    trait: "死亡爆裂",
  },
  tide: {
    name: "水影",
    hp: 58,
    damage: 7,
    speed: 58,
    reward: 22,
    armor: 0,
    element: "water",
    color: "#65bede",
    trait: "高速突进",
  },
  shell: {
    name: "金甲兵",
    hp: 126,
    damage: 11,
    speed: 27,
    reward: 34,
    armor: 6,
    element: "metal",
    color: "#b9b2a0",
    trait: "高护甲",
  },
  golem: {
    name: "土巨像",
    hp: 215,
    damage: 17,
    speed: 20,
    reward: 48,
    armor: 3,
    element: "earth",
    color: "#9a7856",
    trait: "高生命",
  },
  boss: {
    name: "五行首领",
    hp: 680,
    damage: 27,
    speed: 20,
    reward: 145,
    armor: 5,
    element: "fire",
    color: "#8a5ac4",
    trait: "首领",
  },
};

const BIOMES = [
  { land: "#5d8b4a", hill: "#4f7446", water: "#466f77", water2: "#527f85", path: "#c99a58" },
  { land: "#6f8549", hill: "#5c7143", water: "#3f6d78", water2: "#497c87", path: "#bfa05d" },
  { land: "#4f8764", hill: "#407356", water: "#3d697d", water2: "#49798f", path: "#c38c58" },
  { land: "#756f4a", hill: "#625d3d", water: "#4b6370", water2: "#576f7d", path: "#b88654" },
];

const TECHS = [
  {
    id: "arms",
    title: "军械科技",
    desc: "全体攻击 +12%，射程 +5%",
    cost: (level) => 190 + level * 155,
    apply: () => {
      state.tech.arms += 1;
      state.upgrades.damage *= 1.12;
      state.upgrades.range *= 1.05;
    },
  },
  {
    id: "fort",
    title: "筑城科技",
    desc: "城门上限 +170，并获得恢复",
    cost: (level) => 180 + level * 145,
    apply: () => {
      state.tech.fort += 1;
      state.baseMaxHp += 170;
      state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 230);
      state.upgrades.regen += 1.8;
    },
  },
  {
    id: "supply",
    title: "后勤科技",
    desc: "金币收益 +15%，兵力上限 +1",
    cost: (level) => 165 + level * 135,
    apply: () => {
      state.tech.supply += 1;
      state.upgrades.gold *= 1.15;
      state.unitCap += 1;
    },
  },
  {
    id: "alchemy",
    title: "五行研究",
    desc: "元素克制伤害 +10%",
    cost: (level) => 220 + level * 165,
    apply: () => {
      state.tech.alchemy += 1;
      state.upgrades.elementPower += 0.1;
    },
  },
];

const UPGRADE_POOL = [
  {
    title: "全军攻击 +8%",
    desc: "所有部队伤害永久提高",
    apply: () => {
      state.upgrades.damage *= 1.08;
    },
  },
  {
    title: "全军生命 +18%",
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
    title: "射速 +7%",
    desc: "远程与近战出手都更快",
    apply: () => {
      state.upgrades.fireRate *= 1.07;
    },
  },
  {
    title: "行军速度 +12%",
    desc: "拖动后部队归位更快",
    apply: () => {
      state.upgrades.move *= 1.12;
    },
  },
  {
    title: "敌人攻击 -4%",
    desc: "后续敌人的伤害会变低",
    apply: () => {
      state.upgrades.enemyDamage *= 0.96;
    },
  },
  {
    title: "金币收益 +15%",
    desc: "击败敌人和守波奖励更多",
    apply: () => {
      state.upgrades.gold *= 1.15;
    },
  },
  {
    title: "兵力上限 +2",
    desc: "可以同时部署更多单位",
    apply: () => {
      state.unitCap += 2;
    },
  },
  {
    title: "爆裂弹 +6%",
    desc: "远程攻击偶尔伤到周围敌人",
    apply: () => {
      state.upgrades.splash += 0.06;
    },
  },
  {
    title: "招募费用 -8%",
    desc: "所有兵种价格一起下降",
    apply: () => {
      state.upgrades.discount *= 0.92;
    },
  },
  {
    title: "治疗量 +25%",
    desc: "木医师治疗量永久提高",
    apply: () => {
      state.upgrades.heal *= 1.25;
    },
  },
];

let state;
let lastFrame = 0;
let entityId = 1;
let resizeObserver;
let saveClock = 0;

function createDefaultState() {
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
    wavesUntilGift: 3,
    coins: 280,
    lifetimeCoins: 0,
    nextChoiceAt: 900,
    choices: 0,
    kills: 0,
    baseHp: 1300,
    baseMaxHp: 1300,
    unitCap: 11,
    selectedId: null,
    draggingId: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    units: [],
    enemies: [],
    projectiles: [],
    particles: [],
    effects: [],
    floaters: [],
    bought: { rifle: 0, guard: 0, medic: 0, mage: 0, turret: 0 },
    tech: { arms: 0, fort: 0, supply: 0, alchemy: 0 },
    elementBoost: { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 },
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
      elementPower: 0,
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
  WORLD.enemyGateX = rect.width - Math.max(38, rect.width * 0.07);
  WORLD.deployLeft = WORLD.baseX + 58;
  WORLD.deployRight = rect.width - 70;
  WORLD.deployTop = rect.height * 0.25;
  WORLD.deployBottom = rect.height * 0.79;
  rebuildPaths();
}

function rebuildPaths() {
  const w = WORLD.width;
  const h = WORLD.height;
  const endX = WORLD.baseX + 32;
  const t = state?.territory || 1;
  const shift = ((t - 1) % 4) * 0.035;
  const wobble = Math.sin(t * 1.7) * 0.055;
  WORLD.paths = [
    buildPath([
      [w - 34, h * (0.32 + wobble)],
      [w * 0.84, h * (0.39 + shift)],
      [w * 0.7, h * (0.3 + wobble)],
      [w * 0.58, h * (0.5 - shift)],
      [w * 0.43, h * (0.39 + shift)],
      [w * 0.31, h * (0.55 - wobble)],
      [endX, h * (0.48 + shift * 0.5)],
    ]),
    buildPath([
      [w - 34, h * (0.72 - wobble)],
      [w * 0.83, h * (0.63 - shift)],
      [w * 0.68, h * (0.77 + wobble)],
      [w * 0.55, h * (0.59 + shift)],
      [w * 0.39, h * (0.73 - shift)],
      [w * 0.29, h * (0.57 + wobble)],
      [endX, h * (0.6 - shift * 0.4)],
    ]),
  ];
}

function buildPath(points) {
  const segments = [];
  let length = 0;
  for (let i = 1; i < points.length; i += 1) {
    const from = { x: points[i - 1][0], y: points[i - 1][1] };
    const to = { x: points[i][0], y: points[i][1] };
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    segments.push({ from, to, start: length, dist });
    length += dist;
  }
  return { points: points.map(([x, y]) => ({ x, y })), segments, length };
}

function pointOnPath(pathIndex, progress) {
  const path = WORLD.paths[pathIndex] || WORLD.paths[0];
  const s = clamp(progress, 0, path.length);
  const segment = path.segments.find((item) => s <= item.start + item.dist) || path.segments[path.segments.length - 1];
  const t = segment.dist ? (s - segment.start) / segment.dist : 1;
  return {
    x: segment.from.x + (segment.to.x - segment.from.x) * t,
    y: segment.from.y + (segment.to.y - segment.from.y) * t,
  };
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

function activePathCount() {
  return Math.min(2, state.bridgeCount);
}

function pathY(index, percent = 0.5) {
  const path = WORLD.paths[index] || WORLD.paths[0];
  return pointOnPath(index, path.length * percent).y;
}

function clampDeployX(x) {
  return clamp(x, WORLD.deployLeft, WORLD.deployRight);
}

function clampDeployY(y) {
  return clamp(y, WORLD.deployTop, WORLD.deployBottom);
}

function selectedUnit() {
  return state.units.find((unit) => unit.id === state.selectedId) || null;
}

function currentUnitCount() {
  return state.units.length;
}

function costOf(type) {
  const meta = UNIT_TYPES[type];
  const growth = Math.pow(1.13, state.bought[type] || 0);
  return Math.max(1, Math.round(meta.baseCost * growth * state.upgrades.discount));
}

function nextAbilityRequirement() {
  return Math.round(900 * Math.pow(1.42, state.choices));
}

function selectedUpgradeCost() {
  const unit = selectedUnit();
  if (!unit) return 0;
  return Math.round(95 + unit.level * 88 + Math.pow(unit.level, 1.45) * 22);
}

function claimCost() {
  return Math.round(175 + state.territory * 125);
}

function spawnUnit(type, x, y, free = false) {
  if (!free && currentUnitCount() >= state.unitCap) return null;
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
  burst(unit.x, unit.y, ELEMENTS[meta.element].color, 10);
  saveGame();
  return unit;
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
  const pathIndex = state.bought[type] % activePathCount();
  const x = WORLD.deployLeft + 55 + rand(0, 120);
  const y = pathY(pathIndex, 0.72) + rand(-48, 48);
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
  unit.maxHp *= 1.17;
  unit.hp = unit.maxHp;
  burst(unit.x, unit.y, ELEMENTS[UNIT_TYPES[unit.type].element].color, 16);
  addFloater(unit.x, unit.y - 38, `Lv.${unit.level}`, "#ffe28e");
  saveGame();
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
      <span class="choice-icon text-icon" data-label="科" aria-hidden="true"></span>
      <strong>${tech.title} Lv.${level}</strong>
      <span>${tech.desc}<br>消耗 ${cost} 金币</span>
    `;
    card.addEventListener("click", () => {
      if (state.coins < cost) {
        closeModal();
        showToast("金币不够");
        return;
      }
      state.coins -= cost;
      tech.apply();
      closeModal();
      showToast(`${tech.title} 提升`);
      saveGame();
      updateUi();
    });
    ui.choiceGrid.appendChild(card);
  });

  ui.choiceNote.textContent = "科技会永久强化部队和领地";
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
  state.baseMaxHp += 90;
  state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 170);
  if (state.territory % 2 === 0) state.unitCap += 1;
  state.bridgeCount = state.territory >= 3 ? 2 : 1;
  rebuildPaths();
  burst(WORLD.width * 0.62, WORLD.height * 0.22, "#ffe28e", 24);
  showToast(`占领第 ${state.territory} 块领地`);
  saveGame();
  updateUi();
}

function scheduleWave() {
  state.wave += 1;
  if (state.wave > 1) {
    state.wavesUntilGift -= 1;
    if (state.wavesUntilGift <= 0 && !state.modalOpen) {
      state.wavesUntilGift = 3;
      showGiftPanel();
    } else if (state.wavesUntilGift <= 0) {
      state.wavesUntilGift = 1;
    }
  }
  state.waveClock = 0;
  state.spawnQueue = [];
  state.canClaim = false;

  const count = Math.min(4 + Math.floor(state.wave * 0.95) + state.territory, 68);
  for (let i = 0; i < count; i += 1) {
    state.spawnQueue.push({
      at: i * rand(0.38, 0.68),
      type: pickEnemyType(state.wave),
      pathIndex: Math.floor(Math.random() * activePathCount()),
      elite: Math.random() < Math.min(0.08 + state.wave * 0.01, 0.28),
    });
  }

  if (state.wave % 5 === 0) {
    state.spawnQueue.push({
      at: count * 0.45 + 1.2,
      type: "boss",
      pathIndex: Math.floor(Math.random() * activePathCount()),
      elite: true,
    });
  }

  state.spawnQueue.sort((a, b) => a.at - b.at);
  ui.waveRibbon.textContent = `第 ${state.wave} 波`;
  ui.waveRibbon.classList.remove("show");
  void ui.waveRibbon.offsetWidth;
  ui.waveRibbon.classList.add("show");
  saveGame();
}

function pickEnemyType(wave) {
  const roll = Math.random();
  if (wave < 3) return roll < 0.55 ? "sprout" : "tide";
  if (wave < 7) {
    if (roll < 0.28) return "sprout";
    if (roll < 0.5) return "tide";
    if (roll < 0.72) return "cinder";
    return "shell";
  }
  if (roll < 0.2) return "sprout";
  if (roll < 0.39) return "tide";
  if (roll < 0.59) return "cinder";
  if (roll < 0.8) return "shell";
  return "golem";
}

function spawnEnemy(type, pathIndex, elite = false) {
  const meta = ENEMY_TYPES[type];
  const armyPower = Math.max(0, state.units.reduce((sum, unit) => sum + unit.level, 0) - 4) * 0.055;
  const techPower = Object.values(state.tech).reduce((sum, level) => sum + level, 0) * 0.045;
  const scale = (1 + Math.pow(state.wave, 1.14) * 0.095 + state.territory * 0.06 + armyPower + techPower) * (elite ? 2.25 : 1);
  const pos = pointOnPath(pathIndex, 0);
  const enemy = {
    id: entityId++,
    side: "enemy",
    type,
    pathIndex,
    progress: 0,
    x: pos.x,
    y: pos.y,
    hp: meta.hp * scale,
    maxHp: meta.hp * scale,
    damage: meta.damage * (1 + state.wave * 0.055 + state.territory * 0.04 + techPower) * state.upgrades.enemyDamage * (elite ? 1.35 : 1),
    speed: meta.speed * (1 + Math.min(state.wave * 0.009 + state.territory * 0.006, 0.62)),
    armor: (meta.armor || 0) + Math.floor(state.wave / 6) + (elite ? 4 : 0),
    reward: Math.round(meta.reward * (1 + state.wave * 0.016 + state.territory * 0.026) * state.upgrades.gold),
    element: type === "boss" ? ELEMENT_ORDER[state.wave % ELEMENT_ORDER.length] : meta.element,
    color: meta.color,
    cooldown: rand(0.35, 0.8),
    attackFlash: 0,
    slowTimer: 0,
    regenClock: 0,
    elite,
  };
  state.enemies.push(enemy);
}

function update(dt) {
  if (!state.running || state.paused || state.modalOpen || state.gameOver) return;

  state.time += dt;
  saveClock += dt;
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

  if (saveClock >= 2) {
    saveClock = 0;
    saveGame();
  }
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
    spawnEnemy(item.type, item.pathIndex, item.elite);
  }

  if (state.spawnQueue.length === 0 && state.enemies.length === 0) {
    state.nextWaveDelay = 2.6;
    state.canClaim = true;
    const bonus = Math.round((45 + state.wave * 8 + state.territory * 12) * state.upgrades.gold);
    state.coins += bonus;
    state.lifetimeCoins += bonus;
    addFloater(WORLD.width * 0.54, WORLD.height * 0.24, `守住 +${bonus}`, "#ffe28e");
    saveGame();
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
    const rate = meta.fireRate * state.upgrades.fireRate * (1 + (unit.level - 1) * 0.06);
    const damage = meta.damage * state.upgrades.damage * (1 + (unit.level - 1) * 0.19);
    unit.cooldown = 1 / rate;
    unit.attackFlash = 1;

    if (unit.type === "guard") {
      hitEnemy(target, damage, unit, { pierce: 0.1 });
      return;
    }

    state.projectiles.push({
      id: entityId++,
      x: unit.x + 12,
      y: unit.y - 12,
      target,
      unitType: unit.type,
      element: meta.element,
      damage,
      speed: unit.type === "turret" ? 600 : 510,
      color: ELEMENTS[meta.element].color,
      splash: unit.type === "turret" || Math.random() < state.upgrades.splash,
      slow: unit.type === "mage",
      pierce: unit.type === "rifle" ? 0.55 : 0,
    });
  });
}

function healWithMedic(unit) {
  const wounded = state.units
    .filter((ally) => ally.id !== unit.id && ally.hp < ally.maxHp && distance(unit, ally) <= 178 * state.upgrades.range)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

  if (wounded && unit.cooldown <= 0) {
    const heal = (25 + unit.level * 5.5) * state.upgrades.heal;
    wounded.hp = Math.min(wounded.maxHp, wounded.hp + heal);
    unit.cooldown = 0.78 / state.upgrades.fireRate;
    unit.attackFlash = 1;
    addFloater(wounded.x, wounded.y - 24, `+${Math.round(heal)}`, "#aaf2b0");
    burst(wounded.x, wounded.y - 14, "#aaf2b0", 6);
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
      unitType: unit.type,
      element: "wood",
      damage: (UNIT_TYPES.medic.damage + unit.level * 1.7) * state.upgrades.damage,
      speed: 460,
      color: ELEMENTS.wood.color,
      splash: false,
      slow: false,
      pierce: 0,
    });
  }
}

function findTarget(unit) {
  const meta = UNIT_TYPES[unit.type];
  const range = meta.range * state.upgrades.range * (1 + (unit.level - 1) * 0.04);
  return state.enemies
    .filter((enemy) => enemy.hp > 0 && distance(unit, enemy) <= range)
    .sort((a, b) => {
      const pathA = WORLD.paths[a.pathIndex] || WORLD.paths[0];
      const pathB = WORLD.paths[b.pathIndex] || WORLD.paths[0];
      const closeA = a.progress / pathA.length;
      const closeB = b.progress / pathB.length;
      if (Math.abs(closeB - closeA) > 0.04) return closeB - closeA;
      return distance(unit, a) - distance(unit, b);
    })[0];
}

function updateEnemies(dt) {
  state.enemies.forEach((enemy) => {
    enemy.cooldown -= dt;
    enemy.attackFlash = Math.max(0, enemy.attackFlash - dt * 4);
    enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);

    if (enemy.type === "sprout") {
      enemy.regenClock += dt;
      if (enemy.regenClock >= 1) {
        enemy.regenClock = 0;
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * 0.018);
      }
    }

    const blocker = state.units
      .filter((unit) => unit.hp > 0 && distance(unit, enemy) < (unit.type === "guard" ? 42 : 31))
      .sort((a, b) => b.hp - a.hp)[0];

    if (blocker) {
      attackUnit(enemy, blocker);
      return;
    }

    const path = WORLD.paths[enemy.pathIndex] || WORLD.paths[0];
    if (enemy.progress >= path.length - 18) {
      attackBase(enemy);
      return;
    }

    const slowFactor = enemy.slowTimer > 0 ? 0.48 : 1;
    enemy.progress += enemy.speed * slowFactor * dt;
    const pos = pointOnPath(enemy.pathIndex, enemy.progress);
    enemy.x = pos.x;
    enemy.y = pos.y;
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
    projectile.prevX = projectile.x;
    projectile.prevY = projectile.y;
    if (dist <= travel || dist < 8) {
      hitEnemy(target, projectile.damage, projectile, projectile);
      if (projectile.slow) {
        target.slowTimer = Math.max(target.slowTimer, 1.8);
        addFloater(target.x, target.y - 34, "缓速", ELEMENTS.water.color);
      }
      projectile.dead = true;
      if (projectile.splash) splashDamage(target, projectile.damage * (projectile.unitType === "turret" ? 0.55 : 0.42), projectile);
      return;
    }
    projectile.x += (dx / dist) * travel;
    projectile.y += (dy / dist) * travel;
  });
  state.projectiles = state.projectiles.filter((projectile) => !projectile.dead);
}

function elementMultiplier(attackerElement, defenderElement) {
  if (!attackerElement || !defenderElement) return 1;
  if (ELEMENTS[attackerElement].beats === defenderElement) return 1.35 + state.upgrades.elementPower;
  if (ELEMENTS[defenderElement].beats === attackerElement) return 0.76;
  return 1 + (state.elementBoost[attackerElement] || 0);
}

function hitEnemy(enemy, rawDamage, source, options = {}) {
  const attackerElement = source.element || UNIT_TYPES[source.type]?.element;
  const multiplier = elementMultiplier(attackerElement, enemy.element);
  const armor = enemy.armor * (1 - (options.pierce || 0));
  const damage = Math.max(1, rawDamage * multiplier - armor);
  enemy.hp -= damage;
  enemy.attackFlash = Math.max(enemy.attackFlash, 0.45);
  state.effects.push({
    type: "ring",
    x: enemy.x,
    y: enemy.y - 8,
    color: source.color || ELEMENTS[attackerElement]?.color || "#f8f2cd",
    life: 0.26,
    maxLife: 0.26,
    radius: multiplier > 1.2 ? 34 : 22,
  });
  addFloater(enemy.x, enemy.y - 18, `${Math.round(damage)}`, source.color || "#fff2c7");
  if (multiplier > 1.2) addFloater(enemy.x, enemy.y - 32, "克制", ELEMENTS[attackerElement].color);
  burst(enemy.x, enemy.y - 8, source.color || ELEMENTS[attackerElement]?.color || "#f8f2cd", multiplier > 1.2 ? 7 : 4);
}

function splashDamage(origin, damage, source) {
  state.enemies.forEach((enemy) => {
    if (enemy.id === origin.id || enemy.hp <= 0) return;
    if (Math.abs(enemy.x - origin.x) < 70 && Math.abs(enemy.y - origin.y) < 52) {
      hitEnemy(enemy, damage, source, { pierce: source.pierce || 0 });
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
    burst(enemy.x, enemy.y, ELEMENTS[enemy.element].color, 14);
    if (enemy.type === "cinder") explodeEnemy(enemy);
  });
  state.enemies = survivors;
}

function explodeEnemy(enemy) {
  state.units.forEach((unit) => {
    if (distance(unit, enemy) < 72) {
      unit.hp -= enemy.damage * 0.55;
      addFloater(unit.x, unit.y - 28, "爆", ELEMENTS.fire.color);
    }
  });
  burst(enemy.x, enemy.y, ELEMENTS.fire.color, 18);
}

function checkUpgradeChoice() {
  if (state.lifetimeCoins < state.nextChoiceAt || state.modalOpen || state.gameOver) return;
  state.modalOpen = true;
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
      <span class="choice-icon text-icon" data-label="${upgrade.title.slice(0, 1)}" aria-hidden="true"></span>
      <strong>${upgrade.title}</strong>
      <span>${upgrade.desc}</span>
    `;
    card.addEventListener("click", () => {
      upgrade.apply();
      state.choices += 1;
      state.nextChoiceAt = state.lifetimeCoins + nextAbilityRequirement();
      closeModal();
      showToast(upgrade.title);
      saveGame();
      updateUi();
    });
    ui.choiceGrid.appendChild(card);
  });
  ui.choiceNote.textContent = `下一次需要新增 ${nextAbilityRequirement()} 金币`;
  ui.choiceModal.hidden = false;
}

function showGiftPanel() {
  if (state.modalOpen || state.gameOver) return;
  state.modalOpen = true;
  ui.choiceTitle.textContent = "天降补给";
  ui.choiceGrid.innerHTML = "";

  const rewards = buildGiftRewards().sort(() => Math.random() - 0.5).slice(0, 3);
  rewards.forEach((reward) => {
    const card = document.createElement("button");
    card.className = "choice-card";
    card.type = "button";
    card.innerHTML = `
      <span class="choice-icon text-icon" data-label="补" aria-hidden="true"></span>
      <strong>${reward.title}</strong>
      <span>${reward.desc}</span>
    `;
    card.addEventListener("click", () => {
      reward.apply();
      closeModal();
      showToast(reward.title);
      saveGame();
      updateUi();
    });
    ui.choiceGrid.appendChild(card);
  });
  ui.choiceNote.textContent = "补给每 3 波出现一次，奖励随机";
  ui.choiceModal.hidden = false;
}

function buildGiftRewards() {
  const randomType = Object.keys(UNIT_TYPES)[Math.floor(Math.random() * Object.keys(UNIT_TYPES).length)];
  const randomElement = ELEMENT_ORDER[Math.floor(Math.random() * ELEMENT_ORDER.length)];
  return [
    {
      title: `金币补给 +${180 + state.territory * 45}`,
      desc: "直接获得一笔金币",
      apply: () => {
        const gain = 180 + state.territory * 45;
        state.coins += gain;
        state.lifetimeCoins += gain;
      },
    },
    {
      title: `免费援军：${UNIT_TYPES[randomType].name}`,
      desc: "立即获得一个随机兵种",
      apply: () => {
        const x = WORLD.deployLeft + rand(50, 160);
        const y = pathY(Math.floor(Math.random() * activePathCount()), 0.62) + rand(-44, 44);
        spawnUnit(randomType, x, y, true);
      },
    },
    {
      title: `${ELEMENTS[randomElement].label}行祝福`,
      desc: `${ELEMENTS[randomElement].label}属性伤害永久 +12%`,
      apply: () => {
        state.elementBoost[randomElement] += 0.12;
      },
    },
    {
      title: "全军整备",
      desc: "所有现有单位升 1 级并回满血",
      apply: () => {
        state.units.forEach((unit) => {
          unit.level += 1;
          unit.maxHp *= 1.08;
          unit.hp = unit.maxHp;
          burst(unit.x, unit.y, ELEMENTS[UNIT_TYPES[unit.type].element].color, 6);
        });
      },
    },
    {
      title: "城门急修",
      desc: "修复城门并提高少量上限",
      apply: () => {
        state.baseMaxHp += 80;
        state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 260);
      },
    },
  ];
}

function closeModal() {
  state.modalOpen = false;
  ui.choiceModal.hidden = true;
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
  localStorage.removeItem(SAVE_KEY);
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

  state.effects.forEach((effect) => {
    effect.life -= dt;
  });
  state.effects = state.effects.filter((effect) => effect.life > 0);

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
  ui.gift.textContent = `补给 ${state.wavesUntilGift}波`;
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
  drawPaths();
  drawBase(w, h);
  drawEnemyFort(w, h);
  drawEntities();
  drawProjectiles();
  drawEffects();
  drawParticles();
  drawFloaters();
  drawForeground(w, h);
}

function drawBackground(w, h) {
  const biome = BIOMES[(state.territory - 1) % BIOMES.length];
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.34);
  sky.addColorStop(0, "#82a46c");
  sky.addColorStop(1, "#617d52");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = biome.hill;
  drawHill(-30, h * 0.23, w * 0.5, 78);
  drawHill(w * 0.34, h * 0.19, w * 0.55, 92);
  drawHill(w * 0.74, h * 0.24, w * 0.34, 60);

  ctx.fillStyle = biome.land;
  ctx.fillRect(0, h * 0.25, w, h * 0.75);

  ctx.fillStyle = biome.water;
  roundRect(WORLD.baseX + 42, h * 0.31, w - WORLD.baseX - 86, h * 0.47, 22, true, false);
  ctx.fillStyle = biome.water2;
  roundRect(WORLD.baseX + 54, h * 0.33, w - WORLD.baseX - 110, h * 0.43, 20, true, false);

  ctx.fillStyle = "rgba(222, 188, 102, 0.16)";
  roundRect(WORLD.deployLeft - 24, WORLD.deployTop - 28, WORLD.deployRight - WORLD.deployLeft + 48, WORLD.deployBottom - WORLD.deployTop + 56, 12, true, false);
  drawBiomeDecor(w, h, (state.territory - 1) % BIOMES.length);
}

function drawBiomeDecor(w, h, biomeIndex) {
  const decor = [
    { color: "#6fb36b", accent: "#365d31" },
    { color: "#d6bd58", accent: "#6d5a29" },
    { color: "#6dd0bd", accent: "#285d62" },
    { color: "#d8794b", accent: "#683721" },
  ][biomeIndex];
  for (let i = 0; i < 9; i += 1) {
    const x = ((i * 137 + state.territory * 61) % Math.max(1, w - 140)) + 90;
    const y = h * (0.29 + ((i * 47) % 43) / 100);
    if (x > WORLD.deployLeft - 34 && x < WORLD.deployRight + 34 && y > WORLD.deployTop - 20 && y < WORLD.deployBottom + 20) continue;
    ctx.fillStyle = decor.accent;
    ctx.fillRect(x - 3, y + 8, 6, 18);
    ctx.fillStyle = decor.color;
    ctx.beginPath();
    ctx.ellipse(x, y, 15 + (i % 3) * 3, 10 + (i % 2) * 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawHill(x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.quadraticCurveTo(x + width * 0.45, y - height * 0.42, x + width, y + height);
  ctx.closePath();
  ctx.fill();
}

function drawMapNodes(w, h) {
  const count = 8;
  const startX = w * 0.17;
  const endX = w * 0.83;
  const y = h * 0.2;
  for (let i = 0; i < count; i += 1) {
    const x = startX + ((endX - startX) / (count - 1)) * i;
    if (i > 0) {
      const prevX = startX + ((endX - startX) / (count - 1)) * (i - 1);
      ctx.strokeStyle = i < state.territory ? "#f0ba3e" : "rgba(32, 26, 18, 0.35)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(prevX, y);
      ctx.lineTo(x, y + Math.sin(i) * 7);
      ctx.stroke();
    }
    ctx.fillStyle = i < state.territory ? "#f0ba3e" : "#8c7b58";
    ctx.beginPath();
    ctx.arc(x, y + Math.sin(i) * 7, i + 1 === state.territory ? 11 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawPaths() {
  WORLD.paths.forEach((path, index) => {
    const active = index < activePathCount();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = active ? BIOMES[(state.territory - 1) % BIOMES.length].path : "rgba(95, 79, 55, 0.42)";
    ctx.lineWidth = 42;
    drawPathStroke(path);
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 5;
    drawPathStroke(path);

    if (active) {
      ctx.strokeStyle = "rgba(115, 80, 46, 0.58)";
      ctx.lineWidth = 3;
      for (let s = 26; s < path.length - 20; s += 42) {
        const p = pointOnPath(index, s);
        ctx.beginPath();
        ctx.moveTo(p.x - 9, p.y - 18);
        ctx.lineTo(p.x + 9, p.y + 18);
        ctx.stroke();
      }
    }
  });
}

function drawPathStroke(path) {
  ctx.beginPath();
  path.points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
}

function drawBase(w, h) {
  const x = WORLD.baseX - 54;
  const top = h * 0.34;
  const bottom = h * 0.76;
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
  const top = h * 0.31;
  const bottom = h * 0.78;
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
  const elem = ELEMENTS[meta.element];
  const selected = state.selectedId === unit.id;
  const scale = 1 + Math.min(unit.level - 1, 8) * 0.045;
  const bob = Math.sin(state.time * 4 + unit.id) * 1.4;
  const x = unit.x;
  const y = unit.y + bob;

  if (selected) {
    ctx.strokeStyle = "rgba(255, 226, 110, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + 1, meta.range * state.upgrades.range * 0.38, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 17, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = meta.color;
  roundRect(-15, -4, 30, 28, 8, true, false);
  ctx.strokeStyle = selected ? "#ffe26e" : "#1b1713";
  ctx.lineWidth = selected ? 4 : 3;
  roundRect(-15, -4, 30, 28, 8, false, true);

  ctx.fillStyle = "#f3bd75";
  ctx.beginPath();
  ctx.arc(0, -14, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#1b1713";
  ctx.fillRect(-6, -17, 3, 7);
  ctx.fillRect(5, -17, 3, 7);
  drawUnitIdentity(unit.type, elem.color);
  drawUnitWeapon(unit.type, unit.attackFlash);

  ctx.fillStyle = elem.color;
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-16, -28, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1b1713";
  ctx.font = "900 12px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(elem.label, -16, -24);

  for (let i = 0; i < Math.min(3, unit.level - 1); i += 1) {
    ctx.fillStyle = "#ffe28e";
    ctx.beginPath();
    ctx.arc(12 + i * 7, -29, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.fillStyle = "#fff2c7";
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  ctx.font = "900 11px Microsoft YaHei, sans-serif";
  ctx.strokeText(String(unit.level), 0, 31);
  ctx.fillText(String(unit.level), 0, 31);
  ctx.restore();

  drawHpBar(unit.x - 23, unit.y - 47 - (scale - 1) * 18, 46, unit.hp / unit.maxHp, "#77cf8a");
}

function drawUnitIdentity(type, color) {
  if (type === "rifle") {
    ctx.fillStyle = "#d8c372";
    ctx.beginPath();
    ctx.moveTo(-15, -25);
    ctx.lineTo(0, -39);
    ctx.lineTo(15, -25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === "guard") {
    ctx.fillStyle = "#5e6f73";
    roundRect(-20, -2, 8, 27, 4, true, true);
  } else if (type === "medic") {
    ctx.fillStyle = "#c9f2b5";
    ctx.beginPath();
    ctx.ellipse(-13, -24, 9, 5, -0.6, 0, Math.PI * 2);
    ctx.ellipse(13, -24, 9, 5, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (type === "mage") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-16, 24);
    ctx.lineTo(0, -3);
    ctx.lineTo(16, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === "turret") {
    ctx.fillStyle = "#3a3a31";
    ctx.beginPath();
    ctx.arc(-12, 23, 7, 0, Math.PI * 2);
    ctx.arc(12, 23, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawUnitWeapon(type, flash) {
  if (type === "guard") {
    ctx.fillStyle = "#8fb0bd";
    roundRect(11, -12, 17, 32, 7, true, true);
    ctx.fillStyle = "#c69b62";
    ctx.fillRect(16, -4, 7, 18);
  } else if (type === "medic") {
    ctx.fillStyle = "#f1f1d8";
    ctx.fillRect(-13, -31, 26, 6);
    ctx.fillStyle = "#61b86a";
    ctx.fillRect(-2, -35, 4, 14);
    ctx.fillRect(-7, -30, 14, 4);
  } else if (type === "mage") {
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, 5);
    ctx.lineTo(31, -24);
    ctx.stroke();
    ctx.fillStyle = flash > 0 ? "#e2fbff" : ELEMENTS.water.color;
    ctx.beginPath();
    ctx.arc(33, -27, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (type === "turret") {
    ctx.fillStyle = "#4f4b3c";
    roundRect(5, -8, 30, 13, 4, true, true);
    ctx.fillStyle = flash > 0 ? "#ffe05f" : "#2b2924";
    roundRect(28, -10, 18, 8, 4, true, true);
  } else {
    ctx.strokeStyle = flash > 0 ? "#ffdf5b" : "#1b1713";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(34, -13);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, -7);
    ctx.lineTo(28, 5);
    ctx.stroke();
  }
}

function drawEnemy(enemy) {
  const meta = ENEMY_TYPES[enemy.type];
  const elem = ELEMENTS[enemy.element];
  const x = enemy.x;
  const y = enemy.y + Math.sin(state.time * enemy.speed * 0.06 + enemy.id) * 2;
  const scale = enemy.type === "boss" ? 1.38 : enemy.type === "golem" ? 1.22 : enemy.type === "shell" ? 1.12 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 17, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = enemy.attackFlash > 0 ? "#f07f57" : meta.color;
  roundRect(-17, -22, 34, 42, 14, true, false);
  ctx.strokeStyle = enemy.slowTimer > 0 ? ELEMENTS.water.color : "#1b1713";
  ctx.lineWidth = enemy.slowTimer > 0 ? 5 : 3;
  roundRect(-17, -22, 34, 42, 14, false, true);

  ctx.fillStyle = "#1b1713";
  ctx.fillRect(-8, -9, 4, 9);
  ctx.fillRect(5, -9, 4, 9);
  drawEnemyTrait(enemy.type);

  if (enemy.elite) {
    ctx.strokeStyle = "#ffe28e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -3, 25, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = elem.color;
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -34, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1b1713";
  ctx.font = "900 12px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(elem.label, 0, -30);
  ctx.restore();

  drawHpBar(x - 25 * scale, y - 50 * scale, 50 * scale, enemy.hp / enemy.maxHp, "#e85c4f");
}

function drawEnemyTrait(type) {
  if (type === "sprout") {
    ctx.strokeStyle = "#2d6b2f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-13, 2);
    ctx.quadraticCurveTo(-27, -7, -20, -19);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(13, 2);
    ctx.quadraticCurveTo(27, -7, 20, -19);
    ctx.stroke();
  } else if (type === "cinder") {
    ctx.fillStyle = "#ffce5a";
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.quadraticCurveTo(0, -43, 9, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === "tide") {
    ctx.strokeStyle = "#d9fbff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-2, 0, 19, Math.PI * 0.2, Math.PI * 1.1);
    ctx.stroke();
  } else if (type === "shell") {
    ctx.fillStyle = "#e2decf";
    roundRect(-19, -18, 14, 36, 5, true, true);
  } else if (type === "golem") {
    ctx.fillStyle = "#6b5038";
    ctx.fillRect(-23, 4, 10, 18);
    ctx.fillRect(13, 4, 10, 18);
  } else if (type === "boss") {
    ctx.fillStyle = "#f0ba3e";
    ctx.beginPath();
    ctx.moveTo(-19, -24);
    ctx.lineTo(-10, -42);
    ctx.lineTo(0, -24);
    ctx.lineTo(10, -42);
    ctx.lineTo(19, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawHpBar(x, y, width, pct, color) {
  ctx.fillStyle = "#1b1713";
  roundRect(x, y, width, 7, 4, true, false);
  ctx.fillStyle = color;
  roundRect(x + 1, y + 1, (width - 2) * clamp(pct, 0, 1), 5, 3, true, false);
}

function drawProjectiles() {
  state.projectiles.forEach((projectile) => {
    if (projectile.prevX !== undefined) {
      ctx.strokeStyle = projectile.color;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = projectile.splash ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(projectile.prevX, projectile.prevY);
      ctx.lineTo(projectile.x, projectile.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.splash ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawEffects() {
  state.effects.forEach((effect) => {
    const t = clamp(effect.life / effect.maxLife, 0, 1);
    ctx.globalAlpha = t;
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 5 * t;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (1.15 - t * 0.25), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
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
  return [...state.units].reverse().find((unit) => Math.hypot(unit.x - x, unit.y - y) <= 32);
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
  if (state.draggingId) saveGame();
  state.draggingId = null;
}

function saveGame() {
  if (!state || state.gameOver) return;
  const payload = {
    version: 3,
    wave: state.wave,
    bridgeCount: state.bridgeCount,
    territory: state.territory,
    canClaim: state.canClaim,
    wavesUntilGift: state.wavesUntilGift,
    coins: state.coins,
    lifetimeCoins: state.lifetimeCoins,
    nextChoiceAt: state.nextChoiceAt,
    choices: state.choices,
    kills: state.kills,
    baseHp: state.baseHp,
    baseMaxHp: state.baseMaxHp,
    unitCap: state.unitCap,
    bought: state.bought,
    tech: state.tech,
    upgrades: state.upgrades,
    elementBoost: state.elementBoost,
    bestWave: state.bestWave,
    units: state.units.map((unit) => ({
      type: unit.type,
      level: unit.level,
      x: WORLD.width ? unit.x / WORLD.width : 0.35,
      y: WORLD.height ? unit.y / WORLD.height : 0.55,
      hpRatio: unit.maxHp ? unit.hp / unit.maxHp : 1,
    })),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

function createSaveCode() {
  saveGame();
  return btoa(unescape(encodeURIComponent(localStorage.getItem(SAVE_KEY) || "")));
}

function loadSaveCode(code) {
  const raw = decodeURIComponent(escape(atob(code.trim())));
  const parsed = JSON.parse(raw);
  if (!parsed || parsed.version !== 3) throw new Error("bad save");
  localStorage.setItem(SAVE_KEY, raw);
  state = createDefaultState();
  entityId = 1;
  resizeCanvas();
  if (!loadGame() || state.units.length === 0) spawnStarterUnits();
  closeSaveModal();
  showToast("已读取导入存档");
  saveGame();
  updateUi();
}

function openExportModal() {
  ui.saveTitle.textContent = "导出存档";
  ui.saveText.value = createSaveCode();
  ui.loadSaveBtn.style.display = "none";
  ui.copySaveBtn.style.display = "";
  ui.saveModal.hidden = false;
}

function openImportModal() {
  ui.saveTitle.textContent = "导入存档";
  ui.saveText.value = "";
  ui.loadSaveBtn.style.display = "";
  ui.copySaveBtn.style.display = "none";
  ui.saveModal.hidden = false;
}

function closeSaveModal() {
  ui.saveModal.hidden = true;
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 3) return false;

    state.wave = saved.wave || 0;
    state.bridgeCount = saved.bridgeCount || 1;
    state.territory = saved.territory || 1;
    state.canClaim = !!saved.canClaim;
    state.wavesUntilGift = saved.wavesUntilGift || 3;
    state.coins = saved.coins ?? state.coins;
    state.lifetimeCoins = saved.lifetimeCoins || 0;
    state.choices = saved.choices || 0;
    state.nextChoiceAt = saved.nextChoiceAt || state.lifetimeCoins + nextAbilityRequirement();
    if (state.nextChoiceAt <= state.lifetimeCoins) {
      state.nextChoiceAt = state.lifetimeCoins + nextAbilityRequirement();
    }
    state.kills = saved.kills || 0;
    state.baseHp = saved.baseHp || state.baseHp;
    state.baseMaxHp = saved.baseMaxHp || state.baseMaxHp;
    state.unitCap = saved.unitCap || state.unitCap;
    state.bought = { ...state.bought, ...(saved.bought || {}) };
    state.tech = { ...state.tech, ...(saved.tech || {}) };
    state.upgrades = { ...state.upgrades, ...(saved.upgrades || {}) };
    state.elementBoost = { ...state.elementBoost, ...(saved.elementBoost || {}) };
    state.bestWave = Math.max(state.bestWave, saved.bestWave || 0);
    state.nextWaveDelay = 1.2;
    state.spawnQueue = [];
    state.enemies = [];

    state.units = (saved.units || [])
      .filter((unit) => UNIT_TYPES[unit.type])
      .map((unit) => {
        const meta = UNIT_TYPES[unit.type];
        const maxHp = meta.hp * state.upgrades.hp * Math.pow(1.17, Math.max(0, unit.level - 1));
        const hp = maxHp * clamp(unit.hpRatio ?? 1, 0.05, 1);
        return {
          id: entityId++,
          side: "unit",
          type: unit.type,
          level: unit.level || 1,
          x: clampDeployX((unit.x || 0.35) * WORLD.width),
          y: clampDeployY((unit.y || 0.55) * WORLD.height),
          targetX: clampDeployX((unit.x || 0.35) * WORLD.width),
          targetY: clampDeployY((unit.y || 0.55) * WORLD.height),
          hp,
          maxHp,
          cooldown: rand(0.05, 0.35),
          attackFlash: 0,
          selectedPulse: rand(0, Math.PI * 2),
        };
      });
    state.selectedId = state.units[0]?.id || null;
    return true;
  } catch {
    return false;
  }
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
  localStorage.removeItem(SAVE_KEY);
  state = createDefaultState();
  entityId = 1;
  resizeCanvas();
  ui.gameOver.hidden = true;
  ui.choiceModal.hidden = true;
  spawnStarterUnits();
  showToast("新的防线已建立");
  saveGame();
  updateUi();
}

function spawnStarterUnits() {
  spawnUnit("rifle", WORLD.deployLeft + 60, pathY(0, 0.72) - 46, true);
  spawnUnit("guard", WORLD.deployLeft + 96, pathY(0, 0.72) + 4, true);
  spawnUnit("mage", WORLD.deployLeft + 128, pathY(0, 0.72) + 50, true);
  spawnUnit("medic", WORLD.deployLeft + 82, pathY(0, 0.72) + 88, true);
}

function init() {
  state = createDefaultState();
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
  ui.saveBtn.addEventListener("click", () => {
    saveGame();
    showToast("已保存");
  });
  ui.exportBtn.addEventListener("click", openExportModal);
  ui.importBtn.addEventListener("click", openImportModal);
  ui.closeSaveBtn.addEventListener("click", closeSaveModal);
  ui.copySaveBtn.addEventListener("click", async () => {
    ui.saveText.select();
    try {
      await navigator.clipboard.writeText(ui.saveText.value);
      showToast("已复制存档码");
    } catch {
      document.execCommand("copy");
      showToast("已复制存档码");
    }
  });
  ui.loadSaveBtn.addEventListener("click", () => {
    try {
      loadSaveCode(ui.saveText.value);
    } catch {
      showToast("存档码无效");
    }
  });
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);

  if (!loadGame() || state.units.length === 0) {
    spawnStarterUnits();
    saveGame();
  } else {
    showToast("已读取存档");
  }

  updateUi();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", () => {
  const ratios = state?.units?.map((unit) => ({
    unit,
    x: WORLD.width ? unit.x / WORLD.width : 0.35,
    y: WORLD.height ? unit.y / WORLD.height : 0.55,
  })) || [];
  resizeCanvas();
  ratios.forEach(({ unit, x, y }) => {
    unit.x = clampDeployX(x * WORLD.width);
    unit.y = clampDeployY(y * WORLD.height);
    unit.targetX = unit.x;
    unit.targetY = unit.y;
  });
});

init();

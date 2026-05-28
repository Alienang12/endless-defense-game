const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "endlessDefenseV11StrategySave";

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
  techStatus: document.getElementById("techStatusText"),
  selected: document.getElementById("selectedText"),
  gift: document.getElementById("giftText"),
  best: document.getElementById("bestText"),
  version: document.getElementById("versionText"),
  power: document.getElementById("powerText"),
  enemyPower: document.getElementById("enemyPowerText"),
  formation: document.getElementById("formationText"),
  formationGrid: document.getElementById("formationGrid"),
  formationHint: document.getElementById("formationHint"),
  loadout: document.getElementById("loadoutGrid"),
  loadoutText: document.getElementById("loadoutText"),
  inventory: document.getElementById("inventoryGrid"),
  inventoryText: document.getElementById("inventoryText"),
  marketGrid: document.getElementById("marketGrid"),
  refreshMarketBtn: document.getElementById("refreshMarketBtn"),
  marketRefresh: document.getElementById("marketRefreshText"),
  chapterGrid: document.getElementById("chapterGrid"),
  chapter: document.getElementById("chapterText"),
  storyTitle: document.getElementById("storyTitle"),
  storyText: document.getElementById("storyText"),
  sideTabs: [...document.querySelectorAll("[data-tab]")],
  sidePanels: [...document.querySelectorAll("[data-panel]")],
  energy: document.getElementById("energyText"),
  weather: document.getElementById("weatherText"),
  synergy: document.getElementById("synergyText"),
  relic: document.getElementById("relicText"),
  objective: document.getElementById("objectiveText"),
  achievement: document.getElementById("achievementText"),
  tacticButtons: {
    storm: document.getElementById("stormBtn"),
    frost: document.getElementById("frostBtn"),
    rally: document.getElementById("rallyBtn"),
    mine: document.getElementById("mineBtn"),
  },
  tacticStatus: {
    storm: document.getElementById("stormStatus"),
    frost: document.getElementById("frostStatus"),
    rally: document.getElementById("rallyStatus"),
    mine: document.getElementById("mineStatus"),
  },
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
  shopButtons: [...document.querySelectorAll("[data-hero]")],
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
    name: "土守将",
    baseCost: 95,
    hp: 230,
    damage: 13,
    range: 50,
    fireRate: 0.74,
    moveSpeed: 132,
    element: "earth",
    color: "#a7835b",
    role: "城墙守护",
  },
  medic: {
    name: "木灵使",
    baseCost: 125,
    hp: 86,
    damage: 5,
    range: 210,
    fireRate: 1.15,
    moveSpeed: 156,
    element: "wood",
    color: "#77b978",
    role: "治疗复苏",
  },
  mage: {
    name: "水镜师",
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
    name: "火炮将",
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

const REGION_NAMES = [
  "旧木桥",
  "赤土渡口",
  "雾水寨",
  "金鳞关",
  "鹿角台",
  "碎石城",
  "潮声营",
  "火灯坡",
  "青藤郡",
  "玄铁桥头",
  "五行古道",
  "远山王庭",
];

const WEATHER_TYPES = [
  {
    id: "clear",
    name: "晴朗",
    desc: "双方状态稳定",
    duration: 48,
    tint: "rgba(255, 223, 144, 0.06)",
    unitDamage: 1,
    enemySpeed: 1,
    range: 1,
    energy: 1,
  },
  {
    id: "rain",
    name: "雨幕",
    desc: "水系缓速更久，火炮略弱",
    duration: 54,
    tint: "rgba(89, 157, 190, 0.14)",
    unitDamage: 0.97,
    fireDamage: 0.88,
    waterSlow: 1.35,
    enemySpeed: 0.94,
    range: 1,
    energy: 1.05,
  },
  {
    id: "wind",
    name: "疾风",
    desc: "弹道更快，敌人也更快",
    duration: 44,
    tint: "rgba(188, 230, 194, 0.1)",
    projectileSpeed: 1.2,
    enemySpeed: 1.12,
    range: 1.04,
    energy: 1.08,
  },
  {
    id: "fog",
    name: "薄雾",
    desc: "视野变短，精英护盾变厚",
    duration: 50,
    tint: "rgba(221, 232, 214, 0.16)",
    unitDamage: 1.02,
    enemyShield: 1.25,
    enemySpeed: 0.98,
    range: 0.88,
    energy: 1,
  },
  {
    id: "drought",
    name: "燥热",
    desc: "火系更强，治疗略弱",
    duration: 46,
    tint: "rgba(224, 116, 64, 0.1)",
    fireDamage: 1.22,
    heal: 0.88,
    enemySpeed: 1.04,
    range: 1,
    energy: 0.96,
  },
  {
    id: "storm",
    name: "雷云",
    desc: "能量恢复加快，精英更频繁",
    duration: 42,
    tint: "rgba(111, 101, 180, 0.13)",
    stormDamage: 1.28,
    eliteChance: 0.08,
    enemySpeed: 1.03,
    range: 1,
    energy: 1.32,
  },
];

const TACTICS = {
  storm: {
    name: "雷令",
    desc: "轰击全场敌人，对精英额外伤害",
    cost: 30,
    cooldown: 16,
    color: "#f1d067",
  },
  frost: {
    name: "霜阵",
    desc: "冻结并削弱桥上敌人",
    cost: 24,
    cooldown: 18,
    color: "#73c7e8",
  },
  rally: {
    name: "战鼓",
    desc: "治疗全军并短时提高射速",
    cost: 22,
    cooldown: 22,
    color: "#77c66e",
  },
  mine: {
    name: "火雷",
    desc: "在桥上布置连环火雷",
    cost: 26,
    cooldown: 20,
    color: "#e86847",
  },
};

const FORMATIONS = [
  {
    id: "loose",
    name: "散阵",
    recipe: {},
    desc: "无门槛，保持均衡。",
    bonus: { damage: 0.03, range: 0.03 },
    counter: "无",
  },
  {
    id: "five_circuit",
    name: "五行轮",
    recipe: { metal: 1, wood: 1, water: 1, fire: 1, earth: 1 },
    desc: "五行齐备，克制伤害和金币收益提高。",
    bonus: { damage: 0.12, elementPower: 0.18, gold: 0.12 },
    counter: "混合首领",
  },
  {
    id: "fire_arrow",
    name: "赤金破军",
    recipe: { fire: 2, metal: 2 },
    desc: "火与金集中输出，适合打高甲高血目标。",
    bonus: { damage: 0.2, pierce: 0.16, bossDamage: 0.12 },
    counter: "金甲、土巨像、首领",
  },
  {
    id: "water_wall",
    name: "水土锁桥",
    recipe: { water: 2, earth: 2 },
    desc: "拖慢敌人并提高城门防护。",
    bonus: { slowPower: 0.32, baseReduce: 0.18, guardBlock: 0.18 },
    counter: "快攻、迅捷精英",
  },
  {
    id: "green_camp",
    name: "青木营",
    recipe: { wood: 2, earth: 1, water: 1 },
    desc: "治疗和续航更强，适合消耗战。",
    bonus: { heal: 0.42, hp: 0.14, regen: 1.6 },
    counter: "毒、爆裂、长线首领",
  },
  {
    id: "ember_net",
    name: "烈焰网",
    recipe: { fire: 3, wood: 1 },
    desc: "范围和灼烧更强，但防御偏弱。",
    bonus: { fireDamage: 0.28, splash: 0.12, mineRadius: 0.14 },
    counter: "群行、分裂怪",
  },
  {
    id: "cold_star",
    name: "寒星阵",
    recipe: { water: 2, metal: 2, wood: 1 },
    desc: "远程控场，优先处理精英。",
    bonus: { range: 0.16, eliteFocus: 1, waterRoot: 0.08 },
    counter: "精英潮",
  },
  {
    id: "earth_crown",
    name: "厚土王冠",
    recipe: { earth: 3, metal: 1 },
    desc: "防守最稳，适合扛高战力精英波。",
    bonus: { baseReduce: 0.24, hp: 0.18, waveShield: 120 },
    counter: "高攻首领",
  },
];

const MARKET_ITEMS = [
  {
    id: "relic_map",
    name: "遗物地图",
    type: "永久",
    desc: "立刻获得一次遗物选择",
    baseCost: 1250,
    apply: () => {
      state.queuedRelicChoices += 1;
    },
  },
  {
    id: "training_manual",
    name: "兵书残页",
    type: "永久",
    desc: "最低等级的 2 个单位升 1 级",
    baseCost: 780,
    apply: () => {
      [...state.units]
        .sort((a, b) => a.level - b.level)
        .slice(0, 2)
        .forEach((unit) => {
          unit.level += 1;
          unit.maxHp *= 1.13;
          unit.hp = unit.maxHp;
          burst(unit.x, unit.y, ELEMENTS[UNIT_TYPES[unit.type].element].color, 10);
        });
    },
  },
  {
    id: "smoke_bomb",
    name: "烟幕弹",
    type: "一次性",
    desc: "全场敌人缓速 5 秒",
    baseCost: 420,
    apply: () => {
      state.enemies.forEach((enemy) => {
        enemy.slowTimer = Math.max(enemy.slowTimer, 5);
      });
    },
  },
  {
    id: "forge_ticket",
    name: "锻造券",
    type: "永久",
    desc: "当前选中单位升 2 级",
    baseCost: 980,
    apply: () => {
      const unit = selectedUnit() || state.units[0];
      if (!unit) return;
      for (let i = 0; i < 2; i += 1) {
        unit.level += 1;
        unit.maxHp *= 1.15;
      }
      unit.hp = unit.maxHp;
      state.selectedId = unit.id;
    },
  },
  {
    id: "gate_core",
    name: "城门芯",
    type: "永久",
    desc: "城门上限 +450，并立即修复",
    baseCost: 1100,
    apply: () => {
      state.baseMaxHp += 450;
      state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 700);
    },
  },
  {
    id: "summon_contract",
    name: "精兵契",
    type: "永久",
    desc: "获得 1 个随机 5 级精兵",
    baseCost: 1350,
    apply: () => {
      const type = Object.keys(UNIT_TYPES)[Math.floor(Math.random() * Object.keys(UNIT_TYPES).length)];
      const unit = spawnUnit(type, WORLD.deployLeft + rand(60, 180), pathY(0, 0.6) + rand(-55, 55), true);
      if (!unit) return;
      while (unit.level < 5) {
        unit.level += 1;
        unit.maxHp *= 1.15;
      }
      unit.hp = unit.maxHp;
    },
  },
  {
    id: "five_dust",
    name: "五行粉",
    type: "永久",
    desc: "当前阵法加成提高 10%",
    baseCost: 1600,
    apply: () => {
      state.formationMastery += 0.1;
    },
  },
  {
    id: "trap_crate",
    name: "火雷箱",
    type: "一次性",
    desc: "桥上布置 7 个火雷",
    baseCost: 540,
    apply: () => {
      placeMines(7);
    },
  },
  {
    id: "scout_horn",
    name: "斥候号",
    type: "一次性",
    desc: "下一波敌军战力 -18%",
    baseCost: 680,
    apply: () => {
      state.nextWavePowerMod *= 0.82;
    },
  },
  {
    id: "boss_bait",
    name: "诱王香",
    type: "冒险",
    desc: "下一波加入首领，但首领奖励翻倍",
    baseCost: 900,
    apply: () => {
      state.forceBoss += 1;
      state.nextBossReward *= 2;
    },
  },
];

const HERO_TYPES = ["rifle", "guard", "medic", "mage", "turret"];

const CORE_GEAR = [
  {
    id: "storm_crown",
    name: "雷暴冠",
    rank: "史诗",
    slot: "attack",
    desc: "适合高血Boss：装备者单体伤害 +75%，命中精英会落雷。",
    stats: { singleDamage: 0.75, eliteLightning: 1 },
  },
  {
    id: "tide_chain",
    name: "潮汐锁链",
    rank: "稀有",
    slot: "control",
    desc: "适合快怪关：装备者攻击会强缓速，水系额外冰封。",
    stats: { slowPower: 0.95, waterRoot: 0.18 },
  },
  {
    id: "ember_orb",
    name: "赤焰珠",
    rank: "稀有",
    slot: "aoe",
    desc: "适合群怪关：范围伤害 +65%，火场持续更久。",
    stats: { splashDamage: 0.65, mineFireField: 1, fireDamage: 0.28 },
  },
  {
    id: "earth_heart",
    name: "厚土心",
    rank: "史诗",
    slot: "defense",
    desc: "适合高攻关：城门承伤 -35%，土系英雄阻挡翻倍。",
    stats: { baseDamageReduce: 0.35, guardBlock: 1.0, hp: 0.35 },
  },
  {
    id: "green_bell",
    name: "青木铃",
    rank: "稀有",
    slot: "support",
    desc: "适合消耗关：治疗 +120%，濒死英雄会被拉回一次。",
    stats: { heal: 1.2, deathSave: 0.35 },
  },
  {
    id: "golden_needle",
    name: "金针",
    rank: "普通",
    slot: "attack",
    desc: "适合护甲关：穿甲 +45%，金系暴击 +25%。",
    stats: { pierce: 0.45, metalCrit: 0.25 },
  },
  {
    id: "mirror_shell",
    name: "镜壳",
    rank: "稀有",
    slot: "defense",
    desc: "适合远程Boss：每波给城门厚护盾，并反震首领。",
    stats: { waveShield: 550, bossDamageTaken: 0.2 },
  },
  {
    id: "wind_boots",
    name: "疾风靴",
    rank: "普通",
    slot: "speed",
    desc: "适合多线关：射速 +45%，弹道速度 +60%。",
    stats: { fireRate: 0.45, projectileSpeed: 0.6 },
  },
  {
    id: "black_salt_big",
    name: "黑盐罐",
    rank: "稀有",
    slot: "curse",
    desc: "适合厚甲精英：敌军护甲 -18，精英护甲额外 -35。",
    stats: { armorBreak: 18, eliteArmorBreak: 35 },
  },
  {
    id: "five_flag",
    name: "五色令旗",
    rank: "史诗",
    slot: "formation",
    desc: "适合阵法关：当前阵法效果 +80%，五行克制伤害 +35%。",
    stats: { formationMastery: 0.8, elementPower: 0.35 },
  },
  {
    id: "hunter_mark",
    name: "猎王印",
    rank: "史诗",
    slot: "boss",
    desc: "适合首领关：Boss 承伤 +55%，首领阶段护盾减半。",
    stats: { bossDamageTaken: 0.55, bossShieldCut: 0.5 },
  },
  {
    id: "thorn_seed",
    name: "荆棘种",
    rank: "普通",
    slot: "control",
    desc: "适合小怪潮：敌人靠近城门时被缠绕，木系触发更强。",
    stats: { bridgeSlow: 0.28, slowDamageTaken: 0.22 },
  },
  {
    id: "sun_core",
    name: "日核",
    rank: "史诗",
    slot: "aoe",
    desc: "适合最终波：全队伤害 +35%，但敌军也会更早出精英。",
    stats: { damage: 0.35, eliteChance: 0.08 },
  },
  {
    id: "moon_well_big",
    name: "大月井",
    rank: "稀有",
    slot: "energy",
    desc: "适合技能关：能量上限 +80，每波开始恢复 55 能量。",
    stats: { maxEnergy: 80, waveEnergy: 55 },
  },
  {
    id: "siege_manual",
    name: "破城书",
    rank: "普通",
    slot: "boss",
    desc: "适合城墙关：对有护盾敌人伤害 +70%。",
    stats: { shieldDamage: 0.7 },
  },
];

const STORY_CHAPTERS = [
  {
    id: "border_bridge",
    name: "旧木桥",
    title: "边境守线",
    desc: "敌军只是试探，但会很快根据你的防线调整强度。",
    requiredTerritory: 1,
    enemyElements: ["wood", "water"],
    boss: "五行先锋",
    biome: 0,
    reward: { coins: 0 },
  },
  {
    id: "red_ford",
    name: "赤土渡",
    title: "赤土渡口",
    desc: "火爆怪更多，适合尝试水土锁桥或寒星阵。",
    requiredTerritory: 2,
    enemyElements: ["fire", "earth"],
    boss: "赤土督军",
    biome: 3,
    reward: { coins: 300 },
  },
  {
    id: "mist_camp",
    name: "雾水寨",
    title: "雾水寨",
    desc: "水影和薄雾会扰乱射程，需要阵法和斥候道具配合。",
    requiredTerritory: 3,
    enemyElements: ["water", "metal"],
    boss: "雾水镜主",
    biome: 2,
    reward: { energy: 40 },
  },
  {
    id: "golden_pass",
    name: "金鳞关",
    title: "金鳞关",
    desc: "高甲敌军登场，赤金破军和穿甲道具更有价值。",
    requiredTerritory: 5,
    enemyElements: ["metal", "earth"],
    boss: "金鳞甲首",
    biome: 1,
    reward: { relic: 1 },
  },
  {
    id: "five_altar",
    name: "五行坛",
    title: "五行古坛",
    desc: "混合属性首领反复切换弱点，五行轮开始真正发挥价值。",
    requiredTerritory: 8,
    enemyElements: ["metal", "wood", "water", "fire", "earth"],
    boss: "五行坛主",
    biome: 0,
    reward: { relic: 1, coins: 1000 },
  },
];

const RELIC_POOL = [
  {
    id: "thunder_drum",
    name: "雷鼓",
    rank: "稀有",
    desc: "雷令伤害 +35%，击中精英返还 8 能量",
    stats: { stormDamage: 0.35, eliteEnergyRefund: 8 },
  },
  {
    id: "frost_lens",
    name: "霜镜",
    rank: "稀有",
    desc: "霜阵持续 +45%，水术士攻击有小概率冰封",
    stats: { frostDuration: 0.45, waterRoot: 0.08 },
  },
  {
    id: "war_banner",
    name: "破阵旗",
    rank: "史诗",
    desc: "战鼓持续 +4 秒，全军攻击 +8%",
    stats: { rallyDuration: 4, damage: 0.08 },
  },
  {
    id: "iron_seeds",
    name: "铁蒺藜",
    rank: "稀有",
    desc: "火雷数量 +2，爆炸范围 +18%",
    stats: { mineCount: 2, mineRadius: 0.18 },
  },
  {
    id: "golden_tax",
    name: "金印税契",
    rank: "普通",
    desc: "金币收益 +18%，但精英出现率略增",
    stats: { gold: 0.18, eliteChance: 0.025 },
  },
  {
    id: "wooden_heart",
    name: "木灵心",
    rank: "普通",
    desc: "治疗 +22%，城门每秒缓慢恢复",
    stats: { heal: 0.22, baseRegen: 1.2 },
  },
  {
    id: "water_chain",
    name: "锁水链",
    rank: "普通",
    desc: "所有缓速效果 +25%，被缓速敌人承伤 +6%",
    stats: { slowPower: 0.25, slowDamageTaken: 0.06 },
  },
  {
    id: "fire_core",
    name: "熔火芯",
    rank: "稀有",
    desc: "火系伤害 +28%，火炮命中留下灼烧",
    stats: { fireDamage: 0.28, burnChance: 0.28 },
  },
  {
    id: "earth_gate",
    name: "土门钉",
    rank: "稀有",
    desc: "城门上限 +12%，土盾卫阻挡范围更大",
    stats: { baseMaxPct: 0.12, guardBlock: 0.22 },
  },
  {
    id: "metal_file",
    name: "金错刀",
    rank: "普通",
    desc: "穿甲 +12%，金弩手暴击率 +8%",
    stats: { pierce: 0.12, metalCrit: 0.08 },
  },
  {
    id: "star_map",
    name: "星图",
    rank: "史诗",
    desc: "每次推进领地后获得一个遗物选择",
    stats: { relicOnClaim: 1 },
  },
  {
    id: "merchant_pack",
    name: "行商背篓",
    rank: "普通",
    desc: "招募费用 -12%，补给金币奖励 +25%",
    stats: { discount: 0.12, giftGold: 0.25 },
  },
  {
    id: "old_contract",
    name: "旧军契",
    rank: "稀有",
    desc: "兵力上限 +3，免费援军更容易出现高级兵",
    stats: { unitCap: 3, freeUnitLevel: 1 },
  },
  {
    id: "rage_seal",
    name: "怒印",
    rank: "稀有",
    desc: "敌人进入城门附近时，全军射速 +18%",
    stats: { dangerFireRate: 0.18 },
  },
  {
    id: "quiet_bell",
    name: "静铃",
    rank: "普通",
    desc: "每波开始获得护盾，薄雾天气不再降低射程",
    stats: { waveShield: 80, ignoreFogRange: 1 },
  },
  {
    id: "blood_coin",
    name: "血钱",
    rank: "史诗",
    desc: "击杀精英额外金币 +55%，但精英攻击 +10%",
    stats: { eliteGold: 0.55, eliteDamage: 0.1 },
  },
  {
    id: "five_scroll",
    name: "五行残卷",
    rank: "史诗",
    desc: "五行阵效果翻倍，元素克制伤害 +10%",
    stats: { fiveSynergy: 1, elementPower: 0.1 },
  },
  {
    id: "bridge_anchor",
    name: "镇桥锚",
    rank: "稀有",
    desc: "桥上敌人速度 -8%，每座桥首次被突破时眩晕敌人",
    stats: { bridgeSlow: 0.08, bridgeStun: 1 },
  },
  {
    id: "eagle_eye",
    name: "鹰眼符",
    rank: "普通",
    desc: "射程 +12%，远程优先攻击精英",
    stats: { range: 0.12, eliteFocus: 1 },
  },
  {
    id: "amber_soup",
    name: "琥珀汤",
    rank: "普通",
    desc: "单位生命 +16%，补给治疗效果 +30%",
    stats: { hp: 0.16, giftHeal: 0.3 },
  },
  {
    id: "needle_tower",
    name: "针塔图纸",
    rank: "稀有",
    desc: "火炮台射速 +16%，火雷触发后留下一片火场",
    stats: { turretRate: 0.16, mineFireField: 1 },
  },
  {
    id: "river_oath",
    name: "河誓",
    rank: "稀有",
    desc: "雨幕天气持续更久，水系伤害 +18%",
    stats: { rainDuration: 0.35, waterDamage: 0.18 },
  },
  {
    id: "forge_stamp",
    name: "铸印",
    rank: "普通",
    desc: "升级选中费用 -10%，每升 5 级额外回血",
    stats: { upgradeDiscount: 0.1, levelHeal: 0.18 },
  },
  {
    id: "spirit_lamp",
    name: "魂灯",
    rank: "史诗",
    desc: "死亡单位有 25% 概率保留 1 血并眩晕周围敌人",
    stats: { deathSave: 0.25 },
  },
  {
    id: "storm_vane",
    name: "风雷标",
    rank: "稀有",
    desc: "疾风天气弹道更快，雷云天气能量恢复再 +20%",
    stats: { windProjectile: 0.25, stormEnergy: 0.2 },
  },
  {
    id: "lion_seal",
    name: "狮钮印",
    rank: "普通",
    desc: "Boss 受到伤害 +12%，首领奖励金币 +30%",
    stats: { bossDamageTaken: 0.12, bossGold: 0.3 },
  },
  {
    id: "mud_wall",
    name: "泥墙术",
    rank: "普通",
    desc: "城门受到伤害 -10%，土系单位生命 +18%",
    stats: { baseDamageReduce: 0.1, earthHp: 0.18 },
  },
  {
    id: "foxfire",
    name: "狐火瓶",
    rank: "稀有",
    desc: "攻击有 6% 概率弹射一次，火系弹射概率翻倍",
    stats: { chainChance: 0.06, fireChainBonus: 0.06 },
  },
  {
    id: "green_contract",
    name: "青契",
    rank: "普通",
    desc: "每 4 波随机一个最低等级单位升 1 级",
    stats: { periodicLevel: 4 },
  },
  {
    id: "black_salt",
    name: "黑盐",
    rank: "稀有",
    desc: "敌人护甲 -2，精英护甲额外 -5",
    stats: { armorBreak: 2, eliteArmorBreak: 5 },
  },
  {
    id: "moon_well",
    name: "月井",
    rank: "史诗",
    desc: "能量上限 +35，每波开始恢复 20 能量",
    stats: { maxEnergy: 35, waveEnergy: 20 },
  },
  {
    id: "banner_shop",
    name: "旗亭",
    rank: "普通",
    desc: "推进领地费用 -18%，推进后全军回血",
    stats: { claimDiscount: 0.18, claimHeal: 0.35 },
  },
];

const ENEMY_AFFIXES = [
  {
    id: "shielded",
    name: "盾",
    desc: "生成护盾",
    color: "#9ed0d2",
  },
  {
    id: "haste",
    name: "迅",
    desc: "速度更快",
    color: "#f0ba3e",
  },
  {
    id: "vampire",
    name: "噬",
    desc: "攻击回血",
    color: "#d94e3f",
  },
  {
    id: "split",
    name: "裂",
    desc: "死亡分裂",
    color: "#b66ad7",
  },
  {
    id: "venom",
    name: "毒",
    desc: "攻击带毒",
    color: "#77c66e",
  },
  {
    id: "tax",
    name: "赏",
    desc: "奖励更多金币",
    color: "#f1d067",
  },
];

const SCENARIO_EVENTS = [
  {
    id: "merchant",
    title: "桥边行商",
    note: "一个行商愿意把库存压给你，但他要现金。",
    choices: [
      { title: "买下火雷箱", desc: "花费金币，立刻布置 5 个火雷", effect: "buyMines" },
      { title: "赊账招募", desc: "获得随机援军，但下一波敌人更强", effect: "debtUnit" },
      { title: "只买干粮", desc: "城门恢复并获得少量能量", effect: "food" },
    ],
  },
  {
    id: "ancient_shrine",
    title: "五行小庙",
    note: "庙里有五个暗格，只能打开一个。",
    choices: [
      { title: "取金", desc: "金系单位暴击提高", effect: "metalBlessing" },
      { title: "取水", desc: "水系缓速加强", effect: "waterBlessing" },
      { title: "取土", desc: "城门和土盾卫变硬", effect: "earthBlessing" },
    ],
  },
  {
    id: "broken_bridge",
    title: "断桥残阵",
    note: "老桥面下埋着古旧阵纹。",
    choices: [
      { title: "修桥", desc: "推进费用下降，敌人路径变长", effect: "repairBridge" },
      { title: "拆桥", desc: "下一波敌人减少，但获得金币更少", effect: "breakBridge" },
      { title: "埋伏", desc: "下一波首批敌人被火雷迎接", effect: "ambush" },
    ],
  },
  {
    id: "refugees",
    title: "逃难工匠",
    note: "工匠们请求入城，他们能修东西，也会消耗粮草。",
    choices: [
      { title: "收留", desc: "城门上限提高，招募费用短时上升", effect: "takeCraftsmen" },
      { title: "编入军中", desc: "获得两个低级援军", effect: "militia" },
      { title: "护送离开", desc: "获得大量能量", effect: "escort" },
    ],
  },
  {
    id: "strange_fog",
    title: "夜雾鼓声",
    note: "雾里传来鼓声，敌我都被影响。",
    choices: [
      { title: "点燃烽火", desc: "驱散薄雾并强化火系", effect: "beacon" },
      { title: "听声辨位", desc: "射程提高，但下一波精英更多", effect: "listen" },
      { title: "静守", desc: "立刻获得一个防御遗物选择", effect: "defRelic" },
    ],
  },
  {
    id: "mine_vein",
    title: "浅金矿脉",
    note: "山脚露出矿脉，开采会惊动地底巨像。",
    choices: [
      { title: "开采", desc: "获得金币，下一波加入土巨像", effect: "mineGold" },
      { title: "封矿", desc: "敌人护甲降低", effect: "sealMine" },
      { title: "铸箭", desc: "金弩手伤害提升", effect: "forgeArrows" },
    ],
  },
];

const WAVE_MUTATORS = [
  {
    id: "none",
    name: "平潮",
    desc: "这一段没有额外异变",
    enemyHp: 1,
    enemySpeed: 1,
    eliteChance: 0,
    reward: 1,
  },
  {
    id: "iron_skin",
    name: "铁皮潮",
    desc: "敌人护甲和生命提高，奖励略增",
    enemyHp: 1.24,
    armor: 4,
    eliteChance: 0.03,
    reward: 1.12,
  },
  {
    id: "fast_feet",
    name: "急行潮",
    desc: "敌人速度大幅提高，但生命较低",
    enemyHp: 0.9,
    enemySpeed: 1.26,
    eliteChance: 0.04,
    reward: 1.08,
  },
  {
    id: "rich_wave",
    name: "财宝潮",
    desc: "敌人携带更多金币，也更容易出现精英",
    enemyHp: 1.08,
    enemySpeed: 1,
    eliteChance: 0.12,
    reward: 1.45,
  },
  {
    id: "mist_blades",
    name: "雾刃潮",
    desc: "敌人攻击提高，薄雾时额外加速",
    enemyHp: 1.05,
    enemyDamage: 1.22,
    fogSpeed: 1.15,
    reward: 1.1,
  },
  {
    id: "shield_line",
    name: "盾线潮",
    desc: "精英更常带盾，Boss 护盾也更厚",
    enemyHp: 1.14,
    shieldBonus: 0.16,
    eliteChance: 0.1,
    reward: 1.16,
  },
  {
    id: "ember_rush",
    name: "余烬潮",
    desc: "火爆怪更多，死亡爆炸更疼",
    enemyHp: 1.02,
    cinderBias: 0.22,
    explosion: 1.35,
    reward: 1.12,
  },
  {
    id: "golem_march",
    name: "巨像行军",
    desc: "土巨像更多，敌人速度变慢但非常厚",
    enemyHp: 1.34,
    enemySpeed: 0.88,
    golemBias: 0.24,
    reward: 1.22,
  },
  {
    id: "low_tide",
    name: "退潮",
    desc: "这一段敌人较少，但下一次首领更强",
    enemyHp: 0.86,
    enemySpeed: 0.92,
    eliteChance: -0.04,
    bossHp: 1.35,
    reward: 0.92,
  },
  {
    id: "blood_moon",
    name: "血月",
    desc: "敌人全面加强，击败后奖励明显提高",
    enemyHp: 1.3,
    enemyDamage: 1.2,
    eliteChance: 0.13,
    reward: 1.5,
  },
  {
    id: "wood_plague",
    name: "藤疫",
    desc: "木藤妖更多，敌人回血更强",
    enemyHp: 1.12,
    sproutBias: 0.28,
    regen: 1.8,
    reward: 1.16,
  },
  {
    id: "water_mirrors",
    name: "水镜",
    desc: "水影更多，雨幕时速度变化更剧烈",
    enemyHp: 0.96,
    tideBias: 0.3,
    rainSpeed: 1.18,
    reward: 1.1,
  },
  {
    id: "commanders",
    name: "统领巡桥",
    desc: "精英数量提高，普通敌人略少",
    enemyHp: 1.15,
    count: 0.88,
    eliteChance: 0.18,
    reward: 1.22,
  },
  {
    id: "thin_line",
    name: "细线",
    desc: "敌人数量少，但单个敌人更强",
    enemyHp: 1.52,
    enemyDamage: 1.12,
    count: 0.68,
    reward: 1.25,
  },
  {
    id: "swarm_line",
    name: "群行",
    desc: "敌人数量变多，单体略弱",
    enemyHp: 0.82,
    enemyDamage: 0.92,
    count: 1.42,
    reward: 1.06,
  },
  {
    id: "storm_call",
    name: "唤雷",
    desc: "雷云更常出现，精英更容易带迅捷",
    enemyHp: 1.08,
    forceWeather: "storm",
    hasteBias: 0.2,
    reward: 1.14,
  },
];

const ACHIEVEMENTS = [
  {
    id: "first_blood",
    title: "首胜",
    desc: "击败第一个敌人",
    type: "kills",
    target: 1,
    reward: { coins: 80 },
  },
  {
    id: "ten_kills",
    title: "十斩",
    desc: "累计击败 10 个敌人",
    type: "kills",
    target: 10,
    reward: { energy: 25 },
  },
  {
    id: "fifty_kills",
    title: "破阵五十",
    desc: "累计击败 50 个敌人",
    type: "kills",
    target: 50,
    reward: { coins: 260 },
  },
  {
    id: "hundred_kills",
    title: "百战不退",
    desc: "累计击败 100 个敌人",
    type: "kills",
    target: 100,
    reward: { relic: 1 },
  },
  {
    id: "wave_three",
    title: "首领照面",
    desc: "抵达第 3 波",
    type: "wave",
    target: 3,
    reward: { energy: 30 },
  },
  {
    id: "wave_ten",
    title: "十波守望",
    desc: "抵达第 10 波",
    type: "wave",
    target: 10,
    reward: { coins: 400 },
  },
  {
    id: "wave_twenty",
    title: "长夜二十",
    desc: "抵达第 20 波",
    type: "wave",
    target: 20,
    reward: { relic: 1 },
  },
  {
    id: "first_relic",
    title: "第一件遗物",
    desc: "获得 1 件遗物",
    type: "relics",
    target: 1,
    reward: { energy: 35 },
  },
  {
    id: "five_relics",
    title: "小小宝库",
    desc: "获得 5 件遗物",
    type: "relics",
    target: 5,
    reward: { coins: 650 },
  },
  {
    id: "ten_relics",
    title: "秘藏成形",
    desc: "获得 10 件遗物",
    type: "relics",
    target: 10,
    reward: { relic: 1 },
  },
  {
    id: "territory_two",
    title: "越过旧桥",
    desc: "占领 2 块领地",
    type: "territory",
    target: 2,
    reward: { coins: 240 },
  },
  {
    id: "territory_five",
    title: "五地连营",
    desc: "占领 5 块领地",
    type: "territory",
    target: 5,
    reward: { relic: 1 },
  },
  {
    id: "tech_five",
    title: "小成科技",
    desc: "综合科技达到 5 级",
    type: "tech",
    target: 5,
    reward: { energy: 60 },
  },
  {
    id: "tech_ten",
    title: "机关成群",
    desc: "综合科技达到 10 级",
    type: "tech",
    target: 10,
    reward: { coins: 800 },
  },
  {
    id: "unit_ten",
    title: "十级精兵",
    desc: "拥有一个 10 级单位",
    type: "highestUnit",
    target: 10,
    reward: { energy: 50 },
  },
  {
    id: "unit_twenty",
    title: "二十级王牌",
    desc: "拥有一个 20 级单位",
    type: "highestUnit",
    target: 20,
    reward: { relic: 1 },
  },
  {
    id: "full_team",
    title: "满编防线",
    desc: "单位数量达到当前上限",
    type: "fullTeam",
    target: 1,
    reward: { coins: 300 },
  },
  {
    id: "five_elements",
    title: "五行齐备",
    desc: "同时拥有五种元素单位",
    type: "fiveElements",
    target: 1,
    reward: { energy: 70 },
  },
  {
    id: "energy_master",
    title: "战术大师",
    desc: "能量上限达到 130",
    type: "maxEnergy",
    target: 130,
    reward: { coins: 500 },
  },
  {
    id: "rich_one",
    title: "军资充盈",
    desc: "累计获得 5000 金币",
    type: "lifetimeCoins",
    target: 5000,
    reward: { relic: 1 },
  },
  {
    id: "rich_two",
    title: "金库开张",
    desc: "累计获得 20000 金币",
    type: "lifetimeCoins",
    target: 20000,
    reward: { coins: 1200 },
  },
  {
    id: "boss_three",
    title: "三斩首领",
    desc: "击败 3 个首领",
    type: "bossKills",
    target: 3,
    reward: { relic: 1 },
  },
  {
    id: "boss_ten",
    title: "十王落桥",
    desc: "击败 10 个首领",
    type: "bossKills",
    target: 10,
    reward: { relic: 1, energy: 100 },
  },
  {
    id: "wave_thirty",
    title: "三十波长城",
    desc: "抵达第 30 波",
    type: "wave",
    target: 30,
    reward: { coins: 1800 },
  },
  {
    id: "wave_fifty",
    title: "无尽初证",
    desc: "抵达第 50 波",
    type: "wave",
    target: 50,
    reward: { relic: 1, energy: 120 },
  },
  {
    id: "kills_three_hundred",
    title: "三百破军",
    desc: "累计击败 300 个敌人",
    type: "kills",
    target: 300,
    reward: { coins: 2200 },
  },
  {
    id: "kills_thousand",
    title: "千军辟路",
    desc: "累计击败 1000 个敌人",
    type: "kills",
    target: 1000,
    reward: { relic: 1 },
  },
  {
    id: "territory_ten",
    title: "十地连旗",
    desc: "占领 10 块领地",
    type: "territory",
    target: 10,
    reward: { relic: 1, coins: 1600 },
  },
  {
    id: "territory_twenty",
    title: "二十城图",
    desc: "占领 20 块领地",
    type: "territory",
    target: 20,
    reward: { relic: 1 },
  },
  {
    id: "tech_twenty",
    title: "二十级工坊",
    desc: "综合科技达到 20 级",
    type: "tech",
    target: 20,
    reward: { energy: 120 },
  },
  {
    id: "tech_thirty",
    title: "机关百脉",
    desc: "综合科技达到 30 级",
    type: "tech",
    target: 30,
    reward: { relic: 1 },
  },
  {
    id: "unit_thirty",
    title: "三十级主将",
    desc: "拥有一个 30 级单位",
    type: "highestUnit",
    target: 30,
    reward: { coins: 2400 },
  },
  {
    id: "unit_fifty",
    title: "五十级传说",
    desc: "拥有一个 50 级单位",
    type: "highestUnit",
    target: 50,
    reward: { relic: 1, energy: 150 },
  },
  {
    id: "relic_fifteen",
    title: "十五秘藏",
    desc: "获得 15 件遗物",
    type: "relics",
    target: 15,
    reward: { coins: 2000 },
  },
  {
    id: "relic_twenty",
    title: "遗物成阵",
    desc: "获得 20 件遗物",
    type: "relics",
    target: 20,
    reward: { relic: 1 },
  },
  {
    id: "energy_160",
    title: "灵池扩张",
    desc: "能量上限达到 160",
    type: "maxEnergy",
    target: 160,
    reward: { energy: 160 },
  },
  {
    id: "wealth_big",
    title: "军费如河",
    desc: "累计获得 100000 金币",
    type: "lifetimeCoins",
    target: 100000,
    reward: { relic: 1 },
  },
  {
    id: "boss_twenty",
    title: "二十王尽",
    desc: "击败 20 个首领",
    type: "bossKills",
    target: 20,
    reward: { relic: 1, energy: 200 },
  },
  {
    id: "wave_hundred",
    title: "百波无尽",
    desc: "抵达第 100 波",
    type: "wave",
    target: 100,
    reward: { relic: 1, energy: 300 },
  },
  {
    id: "territory_fifty",
    title: "五十领地",
    desc: "占领 50 块领地",
    type: "territory",
    target: 50,
    reward: { relic: 1, coins: 5000 },
  },
  {
    id: "wealth_million",
    title: "百万军资",
    desc: "累计获得 1000000 金币",
    type: "lifetimeCoins",
    target: 1000000,
    reward: { relic: 1 },
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
let sideRenderSignature = "";

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
    nextWavePower: 0,
    currentWavePower: 0,
    activeTab: "battle",
    activeFormation: "loose",
    formationMastery: 0,
    marketStock: [],
    marketWave: 0,
    marketRefreshes: 0,
    activeChapter: "border_bridge",
    completedChapters: {},
    inventory: ["golden_needle", "tide_chain", "earth_heart", "ember_orb", "green_bell"],
    loadouts: {
      rifle: ["golden_needle"],
      guard: ["earth_heart"],
      medic: ["green_bell"],
      mage: ["tide_chain"],
      turret: ["ember_orb"],
    },
    selectedGear: null,
    nextEventWave: 4,
    queuedRelicChoices: 0,
    queuedScenarioEvents: 0,
    bridgeCount: 1,
    territory: 1,
    canClaim: false,
    wavesUntilGift: 3,
    coins: 360,
    lifetimeCoins: 0,
    energy: 30,
    maxEnergy: 100,
    weatherId: "clear",
    weatherClock: 36,
    weatherSeed: 0,
    waveMutationId: "none",
    eventDebt: 0,
    nextWaveMines: 0,
    nextWaveEnemyCut: 0,
    nextWaveRewardCut: 0,
    nextWavePowerMod: 1,
    forceBoss: 0,
    nextBossReward: 1,
    rewardCutThisWave: false,
    nextChoiceAt: 750,
    choices: 0,
    kills: 0,
    bossKills: 0,
    achievements: {},
    latestAchievement: "",
    baseHp: 1300,
    baseMaxHp: 1300,
    unitCap: 8,
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
    mines: [],
    fireFields: [],
    weatherDrops: [],
    buffs: {
      rally: 0,
      danger: 0,
      waveShield: 0,
    },
    tacticCooldowns: { storm: 0, frost: 0, rally: 0, mine: 0 },
    bought: { rifle: 0, guard: 0, medic: 0, mage: 0, turret: 0 },
    techLevel: 0,
    tech: { arms: 0, fort: 0, supply: 0, alchemy: 0 },
    relics: [],
    seenRelics: {},
    relicStats: {},
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

function actorScale() {
  if (WORLD.width > 760) return 0.48;
  return 0.82;
}

function currentWeather() {
  return WEATHER_TYPES.find((weather) => weather.id === state.weatherId) || WEATHER_TYPES[0];
}

function currentMutation() {
  return WAVE_MUTATORS.find((mutation) => mutation.id === state.waveMutationId) || WAVE_MUTATORS[0];
}

function relicStat(key) {
  let total = state.relicStats?.[key] || 0;
  Object.values(state.loadouts || {}).flat().forEach((gearId) => {
    const gear = CORE_GEAR.find((item) => item.id === gearId) || RELIC_POOL.find((item) => item.id === gearId);
    total += gear?.stats?.[key] || 0;
  });
  return total;
}

function heroGearStat(heroType, key) {
  return (state.loadouts?.[heroType] || []).reduce((sum, gearId) => {
    const gear = CORE_GEAR.find((item) => item.id === gearId) || RELIC_POOL.find((item) => item.id === gearId);
    return sum + (gear?.stats?.[key] || 0);
  }, 0);
}

function gearById(id) {
  return CORE_GEAR.find((item) => item.id === id) || RELIC_POOL.find((item) => item.id === id);
}

function relicMultiplier(key) {
  return 1 + relicStat(key);
}

function hasRelic(id) {
  return state.seenRelics?.[id] || false;
}

function regionName() {
  return REGION_NAMES[(state.territory - 1) % REGION_NAMES.length];
}

function activeChapter() {
  return STORY_CHAPTERS.find((chapter) => chapter.id === state.activeChapter) || STORY_CHAPTERS[0];
}

function activeFormation() {
  return FORMATIONS.find((formation) => formation.id === state.activeFormation) || FORMATIONS[0];
}

function elementCounts() {
  const counts = ELEMENT_ORDER.reduce((result, element) => {
    result[element] = 0;
    return result;
  }, {});
  state.units.forEach((unit) => {
    const element = UNIT_TYPES[unit.type]?.element;
    if (element) counts[element] += 1;
  });
  return counts;
}

function formationAvailable(formation) {
  const counts = elementCounts();
  return Object.entries(formation.recipe || {}).every(([element, amount]) => (counts[element] || 0) >= amount);
}

function formationBonus() {
  const formation = activeFormation();
  if (!formationAvailable(formation)) return {};
  const mastery = 1 + (state.formationMastery || 0);
  return Object.entries(formation.bonus || {}).reduce((result, [key, value]) => {
    result[key] = value * mastery;
    return result;
  }, {});
}

function unitPower(unit) {
  const meta = UNIT_TYPES[unit.type];
  if (!meta) return 0;
  const levelScale = 1 + (unit.level - 1) * 0.34;
  const roleWeight = unit.type === "guard" ? 1.08 : unit.type === "medic" ? 0.95 : unit.type === "turret" ? 1.16 : 1;
  const gearPower = (state.loadouts?.[unit.type] || []).reduce((sum, gearId) => {
    const gear = gearById(gearId);
    if (!gear) return sum;
    return sum + 180 + (gear.rank === "史诗" ? 280 : gear.rank === "稀有" ? 170 : 90);
  }, 0);
  return Math.round((meta.hp * 0.12 + meta.damage * meta.fireRate * 12 + meta.range * 0.12) * levelScale * roleWeight + gearPower);
}

function playerPower() {
  const unitTotal = state.units.reduce((sum, unit) => sum + unitPower(unit), 0);
  const tech = 1 + state.techLevel * 0.045;
  const relic = 1 + state.relics.length * 0.025;
  const formation = formationAvailable(activeFormation()) ? 1.08 + (state.formationMastery || 0) * 0.25 : 1;
  const infrastructure = 1 + Math.max(0, state.unitCap - 5) * 0.018 + state.territory * 0.012;
  return Math.max(120, Math.round(unitTotal * tech * relic * formation * infrastructure));
}

function wavePowerTarget() {
  const base = playerPower();
  const isBossWave = (state.wave + 1) % 5 === 0 || (state.wave + 1) % 3 === 0 || state.forceBoss > 0;
  const chapter = activeChapter();
  const chapterPressure = 1 + STORY_CHAPTERS.findIndex((item) => item.id === chapter.id) * 0.08;
  const wavePressure = 1 + Math.min(0.9, state.wave * 0.012);
  const target = base * (isBossWave ? 1.18 : 0.78 + Math.min(0.18, state.wave * 0.004)) * chapterPressure * wavePressure;
  return Math.round(target * (state.nextWavePowerMod || 1));
}

function enemyUnitPower(type, elite = false) {
  const meta = ENEMY_TYPES[type];
  if (!meta) return 40;
  const raw = meta.hp * 0.16 + meta.damage * 13 + meta.speed * 1.4 + (meta.armor || 0) * 18 + meta.reward * 0.8;
  return Math.round(raw * (elite ? 2.7 : 1));
}

function weatherMultiplier(key, fallback = 1) {
  const weather = currentWeather();
  return weather[key] ?? fallback;
}

function synergyInfo() {
  const counts = elementCounts();

  const names = [];
  const stats = {
    damage: 0,
    fireRate: 0,
    heal: 0,
    range: 0,
    gold: 0,
    pierce: 0,
    slowPower: 0,
    baseReduce: 0,
    elementPower: 0,
  };

  if (counts.metal >= 3) {
    names.push("金锋阵");
    stats.pierce += 0.12;
    stats.damage += 0.04;
  }
  if (counts.wood >= 3) {
    names.push("青木阵");
    stats.heal += 0.26;
  }
  if (counts.water >= 3) {
    names.push("沧水阵");
    stats.slowPower += 0.3;
    stats.range += 0.04;
  }
  if (counts.fire >= 3) {
    names.push("烈火阵");
    stats.fireRate += 0.16;
  }
  if (counts.earth >= 3) {
    names.push("厚土阵");
    stats.baseReduce += 0.12;
  }
  if (ELEMENT_ORDER.every((element) => counts[element] > 0)) {
    names.push("五行阵");
    const bonus = hasRelic("five_scroll") ? 2 : 1;
    stats.damage += 0.12 * bonus;
    stats.gold += 0.1 * bonus;
    stats.elementPower += 0.08 * bonus;
  }

  return { counts, names, stats };
}

function combatStats() {
  const weather = currentWeather();
  const synergy = synergyInfo().stats;
  const form = formationBonus();
  const fogRangePenalty = weather.id === "fog" && hasRelic("quiet_bell") ? 1 : weather.range ?? 1;
  const danger =
    relicStat("dangerFireRate") > 0 && state.enemies.some((enemy) => enemy.x < WORLD.baseX + 180)
      ? relicStat("dangerFireRate")
      : 0;
  return {
    damage: state.upgrades.damage * relicMultiplier("damage") * (weather.unitDamage || 1) * (1 + synergy.damage + (form.damage || 0)),
    fireRate: state.upgrades.fireRate * (1 + synergy.fireRate + danger + (form.fireRate || 0)) * (state.buffs.rally > 0 ? 1.28 : 1),
    range: state.upgrades.range * fogRangePenalty * relicMultiplier("range") * (1 + synergy.range + (form.range || 0)),
    heal: state.upgrades.heal * (weather.heal || 1) * relicMultiplier("heal") * (1 + synergy.heal + (form.heal || 0)),
    gold: state.upgrades.gold * relicMultiplier("gold") * (1 + synergy.gold + (form.gold || 0)),
    pierce: relicStat("pierce") + synergy.pierce + (form.pierce || 0),
    slowPower: relicStat("slowPower") + synergy.slowPower + (form.slowPower || 0) + ((weather.waterSlow || 1) - 1),
    elementPower: state.upgrades.elementPower + relicStat("elementPower") + synergy.elementPower + (form.elementPower || 0),
    projectileSpeed: (weather.projectileSpeed || 1) * (weather.id === "wind" ? 1 + relicStat("windProjectile") : 1),
    enemySpeed: (weather.enemySpeed || 1) * (1 - relicStat("bridgeSlow")),
    energy: (weather.energy || 1) * (weather.id === "storm" ? 1 + relicStat("stormEnergy") : 1),
    baseReduce: synergy.baseReduce + relicStat("baseDamageReduce") + (form.baseReduce || 0),
    bossDamage: form.bossDamage || 0,
    guardBlock: form.guardBlock || 0,
    splash: form.splash || 0,
    mineRadius: form.mineRadius || 0,
    fireDamageBonus: form.fireDamage || 0,
    waterRoot: form.waterRoot || 0,
    regen: form.regen || 0,
    waveShield: form.waveShield || 0,
    eliteFocus: form.eliteFocus || 0,
  };
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

function highestUnitLevel() {
  return Math.max(1, ...state.units.map((unit) => unit.level || 1));
}

function techCap() {
  return highestUnitLevel();
}

function techCost() {
  const level = state.techLevel || 0;
  return Math.round(900 + level * 780 + level * level * 105);
}

function costOf(type) {
  const meta = UNIT_TYPES[type];
  const growth = Math.pow(1.13, state.bought[type] || 0);
  return Math.max(1, Math.round(meta.baseCost * growth * state.upgrades.discount * (1 - relicStat("discount"))));
}

function abilityRequirementAt(choiceCount) {
  const n = choiceCount || 0;
  return Math.round(750 + 250 * n + 125 * n * Math.max(0, n - 1));
}

function nextAbilityRequirement() {
  return abilityRequirementAt(state.choices || 0);
}

function selectedUpgradeCost() {
  const unit = selectedUnit();
  if (!unit) return 0;
  return Math.round((180 + unit.level * 210 + Math.pow(unit.level, 1.72) * 95) * (1 - relicStat("upgradeDiscount")));
}

function claimCost() {
  return Math.round((175 + state.territory * 125) * (1 - relicStat("claimDiscount")));
}

function spawnUnit(type, x, y, free = false) {
  if (!free && currentUnitCount() >= state.unitCap) return null;
  const meta = UNIT_TYPES[type];
  const elementHp = meta.element === "earth" ? 1 + relicStat("earthHp") : 1;
  const maxHp = meta.hp * state.upgrades.hp * relicMultiplier("hp") * elementHp;
  const unit = {
    id: entityId++,
    side: "unit",
    type,
    level: free ? 1 + relicStat("freeUnitLevel") : 1,
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
  if (unit.level > 1) {
    unit.maxHp *= Math.pow(1.17, unit.level - 1);
    unit.hp = unit.maxHp;
  }
  state.units.push(unit);
  state.selectedId = unit.id;
  burst(unit.x, unit.y, ELEMENTS[meta.element].color, 10);
  compactArmyIfNeeded();
  saveGame();
  return unit;
}

function compactArmyIfNeeded() {
  while (state.units.length > state.unitCap) {
    const pairType = Object.keys(UNIT_TYPES).find((type) => state.units.filter((unit) => unit.type === type).length >= 2);
    if (!pairType) break;
    const same = state.units.filter((unit) => unit.type === pairType).sort((a, b) => a.level - b.level);
    const absorbed = same[0];
    const receiver = same[same.length - 1];
    receiver.level += Math.max(1, Math.floor(absorbed.level * 0.65));
    receiver.maxHp *= 1 + absorbed.level * 0.06;
    receiver.hp = receiver.maxHp;
    state.units = state.units.filter((unit) => unit.id !== absorbed.id);
    addFloater(receiver.x, receiver.y - 48, "合编", "#ffe28e");
    burst(receiver.x, receiver.y, ELEMENTS[UNIT_TYPES[receiver.type].element].color, 18);
  }
}

function buyUnit(type) {
  selectHero(type);
}

function selectHero(type) {
  if (state.gameOver || state.modalOpen) return;
  const unit = state.units.find((item) => item.type === type);
  if (!unit) return;
  state.selectedId = unit.id;
  showToast(`${UNIT_TYPES[type].name} 已选中`);
  updateUi();
}

function upgradeSelectedUnit() {
  const unit = selectedUnit();
  if (!unit || state.gameOver || state.modalOpen) return;
  const cost = selectedUpgradeCost();
  if (unit.level >= 12 + state.territory * 2) {
    showToast("当前关卡等级已到训练上限");
    return;
  }
  if (state.coins < cost) {
    showToast("金币不够");
    return;
  }
  state.coins -= cost;
  unit.level += 1;
  unit.maxHp *= 1.17;
  unit.hp = unit.maxHp;
  if (unit.level % 5 === 0 && relicStat("levelHeal") > 0) {
    state.units.forEach((ally) => {
      ally.hp = Math.min(ally.maxHp, ally.hp + ally.maxHp * relicStat("levelHeal"));
    });
  }
  burst(unit.x, unit.y, ELEMENTS[UNIT_TYPES[unit.type].element].color, 16);
  addFloater(unit.x, unit.y - 38, `Lv.${unit.level}`, "#ffe28e");
  saveGame();
  updateUi();
}

function upgradeTech() {
  if (state.gameOver || state.modalOpen) return;
  const cap = techCap();
  if (state.techLevel >= 8 + state.territory) {
    showToast("当前关卡科技已到上限");
    return;
  }
  if (state.techLevel >= cap) {
    showToast(`科技上限受最高兵种 Lv.${cap} 限制`);
    return;
  }

  const cost = techCost();
  if (state.coins < cost) {
    showToast("金币不够");
    return;
  }

  state.coins -= cost;
  state.techLevel += 1;
  state.tech = {
    arms: state.techLevel,
    fort: state.techLevel,
    supply: state.techLevel,
    alchemy: state.techLevel,
  };
  state.upgrades.damage *= 1.035;
  state.upgrades.range *= 1.012;
  state.baseMaxHp += 54 + state.techLevel * 5;
  state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 88 + state.techLevel * 4);
  state.upgrades.regen += 0.16;
  state.upgrades.gold *= 1.018;
  state.upgrades.elementPower += 0.015;
  if (state.techLevel % 5 === 0) state.unitCap += 1;

  burst(WORLD.width * 0.48, WORLD.height * 0.44, "#ffe28e", 26);
  addFloater(WORLD.width * 0.48, WORLD.height * 0.39, `科技 Lv.${state.techLevel}`, "#ffe28e");
  showToast(`综合科技提升到 Lv.${state.techLevel}`);
  saveGame();
  updateUi();
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
  if (relicStat("claimHeal") > 0) {
    state.units.forEach((unit) => {
      unit.hp = Math.min(unit.maxHp, unit.hp + unit.maxHp * relicStat("claimHeal"));
    });
  }
  if (state.territory % 2 === 0) state.unitCap += 1;
  state.bridgeCount = state.territory >= 3 ? 2 : 1;
  state.queuedScenarioEvents += 1;
  state.queuedRelicChoices += relicStat("relicOnClaim");
  rebuildPaths();
  burst(WORLD.width * 0.62, WORLD.height * 0.22, "#ffe28e", 24);
  showToast(`占领第 ${state.territory} 块领地`);
  saveGame();
  updateUi();
}

function scheduleWave() {
  state.wave += 1;
  if (state.wave === 1 || state.wave % 4 === 1) rollWaveMutation();
  startWaveBonuses();
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

  if (state.wave >= state.nextEventWave) {
    state.queuedScenarioEvents += 1;
    state.nextEventWave += 5;
  }

  buildWaveSpawnQueue();
  state.nextWavePowerMod = 1;

  if (state.eventDebt > 0) {
    state.eventDebt -= 1;
    state.spawnQueue.forEach((item) => {
      item.elite = item.elite || Math.random() < 0.2;
    });
  }

  if (state.nextWaveMines > 0) {
    const amount = state.nextWaveMines;
    state.nextWaveMines = 0;
    placeMines(amount, true);
  }
  if (state.nextWaveRewardCut > 0) state.nextWaveRewardCut -= 1;
  state.nextBossReward = 1;

  state.spawnQueue.sort((a, b) => a.at - b.at);
  ui.waveRibbon.textContent = state.wave >= 5 && state.wave % 5 === 0 ? `第 ${state.wave} 波 首领来袭` : `第 ${state.wave} 波`;
  ui.waveRibbon.classList.remove("show");
  void ui.waveRibbon.offsetWidth;
  ui.waveRibbon.classList.add("show");
  saveGame();
}

function rollWaveMutation() {
  const candidates = WAVE_MUTATORS.filter((mutation) => mutation.id !== state.waveMutationId);
  const mutation = candidates[Math.floor(Math.random() * candidates.length)] || WAVE_MUTATORS[0];
  state.waveMutationId = mutation.id;
  if (mutation.forceWeather) {
    state.weatherId = mutation.forceWeather;
    state.weatherClock = Math.max(state.weatherClock, 36);
  }
  if (state.wave > 1) addFloater(WORLD.width * 0.5, WORLD.height * 0.23, mutation.name, "#ffe28e");
}

function buildWaveSpawnQueue() {
  const mutation = currentMutation();
  const chapter = activeChapter();
  const waveCut = state.nextWaveEnemyCut > 0 ? 0.76 : 1;
  if (state.nextWaveEnemyCut > 0) state.nextWaveEnemyCut -= 1;
  state.rewardCutThisWave = state.nextWaveRewardCut > 0;

  let budget = wavePowerTarget() * waveCut * (mutation.count ? Math.sqrt(mutation.count) : 1);
  state.currentWavePower = Math.round(budget);
  state.nextWavePower = Math.round(wavePowerTarget());
  const bossWave = state.wave >= 5 && state.wave % 5 === 0;
  const swarmWave = mutation.id === "swarm_line";
  const smallCap = bossWave ? 3 : swarmWave ? 12 : 6;
  let slot = 0;

  if (bossWave || state.forceBoss > 0) {
    const bossPower = enemyUnitPower("boss", true) * 1.8;
    state.spawnQueue.push({
      at: 1.4,
      type: "boss",
      pathIndex: Math.floor(Math.random() * activePathCount()),
      elite: true,
    });
    budget -= bossPower;
    if (state.forceBoss > 0) state.forceBoss -= 1;
  }

  while (budget > 70 && slot < smallCap) {
    const elite = budget > playerPower() * 0.22 && Math.random() < (slot % 2 === 0 ? 0.7 : 0.36);
    const type = pickEnemyTypeByChapter(chapter, mutation, elite);
    const cost = enemyUnitPower(type, elite);
    state.spawnQueue.push({
      at: 0.8 + slot * rand(0.75, 1.25),
      type,
      pathIndex: Math.floor(Math.random() * activePathCount()),
      elite,
    });
    budget -= cost;
    slot += 1;
  }

  if (!state.spawnQueue.length) {
    state.spawnQueue.push({
      at: 0.8,
      type: pickEnemyTypeByChapter(chapter, mutation, false),
      pathIndex: 0,
      elite: false,
    });
  }
}

function pickEnemyTypeByChapter(chapter, mutation, elite) {
  const elementMap = {
    wood: "sprout",
    fire: "cinder",
    water: "tide",
    metal: "shell",
    earth: "golem",
  };
  if (elite && Math.random() < 0.35) return Math.random() < 0.5 ? "shell" : "golem";
  if (chapter?.enemyElements?.length && Math.random() < 0.62) {
    const element = chapter.enemyElements[Math.floor(Math.random() * chapter.enemyElements.length)];
    return elementMap[element] || pickEnemyType(state.wave, mutation);
  }
  return pickEnemyType(state.wave, mutation);
}

function pickEnemyType(wave, mutation = currentMutation()) {
  if (mutation.golemBias && Math.random() < mutation.golemBias) return "golem";
  if (mutation.cinderBias && Math.random() < mutation.cinderBias) return "cinder";
  if (mutation.sproutBias && Math.random() < mutation.sproutBias) return "sprout";
  if (mutation.tideBias && Math.random() < mutation.tideBias) return "tide";
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
  const stats = combatStats();
  const mutation = currentMutation();
  const totalUnitLevel = state.units.reduce((sum, unit) => sum + unit.level, 0);
  const armyPower = Math.max(0, totalUnitLevel - state.units.length) * 0.075;
  const techPower = (state.techLevel || 0) * 0.12;
  const upgradePressure =
    Math.max(0, state.upgrades.damage - 1) * 1.1 +
    Math.max(0, state.upgrades.fireRate - 1) * 0.9 +
    Math.max(0, state.upgrades.range - 1) * 0.35 +
    Math.max(0, state.upgrades.gold - 1) * 0.35 +
    Math.max(0, state.upgrades.elementPower) * 0.65;
  const scale =
    (1 + Math.pow(state.wave, 1.2) * 0.13 + state.territory * 0.08 + armyPower + techPower + upgradePressure) *
    (elite ? 5.8 : 2.4);
  const pos = pointOnPath(pathIndex, 0);
  const affixes = chooseAffixes(elite, type);
  const shieldAffix = affixes.includes("shielded") ? 0.32 : 0;
  const hasteAffix = affixes.includes("haste") ? 1.22 : 1;
  const taxAffix = affixes.includes("tax") ? 1.55 : 1;
  const enemy = {
    id: entityId++,
    side: "enemy",
    type,
    pathIndex,
    progress: 0,
    x: pos.x,
    y: pos.y,
    hp: meta.hp * scale * (mutation.enemyHp || 1) * (type === "boss" ? mutation.bossHp || 1 : 1),
    maxHp: meta.hp * scale * (mutation.enemyHp || 1) * (type === "boss" ? mutation.bossHp || 1 : 1),
    damage:
      meta.damage *
      (1 + state.wave * 0.075 + state.territory * 0.055 + techPower * 0.45 + armyPower * 0.16) *
      state.upgrades.enemyDamage *
      (elite ? 1.75 + relicStat("eliteDamage") : 1) *
      (mutation.enemyDamage || 1),
    speed:
      meta.speed *
      (1 + Math.min(state.wave * 0.011 + state.territory * 0.008, 0.72)) *
      stats.enemySpeed *
      hasteAffix *
      (mutation.enemySpeed || 1) *
      (currentWeather().id === "fog" ? mutation.fogSpeed || 1 : 1) *
      (currentWeather().id === "rain" ? mutation.rainSpeed || 1 : 1),
    armor:
      (meta.armor || 0) +
      Math.floor(state.wave / 4) +
      Math.floor(techPower * 3) +
      (elite ? 8 + Math.floor(state.wave / 8) : 0) -
      (mutation.armor || 0) -
      relicStat("armorBreak") -
      (elite ? relicStat("eliteArmorBreak") : 0),
    reward: Math.round(
      meta.reward *
        (1 + state.wave * 0.016 + state.territory * 0.026) *
        stats.gold *
        taxAffix *
        (mutation.reward || 1) *
        (elite ? 1 + relicStat("eliteGold") : 1) *
        (type === "boss" ? (1 + relicStat("bossGold")) * (state.nextBossReward || 1) : 1) *
        (state.rewardCutThisWave ? 0.7 : 1),
    ),
    element: type === "boss" ? ELEMENT_ORDER[state.wave % ELEMENT_ORDER.length] : meta.element,
    color: meta.color,
    cooldown: rand(0.35, 0.8),
    attackFlash: 0,
    slowTimer: 0,
    regenClock: 0,
    elite,
    affixes,
    shield: meta.hp * scale * (shieldAffix + (mutation.shieldBonus || 0)) * (currentWeather().enemyShield || 1),
    poison: 0,
    burn: 0,
    phase: type === "boss" ? 1 : 0,
  };
  enemy.armor = Math.max(0, enemy.armor);
  state.enemies.push(enemy);
  if (elite) {
    state.effects.push({
      type: "ring",
      x: enemy.x,
      y: enemy.y,
      color: "#ffe28e",
      life: 0.8,
      maxLife: 0.8,
      radius: type === "boss" ? 58 : 42,
    });
    addFloater(enemy.x, enemy.y - 34, type === "boss" ? "首领" : "精英", "#ffe28e");
  }
  return enemy;
}

function update(dt) {
  if (!state.running || state.paused || state.modalOpen || state.gameOver) return;

  state.time += dt;
  saveClock += dt;
  updateWeather(dt);
  updateTactics(dt);
  if (state.upgrades.regen > 0 || relicStat("baseRegen") > 0 || combatStats().regen > 0) {
    state.baseHp = Math.min(state.baseMaxHp, state.baseHp + (state.upgrades.regen + relicStat("baseRegen") + combatStats().regen) * dt);
  }

  if (state.wave === 0) scheduleWave();
  processWave(dt);
  updateUnitMovement(dt);
  updateUnits(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateEffects(dt);
  updateMines(dt);
  updateFireFields(dt);
  removeDead();
  checkUpgradeChoice();
  checkQueuedRewards();
  checkAchievements();
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
  const stats = combatStats();
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
    const typeRate = unit.type === "turret" ? 1 + relicStat("turretRate") : 1;
    const elementDamage =
      meta.element === "fire"
        ? (currentWeather().fireDamage || 1) * relicMultiplier("fireDamage") * (1 + stats.fireDamageBonus)
        : meta.element === "water"
          ? relicMultiplier("waterDamage")
          : 1;
    const singleDamage = 1 + heroGearStat(unit.type, "singleDamage");
    const rate = meta.fireRate * stats.fireRate * typeRate * (1 + (unit.level - 1) * 0.06);
    const damage = meta.damage * stats.damage * elementDamage * singleDamage * (1 + (unit.level - 1) * 0.19);
    unit.cooldown = 1 / rate;
    unit.attackFlash = 1;

    if (unit.type === "guard") {
      hitEnemy(target, damage, unit, { pierce: 0.1 + stats.pierce });
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
      speed: (unit.type === "turret" ? 600 : 510) * stats.projectileSpeed,
      color: ELEMENTS[meta.element].color,
      splash: unit.type === "turret" || Math.random() < state.upgrades.splash + stats.splash,
      slow: unit.type === "mage",
      pierce: (unit.type === "rifle" ? 0.55 : 0) + stats.pierce,
      heroType: unit.type,
    });
  });
}

function healWithMedic(unit) {
  const stats = combatStats();
  const wounded = state.units
    .filter((ally) => ally.id !== unit.id && ally.hp < ally.maxHp && distance(unit, ally) <= 178 * stats.range)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

  if (wounded && unit.cooldown <= 0) {
    const heal = (25 + unit.level * 5.5) * stats.heal;
    wounded.hp = Math.min(wounded.maxHp, wounded.hp + heal);
    unit.cooldown = 0.78 / stats.fireRate;
    unit.attackFlash = 1;
    addFloater(wounded.x, wounded.y - 24, `+${Math.round(heal)}`, "#aaf2b0");
    burst(wounded.x, wounded.y - 14, "#aaf2b0", 6);
    return;
  }

  const target = findTarget(unit);
  if (target && unit.cooldown <= 0) {
    unit.cooldown = 1 / (UNIT_TYPES.medic.fireRate * stats.fireRate);
    state.projectiles.push({
      id: entityId++,
      x: unit.x + 12,
      y: unit.y - 10,
      target,
      unitType: unit.type,
      element: "wood",
      damage: (UNIT_TYPES.medic.damage + unit.level * 1.7) * stats.damage,
      speed: 460 * stats.projectileSpeed,
      color: ELEMENTS.wood.color,
      splash: false,
      slow: false,
      pierce: 0,
      heroType: unit.type,
    });
  }
}

function findTarget(unit) {
  const meta = UNIT_TYPES[unit.type];
  const stats = combatStats();
  const range = meta.range * stats.range * (1 + (unit.level - 1) * 0.04);
  return state.enemies
    .filter((enemy) => enemy.hp > 0 && distance(unit, enemy) <= range)
    .sort((a, b) => {
      if ((relicStat("eliteFocus") || stats.eliteFocus) && a.elite !== b.elite) return a.elite ? -1 : 1;
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
    enemy.poison = Math.max(0, enemy.poison - dt);
    if (enemy.burn > 0) {
      const tick = Math.min(enemy.burn, dt);
      enemy.burn -= tick;
      enemy.hp -= enemy.maxHp * 0.018 * tick;
    }
    updateBossPhase(enemy);

    if (enemy.type === "sprout") {
      enemy.regenClock += dt;
      if (enemy.regenClock >= 1) {
        enemy.regenClock = 0;
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * 0.018 * (currentMutation().regen || 1));
      }
    }

    const blocker = state.units
      .filter((unit) => {
        const guardBonus = unit.type === "guard" ? 1 + relicStat("guardBlock") : 1;
        return unit.hp > 0 && distance(unit, enemy) < (unit.type === "guard" ? 42 * guardBonus * (1 + combatStats().guardBlock) : 31);
      })
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

    const slowFactor = enemy.slowTimer > 0 ? Math.max(0.18, 0.48 - combatStats().slowPower * 0.16) : 1;
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
  if (enemy.affixes?.includes("vampire")) enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.damage * 1.8);
  if (enemy.affixes?.includes("venom")) {
    unit.hp -= enemy.damage * 0.25;
    addFloater(unit.x, unit.y - 38, "毒", "#77c66e");
  }
  addFloater(unit.x, unit.y - 24, `-${Math.round(enemy.damage)}`, "#ff9f85");
  burst(unit.x, unit.y, "#d64b45", 4);
}

function attackBase(enemy) {
  if (enemy.cooldown > 0) return;
  enemy.cooldown = 0.7;
  enemy.attackFlash = 1;
  state.baseHp -= enemy.damage * Math.max(0.25, 1 - combatStats().baseReduce);
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
        target.slowTimer = Math.max(target.slowTimer, 1.8 * (1 + combatStats().slowPower));
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
  if (ELEMENTS[attackerElement].beats === defenderElement) return 1.35 + combatStats().elementPower;
  if (ELEMENTS[defenderElement].beats === attackerElement) return 0.76;
  return 1 + (state.elementBoost[attackerElement] || 0);
}

function hitEnemy(enemy, rawDamage, source, options = {}) {
  const attackerElement = source.element || UNIT_TYPES[source.type]?.element;
  const multiplier = elementMultiplier(attackerElement, enemy.element);
  const armor = enemy.armor * (1 - (options.pierce || 0));
  const critChance =
    (attackerElement === "metal" ? relicStat("metalCrit") : 0) +
    (source.unitType === "rifle" || source.type === "rifle" ? 0.03 : 0);
  const crit = Math.random() < critChance;
  const bossTaken = enemy.type === "boss" ? 1 + relicStat("bossDamageTaken") + combatStats().bossDamage : 1;
  const slowTaken = enemy.slowTimer > 0 ? 1 + relicStat("slowDamageTaken") : 1;
  const shieldTaken = enemy.shield > 0 ? 1 + relicStat("shieldDamage") : 1;
  let damage = Math.max(1, rawDamage * multiplier * bossTaken * slowTaken * shieldTaken * (crit ? 1.75 : 1) - armor);
  if (enemy.shield > 0) {
    const absorbed = Math.min(enemy.shield, damage);
    enemy.shield -= absorbed;
    damage -= absorbed;
    addFloater(enemy.x, enemy.y - 34, `盾-${Math.round(absorbed)}`, "#9ed0d2");
  }
  enemy.hp -= damage;
  enemy.attackFlash = Math.max(enemy.attackFlash, 0.45);
  if ((source.unitType === "turret" || attackerElement === "fire") && Math.random() < relicStat("burnChance")) {
    enemy.burn = Math.max(enemy.burn || 0, 3.2);
    addFloater(enemy.x, enemy.y - 46, "灼烧", ELEMENTS.fire.color);
  }
  if (source.heroType && heroGearStat(source.heroType, "eliteLightning") && enemy.elite) {
    state.enemies.forEach((item) => {
      if (item.id !== enemy.id && item.hp > 0 && distance(item, enemy) < 130) {
        item.hp -= rawDamage * 0.28;
      }
    });
    state.effects.push({ type: "ring", x: enemy.x, y: enemy.y, color: ELEMENTS.metal.color, life: 0.35, maxLife: 0.35, radius: 55 });
  }
  if (attackerElement === "water" && Math.random() < relicStat("waterRoot") + combatStats().waterRoot) {
    enemy.slowTimer = Math.max(enemy.slowTimer, 3.4);
    addFloater(enemy.x, enemy.y - 48, "冰封", ELEMENTS.water.color);
  }
  const chainChance = relicStat("chainChance") + (attackerElement === "fire" ? relicStat("fireChainBonus") : 0);
  if (!options.chainDepth && Math.random() < chainChance) {
    const next = state.enemies
      .filter((item) => item.id !== enemy.id && item.hp > 0 && distance(item, enemy) < 115)
      .sort((a, b) => distance(a, enemy) - distance(b, enemy))[0];
    if (next) hitEnemy(next, rawDamage * 0.46, source, { ...options, chainDepth: 1 });
  }
  state.effects.push({
    type: "ring",
    x: enemy.x,
    y: enemy.y - 8,
    color: source.color || ELEMENTS[attackerElement]?.color || "#f8f2cd",
    life: 0.34,
    maxLife: 0.34,
    radius: multiplier > 1.2 ? 44 : 28,
  });
  addFloater(enemy.x, enemy.y - 18, `${crit ? "暴 " : ""}${Math.round(damage)}`, source.color || "#fff2c7");
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
    if (relicStat("deathSave") > 0 && Math.random() < relicStat("deathSave")) {
      unit.hp = 1;
      state.enemies.forEach((enemy) => {
        if (distance(unit, enemy) < 95) enemy.slowTimer = Math.max(enemy.slowTimer, 2);
      });
      addFloater(unit.x, unit.y - 36, "魂灯", "#ffe28e");
      burst(unit.x, unit.y, "#ffe28e", 16);
      return true;
    }
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
    if (enemy.affixes?.includes("split") && enemy.type !== "boss") {
      splitEnemy(enemy).forEach((child) => survivors.push(child));
    }
    if (enemy.type === "boss") {
      state.bossKills += 1;
      state.queuedRelicChoices += 1;
      state.energy = Math.min(state.maxEnergy, state.energy + 28);
      addFloater(enemy.x, enemy.y - 52, "遗物", "#ffe28e");
    }
  });
  state.enemies = survivors;
}

function explodeEnemy(enemy) {
  state.units.forEach((unit) => {
    if (distance(unit, enemy) < 72) {
      unit.hp -= enemy.damage * 0.55;
      unit.hp -= enemy.damage * 0.55 * ((currentMutation().explosion || 1) - 1);
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
  ui.choiceNote.textContent = `本次后下一档约 ${abilityRequirementAt(state.choices + 1)} 金币`;
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
      title: `金币补给 +${Math.round((180 + state.territory * 45) * (1 + relicStat("giftGold")))}`,
      desc: "直接获得一笔金币",
      apply: () => {
        const gain = Math.round((180 + state.territory * 45) * (1 + relicStat("giftGold")));
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
        state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 260 * (1 + relicStat("giftHeal")));
      },
    },
    {
      title: "遗物线索",
      desc: "从两个遗物中选择一个",
      apply: () => {
        state.queuedRelicChoices += 1;
      },
    },
    {
      title: "能量晶石",
      desc: "恢复大量战术能量",
      apply: () => {
        state.energy = Math.min(state.maxEnergy, state.energy + 65);
      },
    },
  ];
}

function closeModal() {
  state.modalOpen = false;
  ui.choiceModal.hidden = true;
}

function updateWeather(dt) {
  state.weatherClock -= dt;
  if (state.weatherClock > 0) return;
  const currentIndex = WEATHER_TYPES.findIndex((weather) => weather.id === state.weatherId);
  const nextIndex = (currentIndex + 1 + Math.floor(rand(1, WEATHER_TYPES.length))) % WEATHER_TYPES.length;
  const next = WEATHER_TYPES[nextIndex] || WEATHER_TYPES[0];
  state.weatherId = next.id;
  state.weatherClock = next.duration * (next.id === "rain" ? 1 + relicStat("rainDuration") : 1);
  state.weatherSeed += 1;
  addFloater(WORLD.width * 0.5, WORLD.height * 0.18, `${next.name}天气`, "#fff2c7");
}

function updateTactics(dt) {
  const stats = combatStats();
  state.maxEnergy = 100 + relicStat("maxEnergy");
  state.energy = Math.min(state.maxEnergy, state.energy + (5.2 + state.techLevel * 0.12) * stats.energy * dt);
  Object.keys(state.tacticCooldowns).forEach((id) => {
    state.tacticCooldowns[id] = Math.max(0, state.tacticCooldowns[id] - dt);
  });
  state.buffs.rally = Math.max(0, state.buffs.rally - dt);
  state.buffs.danger = Math.max(0, state.buffs.danger - dt);
}

function canUseTactic(id) {
  const tactic = TACTICS[id];
  return (
    tactic &&
    !state.gameOver &&
    !state.modalOpen &&
    state.energy >= tactic.cost &&
    state.tacticCooldowns[id] <= 0
  );
}

function useTactic(id) {
  if (!canUseTactic(id)) {
    const tactic = TACTICS[id];
    if (!tactic) return;
    showToast(state.tacticCooldowns[id] > 0 ? "战术冷却中" : "能量不足");
    return;
  }
  const tactic = TACTICS[id];
  state.energy -= tactic.cost;
  state.tacticCooldowns[id] = tactic.cooldown;
  if (id === "storm") castStorm();
  if (id === "frost") castFrost();
  if (id === "rally") castRally();
  if (id === "mine") castMinefield();
  saveGame();
  updateUi();
}

function castStorm() {
  const damage = (46 + state.wave * 7 + state.techLevel * 9) * (1 + relicStat("stormDamage")) * (currentWeather().stormDamage || 1);
  let eliteHits = 0;
  state.enemies.forEach((enemy) => {
    const amount = damage * (enemy.elite ? 1.55 : 1);
    hitEnemy(enemy, amount, { element: "metal", color: TACTICS.storm.color }, { pierce: 0.25 });
    enemy.slowTimer = Math.max(enemy.slowTimer, 0.5);
    if (enemy.elite) eliteHits += 1;
  });
  state.energy = Math.min(state.maxEnergy, state.energy + Math.min(24, eliteHits * relicStat("eliteEnergyRefund")));
  state.effects.push({
    type: "ring",
    x: WORLD.width * 0.5,
    y: WORLD.height * 0.45,
    color: TACTICS.storm.color,
    life: 0.6,
    maxLife: 0.6,
    radius: 120,
  });
  showToast("雷令轰落");
}

function castFrost() {
  const duration = 3.2 * (1 + relicStat("frostDuration")) * (1 + combatStats().slowPower * 0.25);
  state.enemies.forEach((enemy) => {
    enemy.slowTimer = Math.max(enemy.slowTimer, duration);
    enemy.attackFlash = 1;
    hitEnemy(enemy, 16 + state.techLevel * 4, { element: "water", color: TACTICS.frost.color }, { pierce: 0.05 });
  });
  state.effects.push({
    type: "ring",
    x: WORLD.width * 0.55,
    y: WORLD.height * 0.52,
    color: TACTICS.frost.color,
    life: 0.8,
    maxLife: 0.8,
    radius: 160,
  });
  showToast("霜阵展开");
}

function castRally() {
  const duration = 8 + relicStat("rallyDuration");
  state.buffs.rally = duration;
  state.units.forEach((unit) => {
    const heal = unit.maxHp * 0.18 * combatStats().heal;
    unit.hp = Math.min(unit.maxHp, unit.hp + heal);
    burst(unit.x, unit.y, TACTICS.rally.color, 8);
  });
  showToast("战鼓齐鸣");
}

function castMinefield() {
  placeMines(4 + relicStat("mineCount"), false);
  showToast("火雷已布置");
}

function placeMines(amount, quiet = false) {
  const total = Math.max(1, Math.round(amount));
  for (let i = 0; i < total; i += 1) {
    const pathIndex = i % activePathCount();
    const path = WORLD.paths[pathIndex] || WORLD.paths[0];
    const progress = path.length * rand(0.18, 0.82);
    const pos = pointOnPath(pathIndex, progress);
    state.mines.push({
      id: entityId++,
      pathIndex,
      x: pos.x,
      y: pos.y,
      progress,
      radius: 42 * (1 + relicStat("mineRadius") + combatStats().mineRadius),
      damage: 95 + state.wave * 11 + state.techLevel * 14,
      armed: 0.25,
    });
  }
  if (!quiet) burst(WORLD.width * 0.55, WORLD.height * 0.58, TACTICS.mine.color, 18);
}

function updateMines(dt) {
  state.mines.forEach((mine) => {
    mine.armed = Math.max(0, mine.armed - dt);
    if (mine.armed > 0) return;
    const target = state.enemies.find((enemy) => enemy.hp > 0 && Math.hypot(enemy.x - mine.x, enemy.y - mine.y) < mine.radius);
    if (!target) return;
    state.enemies.forEach((enemy) => {
      if (enemy.hp > 0 && Math.hypot(enemy.x - mine.x, enemy.y - mine.y) < mine.radius * 1.25) {
        hitEnemy(enemy, mine.damage, { element: "fire", color: TACTICS.mine.color }, { pierce: 0.08 });
      }
    });
    if (relicStat("mineFireField")) {
      state.fireFields.push({
        id: entityId++,
        x: mine.x,
        y: mine.y,
        radius: mine.radius * 1.1,
        life: 4.2,
        tick: 0,
      });
    }
    burst(mine.x, mine.y, TACTICS.mine.color, 20);
    mine.dead = true;
  });
  state.mines = state.mines.filter((mine) => !mine.dead);
}

function updateFireFields(dt) {
  state.fireFields.forEach((field) => {
    field.life -= dt;
    field.tick -= dt;
    if (field.tick <= 0) {
      field.tick = 0.45;
      state.enemies.forEach((enemy) => {
        if (enemy.hp > 0 && Math.hypot(enemy.x - field.x, enemy.y - field.y) < field.radius) {
          hitEnemy(enemy, 18 + state.wave * 1.8, { element: "fire", color: TACTICS.mine.color }, { pierce: 0.04 });
        }
      });
    }
  });
  state.fireFields = state.fireFields.filter((field) => field.life > 0);
}

function startWaveBonuses() {
  state.energy = Math.min(state.maxEnergy, state.energy + relicStat("waveEnergy"));
  const shield = relicStat("waveShield") + combatStats().waveShield;
  if (shield > 0) {
    state.buffs.waveShield = shield;
    state.baseHp = Math.min(state.baseMaxHp, state.baseHp + shield);
  }
  if (relicStat("periodicLevel") > 0 && state.wave > 0 && state.wave % relicStat("periodicLevel") === 0) {
    const unit = [...state.units].sort((a, b) => a.level - b.level)[0];
    if (unit) {
      unit.level += 1;
      unit.maxHp *= 1.12;
      unit.hp = unit.maxHp;
      addFloater(unit.x, unit.y - 40, "青契 +1", "#77c66e");
    }
  }
}

function chooseAffixes(elite, type) {
  if (!elite && type !== "boss") return [];
  const count = type === "boss" ? 2 : state.wave >= 12 ? 2 : 1;
  const pool = [...ENEMY_AFFIXES].sort(() => Math.random() - 0.5);
  const ids = pool.slice(0, count).map((affix) => affix.id);
  const mutation = currentMutation();
  if (mutation.hasteBias && Math.random() < mutation.hasteBias && !ids.includes("haste")) ids[0] = "haste";
  if (mutation.shieldBonus && !ids.includes("shielded")) ids[0] = "shielded";
  return ids;
}

function splitEnemy(enemy) {
  const type = enemy.type === "golem" ? "shell" : "tide";
  const children = [];
  for (let i = 0; i < 2; i += 1) {
    const child = spawnEnemy(type, enemy.pathIndex, false);
    if (!child) continue;
    child.progress = Math.max(0, enemy.progress - 20 + i * 12);
    const pos = pointOnPath(enemy.pathIndex, child.progress);
    child.x = pos.x;
    child.y = pos.y + (i === 0 ? -12 : 12);
    child.hp *= 0.38;
    child.maxHp = child.hp;
    child.reward = Math.max(1, Math.round(child.reward * 0.25));
    children.push(child);
  }
  return children;
}

function updateBossPhase(enemy) {
  if (enemy.type !== "boss" || enemy.hp <= 0) return;
  const ratio = enemy.hp / enemy.maxHp;
  if (enemy.phase === 1 && ratio < 0.66) triggerBossPhase(enemy, 2);
  if (enemy.phase === 2 && ratio < 0.33) triggerBossPhase(enemy, 3);
}

function triggerBossPhase(enemy, phase) {
  enemy.phase = phase;
  enemy.shield += enemy.maxHp * 0.18 * Math.max(0.25, 1 - relicStat("bossShieldCut"));
  enemy.slowTimer = 0;
  addFloater(enemy.x, enemy.y - 58, `首领 ${phase} 段`, "#ffe28e");
  burst(enemy.x, enemy.y, ELEMENTS[enemy.element].color, 28);
  for (let i = 0; i < phase; i += 1) {
    const type = ["sprout", "cinder", "tide", "shell"][Math.floor(Math.random() * 4)];
    const minion = spawnEnemy(type, enemy.pathIndex, i === 0);
    if (minion) {
      minion.progress = Math.max(0, enemy.progress - 60 - i * 20);
      const pos = pointOnPath(enemy.pathIndex, minion.progress);
      minion.x = pos.x;
      minion.y = pos.y + rand(-24, 24);
    }
  }
}

function checkQueuedRewards() {
  if (state.modalOpen || state.gameOver) return;
  if (state.queuedRelicChoices > 0) {
    state.queuedRelicChoices -= 1;
    showRelicChoice();
    return;
  }
  if (state.queuedScenarioEvents > 0) {
    state.queuedScenarioEvents -= 1;
    showScenarioEvent();
  }
}

function showRelicChoice(filter = null) {
  const pool = [...CORE_GEAR, ...RELIC_POOL];
  const owned = new Set([...state.inventory, ...Object.values(state.loadouts || {}).flat(), ...state.relics]);
  const available = pool.filter((relic) => !owned.has(relic.id) && (!filter || filter(relic)));
  const choices = (available.length ? available : pool).sort(() => Math.random() - 0.5).slice(0, 3);
  state.modalOpen = true;
  ui.choiceTitle.textContent = "选择遗物";
  ui.choiceGrid.innerHTML = "";
  choices.forEach((relic) => {
    const card = document.createElement("button");
    card.className = "choice-card relic-card";
    card.type = "button";
    card.innerHTML = `
      <span class="choice-icon text-icon" data-label="遗" aria-hidden="true"></span>
      <strong>${relic.name}</strong>
      <span>${relic.rank}<br>${relic.desc}</span>
    `;
    card.addEventListener("click", () => {
      addRelic(relic);
      closeModal();
      showToast(`获得遗物：${relic.name}`);
      saveGame();
      updateUi();
    });
    ui.choiceGrid.appendChild(card);
  });
  ui.choiceNote.textContent = "遗物会改变整局构筑";
  ui.choiceModal.hidden = false;
}

function addRelic(relic) {
  if (!relic) return;
  if (CORE_GEAR.some((gear) => gear.id === relic.id)) {
    if (!state.inventory.includes(relic.id) && !Object.values(state.loadouts || {}).flat().includes(relic.id)) {
      state.inventory.push(relic.id);
    }
    return;
  }
  if (hasRelic(relic.id)) return;
  state.relics.push(relic.id);
  state.seenRelics[relic.id] = true;
  Object.entries(relic.stats || {}).forEach(([key, value]) => {
    state.relicStats[key] = (state.relicStats[key] || 0) + value;
  });
  if (relic.stats?.unitCap) state.unitCap += relic.stats.unitCap;
  if (relic.stats?.maxEnergy) state.maxEnergy += relic.stats.maxEnergy;
  if (relic.stats?.baseMaxPct) {
    state.baseMaxHp = Math.round(state.baseMaxHp * (1 + relic.stats.baseMaxPct));
    state.baseHp = Math.min(state.baseMaxHp, state.baseHp + state.baseMaxHp * relic.stats.baseMaxPct);
  }
}

function showScenarioEvent() {
  const event = SCENARIO_EVENTS[Math.floor(Math.random() * SCENARIO_EVENTS.length)];
  state.modalOpen = true;
  ui.choiceTitle.textContent = event.title;
  ui.choiceGrid.innerHTML = "";
  event.choices.forEach((choice) => {
    const card = document.createElement("button");
    card.className = "choice-card event-card";
    card.type = "button";
    card.innerHTML = `
      <span class="choice-icon text-icon" data-label="遇" aria-hidden="true"></span>
      <strong>${choice.title}</strong>
      <span>${choice.desc}</span>
    `;
    card.addEventListener("click", () => {
      applyScenarioEffect(choice.effect);
      closeModal();
      showToast(choice.title);
      saveGame();
      updateUi();
    });
    ui.choiceGrid.appendChild(card);
  });
  ui.choiceNote.textContent = event.note;
  ui.choiceModal.hidden = false;
}

function applyScenarioEffect(effect) {
  const gain = Math.round(160 + state.wave * 22 + state.territory * 55);
  if (effect === "buyMines") {
    const cost = Math.min(state.coins, Math.round(gain * 0.65));
    state.coins -= cost;
    placeMines(5);
  } else if (effect === "debtUnit") {
    const type = Object.keys(UNIT_TYPES)[Math.floor(Math.random() * Object.keys(UNIT_TYPES).length)];
    spawnUnit(type, WORLD.deployLeft + rand(55, 150), pathY(0, 0.64) + rand(-50, 50), true);
    state.eventDebt += 1;
  } else if (effect === "food") {
    state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 260);
    state.energy = Math.min(state.maxEnergy, state.energy + 36);
  } else if (effect === "metalBlessing") {
    state.relicStats.metalCrit = (state.relicStats.metalCrit || 0) + 0.06;
  } else if (effect === "waterBlessing") {
    state.relicStats.slowPower = (state.relicStats.slowPower || 0) + 0.12;
  } else if (effect === "earthBlessing") {
    state.baseMaxHp += 120;
    state.relicStats.baseDamageReduce = (state.relicStats.baseDamageReduce || 0) + 0.04;
  } else if (effect === "repairBridge") {
    state.relicStats.bridgeSlow = (state.relicStats.bridgeSlow || 0) + 0.04;
    rebuildPaths();
  } else if (effect === "breakBridge") {
    state.nextWaveEnemyCut += 1;
    state.nextWaveRewardCut += 1;
  } else if (effect === "ambush") {
    state.nextWaveMines += 6;
  } else if (effect === "takeCraftsmen") {
    state.baseMaxHp += 220;
    state.baseHp = Math.min(state.baseMaxHp, state.baseHp + 220);
    state.upgrades.discount *= 1.06;
  } else if (effect === "militia") {
    spawnUnit("guard", WORLD.deployLeft + rand(55, 140), pathY(0, 0.7), true);
    spawnUnit("rifle", WORLD.deployLeft + rand(95, 190), pathY(0, 0.62), true);
  } else if (effect === "escort") {
    state.energy = Math.min(state.maxEnergy, state.energy + 80);
  } else if (effect === "beacon") {
    state.weatherId = "clear";
    state.weatherClock = 45;
    state.relicStats.fireDamage = (state.relicStats.fireDamage || 0) + 0.08;
  } else if (effect === "listen") {
    state.relicStats.range = (state.relicStats.range || 0) + 0.08;
    state.eventDebt += 1;
  } else if (effect === "defRelic") {
    state.queuedRelicChoices += 1;
  } else if (effect === "mineGold") {
    state.coins += gain * 2;
    state.lifetimeCoins += gain * 2;
    state.spawnQueue.push({ at: 1.5, type: "golem", pathIndex: 0, elite: true });
  } else if (effect === "sealMine") {
    state.relicStats.armorBreak = (state.relicStats.armorBreak || 0) + 1;
  } else if (effect === "forgeArrows") {
    state.relicStats.damage = (state.relicStats.damage || 0) + 0.05;
    state.relicStats.pierce = (state.relicStats.pierce || 0) + 0.04;
  }
}

function achievementValue(type) {
  if (type === "kills") return state.kills;
  if (type === "wave") return state.wave;
  if (type === "relics") return state.relics.length;
  if (type === "territory") return state.territory;
  if (type === "tech") return state.techLevel;
  if (type === "highestUnit") return highestUnitLevel();
  if (type === "fullTeam") return currentUnitCount() >= state.unitCap ? 1 : 0;
  if (type === "fiveElements") return ELEMENT_ORDER.every((element) => synergyInfo().counts[element] > 0) ? 1 : 0;
  if (type === "maxEnergy") return state.maxEnergy;
  if (type === "lifetimeCoins") return state.lifetimeCoins;
  if (type === "bossKills") return state.bossKills;
  return 0;
}

function checkAchievements() {
  ACHIEVEMENTS.forEach((achievement) => {
    if (state.achievements[achievement.id]) return;
    if (achievementValue(achievement.type) < achievement.target) return;
    state.achievements[achievement.id] = true;
    state.latestAchievement = achievement.title;
    applyAchievementReward(achievement.reward || {});
    addFloater(WORLD.width * 0.5, WORLD.height * 0.16, `战功：${achievement.title}`, "#ffe28e");
    showToast(`战功达成：${achievement.title}`);
  });
}

function applyAchievementReward(reward) {
  if (reward.coins) {
    state.coins += reward.coins;
    state.lifetimeCoins += reward.coins;
  }
  if (reward.energy) {
    state.energy = Math.min(state.maxEnergy, state.energy + reward.energy);
  }
  if (reward.relic) {
    state.queuedRelicChoices += reward.relic;
  }
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

function switchTab(tabId) {
  state.activeTab = tabId;
  ui.sideTabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tabId));
  ui.sidePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabId));
  updateUi();
}

function renderFormationGrid() {
  if (!ui.formationGrid) return;
  ui.formationGrid.innerHTML = "";
  FORMATIONS.forEach((formation) => {
    const available = formationAvailable(formation);
    const recipe = ELEMENT_ORDER
      .filter((element) => formation.recipe?.[element])
      .map((element) => `${ELEMENTS[element].label}${formation.recipe[element]}`)
      .join(" ");
    const button = document.createElement("button");
    button.className = `formation-card${state.activeFormation === formation.id ? " active" : ""}`;
    button.type = "button";
    button.disabled = !available;
    button.innerHTML = `
      <strong>${formation.name}</strong>
      <span>${recipe || "无门槛"} · 克制 ${formation.counter}</span>
      <small>${formation.desc}</small>
    `;
    button.addEventListener("click", () => {
      if (!formationAvailable(formation)) {
        showToast("阵法人数不足");
        return;
      }
      state.activeFormation = formation.id;
      showToast(`切换阵法：${formation.name}`);
      saveGame();
      updateUi();
    });
    ui.formationGrid.appendChild(button);
  });
}

function renderLoadoutGrid() {
  if (!ui.loadout || !ui.inventory) return;
  ui.loadout.innerHTML = "";
  HERO_TYPES.forEach((type) => {
    const unit = state.units.find((item) => item.type === type);
    const card = document.createElement("div");
    card.className = "loadout-card";
    const gear = state.loadouts[type] || [];
    card.innerHTML = `
      <strong>${UNIT_TYPES[type].name} ${unit ? `Lv.${unit.level}` : ""}</strong>
      <span>${UNIT_TYPES[type].role}</span>
      <div class="slot-row" data-slot-row="${type}"></div>
    `;
    const row = card.querySelector("[data-slot-row]");
    for (let slot = 0; slot < 2; slot += 1) {
      const gearId = gear[slot];
      const item = gearById(gearId);
      const button = document.createElement("button");
      button.className = `gear-slot${gearId ? " filled" : ""}`;
      button.type = "button";
      button.textContent = item ? item.name : "空槽";
      button.addEventListener("click", () => {
        if (gearId) unequipGear(type, gearId);
        else equipSelectedGear(type);
      });
      row.appendChild(button);
    }
    ui.loadout.appendChild(card);
  });

  ui.inventory.innerHTML = "";
  state.inventory.forEach((gearId) => {
    const item = gearById(gearId);
    if (!item) return;
    const button = document.createElement("button");
    button.className = `inventory-card${state.selectedGear === gearId ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <strong>${item.name}</strong>
      <span>${item.rank || "普通"} · ${item.slot || "遗物"}</span>
      <small>${item.desc}</small>
    `;
    button.addEventListener("click", () => {
      state.selectedGear = state.selectedGear === gearId ? null : gearId;
      updateUi();
    });
    ui.inventory.appendChild(button);
  });
  if (ui.inventoryText) ui.inventoryText.textContent = state.selectedGear ? `已选 ${gearById(state.selectedGear)?.name}` : `背包 ${state.inventory.length} 件`;
}

function equipSelectedGear(type) {
  if (!state.selectedGear) {
    showToast("先在背包选择装备");
    return;
  }
  const slots = state.loadouts[type] || [];
  if (slots.length >= 2) {
    showToast("装备槽已满");
    return;
  }
  state.inventory = state.inventory.filter((id) => id !== state.selectedGear);
  slots.push(state.selectedGear);
  state.loadouts[type] = slots;
  const item = gearById(state.selectedGear);
  state.selectedGear = null;
  showToast(`装备：${item?.name || "装备"}`);
  saveGame();
  updateUi();
}

function unequipGear(type, gearId) {
  state.loadouts[type] = (state.loadouts[type] || []).filter((id) => id !== gearId);
  state.inventory.push(gearId);
  showToast(`卸下：${gearById(gearId)?.name || "装备"}`);
  saveGame();
  updateUi();
}

function ensureMarketStock(force = false) {
  if (!force && state.marketStock.length && state.wave - state.marketWave < 3) return;
  const gearDeals = CORE_GEAR.filter((gear) => !state.inventory.includes(gear.id) && !Object.values(state.loadouts || {}).flat().includes(gear.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  const choices = [...MARKET_ITEMS, ...gearDeals].sort(() => Math.random() - 0.5).slice(0, 4);
  state.marketStock = choices.map((item) => item.id);
  state.marketWave = state.wave;
}

function marketCost(item) {
  const base = item.baseCost || (item.rank === "史诗" ? 1800 : item.rank === "稀有" ? 1200 : 760);
  return Math.round(base * (1 + state.marketRefreshes * 0.08 + state.territory * 0.035));
}

function renderMarketGrid() {
  if (!ui.marketGrid) return;
  ensureMarketStock();
  ui.marketGrid.innerHTML = "";
  state.marketStock.forEach((id) => {
    const item = MARKET_ITEMS.find((entry) => entry.id === id) || CORE_GEAR.find((entry) => entry.id === id);
    if (!item) return;
    const cost = marketCost(item);
    const button = document.createElement("button");
    button.className = "market-card";
    button.type = "button";
    button.disabled = state.coins < cost || state.modalOpen || state.gameOver;
    button.innerHTML = `
      <strong>${item.name}</strong>
      <span>${item.type} · ${cost} 金币</span>
      <small>${item.desc}</small>
    `;
    button.addEventListener("click", () => buyMarketItem(item));
    ui.marketGrid.appendChild(button);
  });
}

function buyMarketItem(item) {
  const cost = marketCost(item);
  if (state.coins < cost) {
    showToast("金币不够");
    return;
  }
  state.coins -= cost;
  if (CORE_GEAR.some((gear) => gear.id === item.id)) {
    if (!state.inventory.includes(item.id)) state.inventory.push(item.id);
  } else {
    item.apply();
  }
  state.marketStock = state.marketStock.filter((id) => id !== item.id);
  showToast(`购买：${item.name}`);
  saveGame();
  updateUi();
}

function refreshMarket() {
  const cost = Math.round(180 + state.marketRefreshes * 90 + state.territory * 35);
  if (state.coins < cost) {
    showToast("金币不够");
    return;
  }
  state.coins -= cost;
  state.marketRefreshes += 1;
  ensureMarketStock(true);
  showToast("商店已刷新");
  saveGame();
  updateUi();
}

function renderChapterGrid() {
  if (!ui.chapterGrid) return;
  ui.chapterGrid.innerHTML = "";
  STORY_CHAPTERS.forEach((chapter) => {
    const unlocked = state.territory >= chapter.requiredTerritory;
    const button = document.createElement("button");
    button.className = `chapter-card${state.activeChapter === chapter.id ? " active" : ""}`;
    button.type = "button";
    button.disabled = !unlocked;
    button.innerHTML = `
      <strong>${chapter.name}</strong>
      <span>${unlocked ? chapter.boss : `需要领地 ${chapter.requiredTerritory}`}</span>
      <small>${chapter.desc}</small>
    `;
    button.addEventListener("click", () => selectChapter(chapter));
    ui.chapterGrid.appendChild(button);
  });
}

function selectChapter(chapter) {
  if (state.territory < chapter.requiredTerritory) {
    showToast("领地不足");
    return;
  }
  state.activeChapter = chapter.id;
  rebuildPaths();
  showToast(`进入主线：${chapter.name}`);
  saveGame();
  updateUi();
}

function updateUi() {
  if (ui.version) ui.version.textContent = "V11 五行英雄版";
  ui.coins.textContent = Math.floor(state.coins);
  ui.territory.textContent = state.territory;
  ui.wave.textContent = state.wave || 1;
  ui.base.textContent = `${Math.ceil(state.baseHp)}/${state.baseMaxHp}`;
  ui.cap.textContent = `兵力 ${currentUnitCount()}/${state.unitCap}`;
  if (ui.power) ui.power.textContent = `我方战力 ${playerPower()}`;
  if (ui.enemyPower) ui.enemyPower.textContent = `敌军预计 ${state.nextWavePower || wavePowerTarget()}`;
  const cap = techCap();
  if (ui.techStatus) ui.techStatus.textContent = `科技 ${state.techLevel}/${cap}`;
  ui.best.textContent = `最佳 ${Math.max(state.bestWave, state.wave)}`;
  ui.gift.textContent = `补给 ${state.wavesUntilGift}波`;
  if (ui.energy) ui.energy.textContent = `能量 ${Math.floor(state.energy)}/${Math.floor(state.maxEnergy)}`;
  if (ui.weather) ui.weather.textContent = `天气 ${currentWeather().name}`;
  if (ui.synergy) {
    const names = synergyInfo().names;
    ui.synergy.textContent = names.length ? `羁绊 ${names.slice(0, 2).join(" ")}` : "羁绊 未成阵";
  }
  if (ui.relic) {
    const lastRelic = state.relics[state.relics.length - 1];
    const relic = RELIC_POOL.find((item) => item.id === lastRelic);
    ui.relic.textContent = relic ? `遗物 ${state.relics.length} ${relic.name}` : `遗物 ${state.relics.length}`;
  }
  if (ui.objective) {
    ui.objective.textContent =
      state.wave >= 4 && (state.wave + 1) % 5 === 0
        ? `目标 准备首领 · ${currentMutation().name}`
        : `异变 ${currentMutation().name} · ${regionName()}`;
  }
  if (ui.achievement) {
    ui.achievement.textContent = state.latestAchievement
      ? `战功 ${Object.keys(state.achievements).length} ${state.latestAchievement}`
      : `战功 ${Object.keys(state.achievements).length}`;
  }
  ui.pauseIcon.textContent = state.paused ? "▶" : "II";
  ui.pauseBtn.setAttribute("aria-label", state.paused ? "继续" : "暂停");
  ui.speedBtn.textContent = `${state.speed}x`;

  const unit = selectedUnit();
  ui.selected.textContent = unit ? `${UNIT_TYPES[unit.type].name} Lv.${unit.level}` : "未选中";
  ui.upgradeSelectedBtn.textContent = unit ? `升级 ${selectedUpgradeCost()}` : "升级选中";
  ui.upgradeSelectedBtn.disabled = !unit || state.coins < selectedUpgradeCost() || state.modalOpen || state.gameOver;
  ui.claimBtn.textContent = state.canClaim ? `推进 ${claimCost()}` : "推进领地";
  ui.claimBtn.disabled = !state.canClaim || state.coins < claimCost() || state.modalOpen || state.gameOver;
  const techMaxed = state.techLevel >= cap;
  ui.techBtn.textContent = techMaxed ? `科技 Lv.${state.techLevel}/${cap}` : `科技 Lv.${state.techLevel}/${cap} · ${techCost()}`;
  ui.techBtn.disabled = state.modalOpen || state.gameOver || techMaxed || state.coins < techCost();

  Object.keys(UNIT_TYPES).forEach((type) => {
    const hero = state.units.find((unit) => unit.type === type);
    ui.costs[type].textContent = hero ? `Lv.${hero.level}` : "--";
  });

  ui.shopButtons.forEach((button) => {
    const type = button.dataset.hero;
    const hero = state.units.find((unit) => unit.type === type);
    button.disabled = state.gameOver || state.modalOpen || !hero;
    button.classList.toggle("active", hero?.id === state.selectedId);
  });

  Object.entries(TACTICS).forEach(([id, tactic]) => {
    const button = ui.tacticButtons[id];
    const status = ui.tacticStatus[id];
    if (!button || !status) return;
    const cooldown = state.tacticCooldowns[id] || 0;
    button.disabled = !canUseTactic(id);
    status.textContent = cooldown > 0 ? `${Math.ceil(cooldown)}秒` : `${tactic.cost} 能量`;
  });
  const formation = activeFormation();
  if (ui.formation) ui.formation.textContent = `当前：${formation.name}${formationAvailable(formation) ? "" : "（未成）"}`;
  if (ui.formationHint) ui.formationHint.textContent = formation.desc;
  if (ui.marketRefresh) ui.marketRefresh.textContent = `每 3 波刷新 · 手动刷新 ${Math.round(180 + state.marketRefreshes * 90 + state.territory * 35)}`;
  const chapter = activeChapter();
  if (ui.chapter) ui.chapter.textContent = `${chapter.name} · ${chapter.boss}`;
  if (ui.storyTitle) ui.storyTitle.textContent = chapter.title;
  if (ui.storyText) ui.storyText.textContent = chapter.desc;
  const renderSignature = [
    state.activeTab,
    state.activeFormation,
    state.marketStock.join(","),
    state.marketWave,
    state.marketRefreshes,
    state.activeChapter,
    state.inventory.join(","),
    Object.entries(state.loadouts || {}).map(([type, gear]) => `${type}:${gear.join(".")}`).join("|"),
    state.selectedGear || "",
    state.territory,
    state.coins,
    state.units.map((unit) => `${unit.type}${unit.level}`).join("|"),
  ].join(";");
  if (renderSignature !== sideRenderSignature) {
    sideRenderSignature = renderSignature;
    renderFormationGrid();
    renderLoadoutGrid();
    renderMarketGrid();
    renderChapterGrid();
  }
}

function render() {
  const w = WORLD.width;
  const h = WORLD.height;
  if (!w || !h) return;

  ctx.clearRect(0, 0, w, h);
  drawBackground(w, h);
  drawMapNodes(w, h);
  drawPaths();
  drawFireFields();
  drawMines();
  drawBase(w, h);
  drawEnemyFort(w, h);
  drawEntities();
  drawProjectiles();
  drawEffects();
  drawParticles();
  drawFloaters();
  drawForeground(w, h);
  drawWeatherOverlay(w, h);
}

function drawBackground(w, h) {
  const biome = BIOMES[activeChapter().biome ?? ((state.territory - 1) % BIOMES.length)];
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
  drawBiomeDecor(w, h, activeChapter().biome ?? ((state.territory - 1) % BIOMES.length));
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
    ctx.strokeStyle = active ? BIOMES[activeChapter().biome ?? ((state.territory - 1) % BIOMES.length)].path : "rgba(95, 79, 55, 0.42)";
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
  ctx.fillStyle = "#8f6c45";
  roundRect(x - 12, top - 8, 106, bottom - top + 16, 10, true, false);
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 5;
  roundRect(x - 12, top - 8, 106, bottom - top + 16, 10, false, true);
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
  roundRect(x - 14, top - 66, hpWidth + 20, 22, 9, true, false);
  ctx.fillStyle = hpPct > 0.35 ? "#cf4740" : "#edb248";
  roundRect(x - 10, top - 62, (hpWidth + 12) * hpPct, 14, 7, true, false);
  ctx.fillStyle = "#fff2c7";
  ctx.font = "900 12px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("城墙核心", x + 38, top - 75);
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
  const visualScale = actorScale();
  const scale = visualScale * (1 + Math.min(unit.level - 1, 8) * 0.045);
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

  ctx.globalAlpha = 0.28;
  ctx.fillStyle = elem.color;
  ctx.beginPath();
  ctx.arc(0, 0, 31, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

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

  const hpWidth = 44 * visualScale;
  drawHpBar(unit.x - hpWidth / 2, unit.y - 46 * visualScale - Math.max(0, scale - visualScale) * 18, hpWidth, unit.hp / unit.maxHp, "#77cf8a");
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
  const baseScale = enemy.type === "boss" ? 1.42 : enemy.type === "golem" ? 1.24 : enemy.type === "shell" ? 1.12 : 1;
  const scale = actorScale() * baseScale * (enemy.elite ? 1.14 : 1);
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
    ctx.fillStyle = "#ffe28e";
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 3;
    ctx.font = "900 14px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(enemy.type === "boss" ? "王" : "精", 0, 8);
    ctx.fillText(enemy.type === "boss" ? "王" : "精", 0, 8);
  }

  if (enemy.shield > 0) {
    ctx.strokeStyle = "#9ed0d2";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(0, -3, 31, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (enemy.affixes?.length) {
    enemy.affixes.slice(0, 2).forEach((affixId, index) => {
      const affix = ENEMY_AFFIXES.find((item) => item.id === affixId);
      if (!affix) return;
      ctx.fillStyle = affix.color;
      ctx.strokeStyle = "#1b1713";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-14 + index * 28, 27, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1b1713";
      ctx.font = "900 9px Microsoft YaHei, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(affix.name, -14 + index * 28, 30);
    });
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
  if (enemy.shield > 0) {
    drawHpBar(x - 25 * scale, y - 58 * scale, 50 * scale, enemy.shield / enemy.maxHp, "#9ed0d2");
  }
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
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = projectile.splash ? 7 : 4;
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = projectile.splash ? 12 : 7;
      ctx.beginPath();
      ctx.moveTo(projectile.prevX, projectile.prevY);
      ctx.lineTo(projectile.x, projectile.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.splash ? 6 : 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawMines() {
  state.mines.forEach((mine) => {
    const pulse = 0.75 + Math.sin(state.time * 7 + mine.id) * 0.25;
    ctx.save();
    ctx.translate(mine.x, mine.y);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 7, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = TACTICS.mine.color;
    ctx.strokeStyle = "#1b1713";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = `rgba(232, 104, 71, ${0.3 * pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, mine.radius * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function drawFireFields() {
  state.fireFields.forEach((field) => {
    const t = clamp(field.life / 4.2, 0, 1);
    const gradient = ctx.createRadialGradient(field.x, field.y, 0, field.x, field.y, field.radius);
    gradient.addColorStop(0, `rgba(255, 206, 90, ${0.24 * t})`);
    gradient.addColorStop(1, `rgba(232, 104, 71, ${0.02 * t})`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2);
    ctx.fill();
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

function drawWeatherOverlay(w, h) {
  const weather = currentWeather();
  ctx.fillStyle = weather.tint || "rgba(255,255,255,0)";
  ctx.fillRect(0, 0, w, h);
  if (weather.id === "rain" || weather.id === "storm") {
    ctx.strokeStyle = weather.id === "storm" ? "rgba(210, 218, 255, 0.42)" : "rgba(190, 228, 248, 0.34)";
    ctx.lineWidth = weather.id === "storm" ? 2 : 1;
    for (let i = 0; i < 55; i += 1) {
      const x = (i * 97 + state.weatherSeed * 41 + state.time * 180) % (w + 120) - 60;
      const y = (i * 53 + state.time * 420) % (h + 80) - 40;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 14, y + 28);
      ctx.stroke();
    }
  }
  if (weather.id === "fog") {
    ctx.fillStyle = "rgba(230, 235, 222, 0.06)";
    for (let i = 0; i < 7; i += 1) {
      const x = ((i * 173 + state.time * 24) % (w + 180)) - 90;
      const y = h * (0.28 + (i % 5) * 0.1);
      ctx.beginPath();
      ctx.ellipse(x, y, 120, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
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

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX || event.touches?.[0]?.clientX || 0) - rect.left,
    y: (event.clientY || event.touches?.[0]?.clientY || 0) - rect.top,
  };
}

function unitAt(x, y) {
  const radius = WORLD.width > 760 ? 24 : 32;
  return [...state.units].reverse().find((unit) => Math.hypot(unit.x - x, unit.y - y) <= radius);
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
    version: 7,
    wave: state.wave,
    nextWavePower: state.nextWavePower,
    currentWavePower: state.currentWavePower,
    activeTab: state.activeTab,
    activeFormation: state.activeFormation,
    formationMastery: state.formationMastery,
    marketStock: state.marketStock,
    marketWave: state.marketWave,
    marketRefreshes: state.marketRefreshes,
    activeChapter: state.activeChapter,
    completedChapters: state.completedChapters,
    inventory: state.inventory,
    loadouts: state.loadouts,
    selectedGear: state.selectedGear,
    bridgeCount: state.bridgeCount,
    territory: state.territory,
    canClaim: state.canClaim,
    wavesUntilGift: state.wavesUntilGift,
    coins: state.coins,
    lifetimeCoins: state.lifetimeCoins,
    energy: state.energy,
    maxEnergy: state.maxEnergy,
    weatherId: state.weatherId,
    weatherClock: state.weatherClock,
    waveMutationId: state.waveMutationId,
    nextEventWave: state.nextEventWave,
    queuedRelicChoices: state.queuedRelicChoices,
    queuedScenarioEvents: state.queuedScenarioEvents,
    eventDebt: state.eventDebt,
    nextWaveMines: state.nextWaveMines,
    nextWaveEnemyCut: state.nextWaveEnemyCut,
    nextWaveRewardCut: state.nextWaveRewardCut,
    nextWavePowerMod: state.nextWavePowerMod,
    forceBoss: state.forceBoss,
    nextBossReward: state.nextBossReward,
    nextChoiceAt: state.nextChoiceAt,
    choices: state.choices,
    kills: state.kills,
    bossKills: state.bossKills,
    achievements: state.achievements,
    latestAchievement: state.latestAchievement,
    baseHp: state.baseHp,
    baseMaxHp: state.baseMaxHp,
    unitCap: state.unitCap,
    bought: state.bought,
    techLevel: state.techLevel,
    tech: state.tech,
    relics: state.relics,
    seenRelics: state.seenRelics,
    relicStats: state.relicStats,
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
  if (!parsed || parsed.version !== 7) throw new Error("bad save");
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
    if (!saved || saved.version !== 7) return false;

    state.wave = saved.wave || 0;
    state.nextWavePower = saved.nextWavePower || 0;
    state.currentWavePower = saved.currentWavePower || 0;
    state.activeTab = saved.activeTab || state.activeTab;
    state.activeFormation = saved.activeFormation || state.activeFormation;
    state.formationMastery = saved.formationMastery || 0;
    state.marketStock = Array.isArray(saved.marketStock) ? saved.marketStock.filter((id) => MARKET_ITEMS.some((item) => item.id === id)) : [];
    state.marketWave = saved.marketWave || 0;
    state.marketRefreshes = saved.marketRefreshes || 0;
    state.activeChapter = STORY_CHAPTERS.some((chapter) => chapter.id === saved.activeChapter) ? saved.activeChapter : state.activeChapter;
    state.completedChapters = { ...(saved.completedChapters || {}) };
    state.inventory = Array.isArray(saved.inventory) ? saved.inventory.filter((id) => gearById(id)) : state.inventory;
    state.loadouts = { ...state.loadouts, ...(saved.loadouts || {}) };
    HERO_TYPES.forEach((type) => {
      state.loadouts[type] = (state.loadouts[type] || []).filter((id) => gearById(id)).slice(0, 2);
    });
    state.selectedGear = saved.selectedGear || null;
    state.bridgeCount = saved.bridgeCount || 1;
    state.territory = saved.territory || 1;
    state.canClaim = !!saved.canClaim;
    state.wavesUntilGift = saved.wavesUntilGift || 3;
    state.coins = saved.coins ?? state.coins;
    state.lifetimeCoins = saved.lifetimeCoins || 0;
    state.energy = saved.energy ?? state.energy;
    state.maxEnergy = saved.maxEnergy ?? state.maxEnergy;
    state.weatherId = saved.weatherId || state.weatherId;
    state.weatherClock = saved.weatherClock ?? state.weatherClock;
    state.waveMutationId = saved.waveMutationId || state.waveMutationId;
    state.nextEventWave = saved.nextEventWave || state.nextEventWave;
    state.queuedRelicChoices = saved.queuedRelicChoices || 0;
    state.queuedScenarioEvents = saved.queuedScenarioEvents || 0;
    state.eventDebt = saved.eventDebt || 0;
    state.nextWaveMines = saved.nextWaveMines || 0;
    state.nextWaveEnemyCut = saved.nextWaveEnemyCut || 0;
    state.nextWaveRewardCut = saved.nextWaveRewardCut || 0;
    state.nextWavePowerMod = saved.nextWavePowerMod || 1;
    state.forceBoss = saved.forceBoss || 0;
    state.nextBossReward = saved.nextBossReward || 1;
    state.choices = saved.choices || 0;
    state.nextChoiceAt = saved.nextChoiceAt || state.lifetimeCoins + nextAbilityRequirement();
    const nextGap = Math.max(1500, nextAbilityRequirement());
    if (saved.version < 4 || state.nextChoiceAt <= state.lifetimeCoins || state.nextChoiceAt - state.lifetimeCoins > nextGap * 6) {
      state.nextChoiceAt = state.lifetimeCoins + nextAbilityRequirement();
    }
    state.kills = saved.kills || 0;
    state.bossKills = saved.bossKills || 0;
    state.achievements = { ...(saved.achievements || {}) };
    state.latestAchievement = saved.latestAchievement || "";
    state.baseHp = saved.baseHp || state.baseHp;
    state.baseMaxHp = saved.baseMaxHp || state.baseMaxHp;
    state.unitCap = Math.min(saved.unitCap || state.unitCap, 8 + Math.floor(state.territory / 4) + relicStat("unitCap"));
    state.bought = { ...state.bought, ...(saved.bought || {}) };
    state.tech = { ...state.tech, ...(saved.tech || {}) };
    state.techLevel =
      Number.isFinite(saved.techLevel)
        ? Math.max(0, Math.floor(saved.techLevel))
        : Math.max(0, ...Object.values(saved.tech || {}).map((level) => Number(level) || 0));
    state.relics = Array.isArray(saved.relics) ? saved.relics.filter((id) => RELIC_POOL.some((relic) => relic.id === id)) : [];
    state.seenRelics = { ...(saved.seenRelics || {}) };
    state.relicStats = { ...(saved.relicStats || {}) };
    if (!Object.keys(state.relicStats).length && state.relics.length) {
      state.relics.forEach((id) => {
        const relic = RELIC_POOL.find((item) => item.id === id);
        Object.entries(relic?.stats || {}).forEach(([key, value]) => {
          state.relicStats[key] = (state.relicStats[key] || 0) + value;
        });
        state.seenRelics[id] = true;
      });
    }
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
    state.techLevel = Math.min(state.techLevel, highestUnitLevel());
    state.tech = {
      arms: state.techLevel,
      fort: state.techLevel,
      supply: state.techLevel,
      alchemy: state.techLevel,
    };
    compactArmyIfNeeded();
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
  spawnUnit("rifle", WORLD.deployLeft + 70, pathY(0, 0.67) - 82, true);
  spawnUnit("medic", WORLD.deployLeft + 0, pathY(0, 0.67) - 38, true);
  spawnUnit("mage", WORLD.deployLeft + 130, pathY(0, 0.67) - 16, true);
  spawnUnit("turret", WORLD.deployLeft + 72, pathY(0, 0.67) + 36, true);
  spawnUnit("guard", WORLD.deployLeft + 10, pathY(0, 0.67) + 84, true);
}

function init() {
  state = createDefaultState();
  resizeCanvas();
  if (resizeObserver) resizeObserver.disconnect();
  resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);

  ui.shopButtons.forEach((button) => {
    button.addEventListener("click", () => selectHero(button.dataset.hero));
  });
  ui.sideTabs.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });
  ui.refreshMarketBtn?.addEventListener("click", refreshMarket);
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
  ui.techBtn.addEventListener("click", upgradeTech);
  ui.claimBtn.addEventListener("click", claimTerritory);
  Object.entries(ui.tacticButtons).forEach(([id, button]) => {
    button?.addEventListener("click", () => useTactic(id));
  });
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

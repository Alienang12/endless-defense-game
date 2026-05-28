const SAVE_KEY = "threeKingdomsFormationS1";

const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  city: document.getElementById("cityText"),
  population: document.getElementById("populationText"),
  grain: document.getElementById("grainText"),
  arms: document.getElementById("armsText"),
  morale: document.getElementById("moraleText"),
  pauseBtn: document.getElementById("pauseBtn"),
  pauseIcon: document.getElementById("pauseIcon"),
  speedBtn: document.getElementById("speedBtn"),
  ribbon: document.getElementById("battleRibbon"),
  toast: document.getElementById("toast"),
  stageTitle: document.getElementById("stageTitle"),
  stageMeta: document.getElementById("stageMeta"),
  allyPower: document.getElementById("allyPowerText"),
  enemyPower: document.getElementById("enemyPowerText"),
  tabs: [...document.querySelectorAll("[data-tab]")],
  panels: [...document.querySelectorAll("[data-panel]")],
  selectedText: document.getElementById("selectedText"),
  rosterGrid: document.getElementById("rosterGrid"),
  formationText: document.getElementById("formationText"),
  formationGrid: document.getElementById("formationGrid"),
  terrainCard: document.getElementById("terrainCard"),
  campaignText: document.getElementById("campaignText"),
  stageGrid: document.getElementById("stageGrid"),
  counterBoard: document.getElementById("counterBoard"),
  logList: document.getElementById("logList"),
  startBtn: document.getElementById("startBtn"),
  saveBtn: document.getElementById("saveBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  saveModal: document.getElementById("saveModal"),
  saveTitle: document.getElementById("saveTitle"),
  saveText: document.getElementById("saveText"),
  copySaveBtn: document.getElementById("copySaveBtn"),
  loadSaveBtn: document.getElementById("loadSaveBtn"),
  closeSaveBtn: document.getElementById("closeSaveBtn"),
  resultModal: document.getElementById("resultModal"),
  resultKicker: document.getElementById("resultKicker"),
  resultTitle: document.getElementById("resultTitle"),
  resultText: document.getElementById("resultText"),
  nextStageBtn: document.getElementById("nextStageBtn"),
  retryBtn: document.getElementById("retryBtn"),
};

const TROOPS = {
  shield: {
    name: "盾兵",
    short: "盾",
    weapon: "shield",
    color: "#75877c",
    hp: 170,
    atk: 12,
    range: 44,
    cooldown: 1.02,
    speed: 34,
    role: "护阵抗线",
  },
  spear: {
    name: "枪兵",
    short: "枪",
    weapon: "spear",
    color: "#b7a05c",
    hp: 125,
    atk: 18,
    range: 62,
    cooldown: 0.95,
    speed: 38,
    role: "克制骑兵",
  },
  cavalry: {
    name: "骑兵",
    short: "骑",
    weapon: "horse",
    color: "#8b6243",
    hp: 142,
    atk: 22,
    range: 48,
    cooldown: 1.08,
    speed: 58,
    role: "突袭后排",
  },
  archer: {
    name: "弓兵",
    short: "弓",
    weapon: "bow",
    color: "#caa34f",
    hp: 88,
    atk: 16,
    range: 220,
    cooldown: 1.12,
    speed: 31,
    role: "远程压制",
  },
  strategist: {
    name: "谋士",
    short: "谋",
    weapon: "fan",
    color: "#96b9d0",
    hp: 82,
    atk: 14,
    range: 190,
    cooldown: 1.42,
    speed: 29,
    role: "计策控制",
  },
  navy: {
    name: "水军",
    short: "水",
    weapon: "boat",
    color: "#4f93a3",
    hp: 126,
    atk: 19,
    range: 128,
    cooldown: 1.02,
    speed: 36,
    role: "河岸强势",
  },
  siege: {
    name: "器械",
    short: "器",
    weapon: "shield",
    color: "#9b8060",
    hp: 190,
    atk: 25,
    range: 176,
    cooldown: 1.62,
    speed: 22,
    role: "破城重击",
  },
};

const TERRAIN = {
  forest: {
    name: "森林",
    icon: "forest",
    desc: "弓兵、谋士适合伏击；骑兵受阻。",
    tags: ["弓兵伤害 +18%", "谋士控制 +18%", "骑兵伤害 -18%"],
  },
  plain: {
    name: "平原",
    icon: "plain",
    desc: "骑兵冲锋最强，阵线展开很快。",
    tags: ["骑兵伤害 +24%", "枪兵克骑更明显", "弓兵无掩护"],
  },
  river: {
    name: "河岸",
    icon: "river",
    desc: "水军和火攻变得关键，重骑很难展开。",
    tags: ["水军伤害 +48%", "弓兵射程 +10%", "骑兵伤害 -25%"],
  },
  mountain: {
    name: "山道",
    icon: "mountain",
    desc: "狭路利于盾枪和弓兵，骑兵难以发挥。",
    tags: ["盾枪生命 +16%", "弓兵伤害 +14%", "骑兵速度 -25%"],
  },
  city: {
    name: "城寨",
    icon: "city",
    desc: "器械、盾兵、谋士更能影响战局。",
    tags: ["盾兵减伤 +16%", "器械伤害 +22%", "谋士伤害 +10%"],
  },
};

const GENERALS = {
  liu_bei: {
    name: "刘备",
    surname: "刘",
    faction: "蜀",
    troop: "shield",
    title: "仁德主将",
    traits: ["士气", "护阵"],
    power: 76,
    leadership: 18,
    tactic: "每 8 秒鼓舞附近友军，恢复士气和少量生命。",
  },
  guan_yu: {
    name: "关羽",
    surname: "关",
    faction: "蜀",
    troop: "cavalry",
    title: "青龙突骑",
    traits: ["突击", "破阵"],
    power: 94,
    leadership: 14,
    tactic: "首次接敌造成重击，适合锋矢阵突入敌阵。",
  },
  zhang_fei: {
    name: "张飞",
    surname: "张",
    faction: "蜀",
    troop: "spear",
    title: "怒枪先锋",
    traits: ["枪阵", "震慑"],
    power: 91,
    leadership: 10,
    tactic: "对骑兵额外压制，低血时攻击提高。",
  },
  zhao_yun: {
    name: "赵云",
    surname: "赵",
    faction: "蜀",
    troop: "cavalry",
    title: "银枪轻骑",
    traits: ["机动", "切后"],
    power: 92,
    leadership: 12,
    tactic: "优先追击弓兵和谋士，平原战更强。",
  },
  zhuge_liang: {
    name: "诸葛亮",
    surname: "诸",
    faction: "蜀",
    troop: "strategist",
    title: "八卦谋主",
    traits: ["计策", "控场"],
    power: 96,
    leadership: 20,
    tactic: "降低敌方攻速，八卦阵下效果翻倍。",
  },
  huang_zhong: {
    name: "黄忠",
    surname: "黄",
    faction: "蜀",
    troop: "archer",
    title: "老弓神射",
    traits: ["远程", "破盾"],
    power: 88,
    leadership: 9,
    tactic: "站位越稳定，远程命中越高。",
  },
  wei_yan: {
    name: "魏延",
    surname: "魏",
    faction: "蜀",
    troop: "spear",
    title: "奇袭枪将",
    traits: ["山地", "奇袭"],
    power: 84,
    leadership: 7,
    tactic: "山地和森林里伤害提高。",
  },
  ma_chao: {
    name: "马超",
    surname: "马",
    faction: "蜀",
    troop: "cavalry",
    title: "西凉铁骑",
    traits: ["骑兵", "冲锋"],
    power: 90,
    leadership: 8,
    tactic: "平原冲锋极强，但河岸受限。",
  },
  jiang_wei: {
    name: "姜维",
    surname: "姜",
    faction: "蜀",
    troop: "strategist",
    title: "奇谋枪策",
    traits: ["谋略", "枪策"],
    power: 82,
    leadership: 11,
    tactic: "对被枪兵牵制的敌人造成额外谋略伤害。",
  },
  cao_cao: {
    name: "曹操",
    surname: "曹",
    faction: "魏",
    troop: "shield",
    title: "魏武统帅",
    traits: ["统帅", "压阵"],
    power: 96,
    leadership: 22,
    tactic: "全军稳定推进，士气越高越难击溃。",
  },
  xiahou_dun: {
    name: "夏侯惇",
    surname: "夏",
    faction: "魏",
    troop: "cavalry",
    title: "刚烈铁骑",
    traits: ["骑兵", "猛冲"],
    power: 88,
    leadership: 10,
    tactic: "正面冲锋强，怕枪阵拦截。",
  },
  cao_ren: {
    name: "曹仁",
    surname: "仁",
    faction: "魏",
    troop: "shield",
    title: "坚城盾军",
    traits: ["盾墙", "守势"],
    power: 86,
    leadership: 16,
    tactic: "盾墙降低远程伤害。",
  },
  yu_jin: {
    name: "于禁",
    surname: "于",
    faction: "魏",
    troop: "spear",
    title: "严整枪阵",
    traits: ["枪阵", "军纪"],
    power: 81,
    leadership: 13,
    tactic: "阵线完整时克骑效果更强。",
  },
  zhang_liao: {
    name: "张辽",
    surname: "辽",
    faction: "魏",
    troop: "cavalry",
    title: "突袭名将",
    traits: ["突袭", "骑兵"],
    power: 94,
    leadership: 15,
    tactic: "优先冲击后排。",
  },
  xiahou_yuan: {
    name: "夏侯渊",
    surname: "渊",
    faction: "魏",
    troop: "archer",
    title: "急袭弓骑",
    traits: ["远程", "机动"],
    power: 86,
    leadership: 10,
    tactic: "山地弓击更强。",
  },
  xu_huang: {
    name: "徐晃",
    surname: "徐",
    faction: "魏",
    troop: "spear",
    title: "破围重枪",
    traits: ["破阵", "枪兵"],
    power: 87,
    leadership: 12,
    tactic: "对密集阵型有额外伤害。",
  },
  sima_yi: {
    name: "司马懿",
    surname: "司",
    faction: "魏",
    troop: "strategist",
    title: "深谋反制",
    traits: ["谋略", "反制"],
    power: 97,
    leadership: 19,
    tactic: "削弱敌方主将输出。",
  },
  zhang_he: {
    name: "张郃",
    surname: "郃",
    faction: "魏",
    troop: "cavalry",
    title: "巧变骑军",
    traits: ["机动", "变阵"],
    power: 86,
    leadership: 12,
    tactic: "能绕开慢速盾兵。",
  },
  cai_mao: {
    name: "蔡瑁",
    surname: "蔡",
    faction: "魏",
    troop: "navy",
    title: "荆州水军",
    traits: ["水战", "船阵"],
    power: 79,
    leadership: 11,
    tactic: "河岸战获得大量增益。",
  },
  wen_pin: {
    name: "文聘",
    surname: "文",
    faction: "魏",
    troop: "navy",
    title: "江防水军",
    traits: ["水军", "防守"],
    power: 82,
    leadership: 13,
    tactic: "水战防御稳定。",
  },
  guo_huai: {
    name: "郭淮",
    surname: "郭",
    faction: "魏",
    troop: "shield",
    title: "稳守营垒",
    traits: ["盾军", "守势"],
    power: 83,
    leadership: 14,
    tactic: "城寨地形减伤。",
  },
};

const PLAYER_ROSTER = ["liu_bei", "guan_yu", "zhang_fei", "zhao_yun", "zhuge_liang", "huang_zhong", "wei_yan", "ma_chao", "jiang_wei"];

const FORMATIONS = {
  wedge: {
    name: "锋矢阵",
    desc: "主将突前，骑兵和枪兵突破强，适合平原和突袭。",
    best: "关羽、赵云、马超",
    bonuses: { cavalry: 1.22, spear: 1.12, incoming: 1.04 },
    positions: [
      [0.56, 0.5],
      [0.38, 0.35],
      [0.38, 0.65],
      [0.18, 0.26],
      [0.18, 0.74],
    ],
  },
  fish: {
    name: "鱼鳞阵",
    desc: "中军厚实，盾枪更耐打，适合抗骑兵和守城。",
    best: "刘备、张飞、曹仁",
    bonuses: { shield: 1.2, spear: 1.16, defense: 0.88 },
    positions: [
      [0.43, 0.5],
      [0.3, 0.34],
      [0.3, 0.66],
      [0.16, 0.42],
      [0.16, 0.58],
    ],
  },
  crane: {
    name: "鹤翼阵",
    desc: "两翼展开，弓兵远程压制强，但中线怕骑兵冲破。",
    best: "黄忠、夏侯渊",
    bonuses: { archer: 1.25, strategist: 1.08, incoming: 1.08 },
    positions: [
      [0.32, 0.5],
      [0.2, 0.22],
      [0.2, 0.78],
      [0.08, 0.34],
      [0.08, 0.66],
    ],
  },
  bagua: {
    name: "八卦阵",
    desc: "谋士控场和减伤优秀，适合以弱胜强。",
    best: "诸葛亮、司马懿",
    bonuses: { strategist: 1.34, defense: 0.9, control: 1.3 },
    positions: [
      [0.35, 0.5],
      [0.23, 0.3],
      [0.23, 0.7],
      [0.1, 0.38],
      [0.1, 0.62],
    ],
  },
  snake: {
    name: "长蛇阵",
    desc: "狭路山林强，队列灵活，但平原容易被冲散。",
    best: "魏延、姜维",
    bonuses: { mountain: 1.22, forest: 1.18, cavalry: 0.92 },
    positions: [
      [0.48, 0.24],
      [0.38, 0.38],
      [0.28, 0.52],
      [0.18, 0.66],
      [0.08, 0.8],
    ],
  },
  fleet: {
    name: "水师阵",
    desc: "河岸与水军极强，离水后收益明显下降。",
    best: "水军、弓兵",
    bonuses: { navy: 1.36, archer: 1.1, river: 1.2 },
    positions: [
      [0.42, 0.43],
      [0.42, 0.61],
      [0.24, 0.32],
      [0.24, 0.72],
      [0.1, 0.52],
    ],
  },
};

const STAGES = [
  {
    id: "bowang",
    title: "博望坡伏击",
    terrain: "forest",
    enemyFormation: "fish",
    desc: "森林伏击战。敌方骑兵先压上来，火攻和谋士控场能扭转战力差。",
    enemy: ["xiahou_dun", "yu_jin", "cao_ren", "xiahou_yuan"],
    reward: { grain: 28, arms: 16, morale: 8 },
  },
  {
    id: "changban",
    title: "长坂坡突围",
    terrain: "plain",
    enemyFormation: "wedge",
    desc: "平原骑兵冲击很强。枪兵拦骑、盾兵护后排是重点。",
    enemy: ["zhang_liao", "xiahou_dun", "cao_ren", "yu_jin", "xiahou_yuan"],
    reward: { population: 3, grain: 22, morale: 10 },
  },
  {
    id: "chibi_scout",
    title: "赤壁前哨",
    terrain: "river",
    enemyFormation: "fleet",
    desc: "河岸战。水军很强，弓兵和谋士能配合压制船阵。",
    enemy: ["cai_mao", "wen_pin", "cao_cao", "xiahou_yuan"],
    reward: { arms: 28, grain: 20, morale: 8 },
  },
  {
    id: "hanzhong",
    title: "汉中山道",
    terrain: "mountain",
    enemyFormation: "snake",
    desc: "山地狭路。盾枪弓兵有优势，骑兵冲锋会被地形限制。",
    enemy: ["xu_huang", "xiahou_yuan", "zhang_he", "guo_huai"],
    reward: { arms: 24, grain: 24, morale: 12 },
  },
  {
    id: "jieting",
    title: "街亭危机",
    terrain: "city",
    enemyFormation: "bagua",
    desc: "城寨营垒战。司马懿的反制很强，需要阵法与兵种克制同时正确。",
    enemy: ["sima_yi", "zhang_he", "guo_huai", "xu_huang", "cao_ren"],
    reward: { population: 4, grain: 40, arms: 36, morale: 16 },
  },
];

const COUNTER_ROWS = [
  ["枪", "枪兵克骑兵，平原尤其明显。"],
  ["骑", "骑兵克弓兵和谋士，但怕枪阵、河流和山道。"],
  ["弓", "弓兵压制盾枪慢阵，森林和山地更强。"],
  ["盾", "盾兵抗远程、护中军，适合城寨和鱼鳞阵。"],
  ["谋", "谋士克密集阵和慢速阵，怕骑兵切入。"],
  ["水", "水军在河岸战大幅增强，离水只是普通部队。"],
];

let state;
let lastFrame = 0;
let resizeObserver;
let renderSignature = "";

function createState() {
  return {
    activeTab: "roster",
    stageIndex: 0,
    unlockedStage: 0,
    selected: ["guan_yu", "zhang_fei", "zhao_yun", "zhuge_liang", "huang_zhong"],
    formation: "wedge",
    resources: {
      city: "新野",
      population: 18,
      grain: 120,
      arms: 80,
      morale: 70,
    },
    paused: false,
    speed: 1,
    battle: null,
    log: ["选择武将与阵法后开战。兵种、阵法、地形都会直接改变伤害。"],
    completed: {},
  };
}

function activeStage() {
  return STAGES[state.stageIndex] || STAGES[0];
}

function activeFormation() {
  return FORMATIONS[state.formation] || FORMATIONS.wedge;
}

function troopOf(generalId) {
  return TROOPS[GENERALS[generalId].troop];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function addLog(text) {
  state.log.unshift(text);
  state.log = state.log.slice(0, 12);
}

function showToast(text) {
  ui.toast.textContent = text;
  ui.toast.classList.remove("show");
  void ui.toast.offsetWidth;
  ui.toast.classList.add("show");
}

function showRibbon(text) {
  ui.ribbon.textContent = text;
  ui.ribbon.classList.remove("show");
  void ui.ribbon.offsetWidth;
  ui.ribbon.classList.add("show");
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (state?.battle?.status === "fighting") {
    repositionUnits();
  }
}

function battlefield() {
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  return {
    w,
    h,
    left: Math.max(64, w * 0.07),
    right: w - Math.max(64, w * 0.07),
    top: Math.max(118, h * 0.18),
    bottom: h - Math.max(48, h * 0.1),
    mid: w * 0.5,
  };
}

function sidePositions(side, formationId, count) {
  const field = battlefield();
  const formation = FORMATIONS[formationId] || FORMATIONS.wedge;
  const points = formation.positions.slice(0, count);
  const halfWidth = (field.mid - field.left) * 0.92;
  const height = field.bottom - field.top;
  return points.map(([px, py]) => {
    const x = side === "ally" ? field.left + px * halfWidth : field.right - px * halfWidth;
    return { x, y: field.top + py * height };
  });
}

function generalPower(generalId, formationId = state.formation, terrainId = activeStage().terrain) {
  const general = GENERALS[generalId];
  const troop = TROOPS[general.troop];
  const formation = FORMATIONS[formationId] || FORMATIONS.wedge;
  const terrainMod = terrainMultiplier(general.troop, terrainId, "attack");
  const formMod = formationAttackMultiplier(general.troop, formation, terrainId);
  return Math.round((general.power * 2.2 + troop.hp * 0.34 + troop.atk * 9 + general.leadership * 2) * terrainMod * formMod);
}

function armyPower(ids, formationId, terrainId) {
  return ids.reduce((sum, id) => sum + generalPower(id, formationId, terrainId), 0);
}

function selectedPower() {
  const stage = activeStage();
  const resourceMod = 0.86 + state.resources.morale / 180 + Math.min(0.18, state.resources.arms / 500);
  return Math.round(armyPower(state.selected, state.formation, stage.terrain) * resourceMod);
}

function enemyPower() {
  const stage = activeStage();
  return armyPower(stage.enemy, stage.enemyFormation, stage.terrain);
}

function toggleGeneral(id) {
  if (state.battle?.status === "fighting") return;
  const exists = state.selected.includes(id);
  if (exists) {
    if (state.selected.length <= 3) {
      showToast("至少带 3 名武将");
      return;
    }
    state.selected = state.selected.filter((item) => item !== id);
  } else {
    if (state.selected.length >= 5) {
      showToast("最多带 5 名武将");
      return;
    }
    state.selected.push(id);
  }
  saveGame();
  updateUi(true);
}

function selectFormation(id) {
  if (state.battle?.status === "fighting") return;
  state.formation = id;
  addLog(`改用${FORMATIONS[id].name}。`);
  saveGame();
  updateUi(true);
}

function selectStage(index) {
  if (state.battle?.status === "fighting") return;
  if (index > state.unlockedStage) {
    showToast("先通过前置关卡");
    return;
  }
  state.stageIndex = index;
  state.battle = null;
  addLog(`进入关卡：${STAGES[index].title}。`);
  saveGame();
  updateUi(true);
}

function switchTab(tab) {
  state.activeTab = tab;
  ui.tabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  ui.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
  saveGame();
}

function startBattle() {
  if (state.battle?.status === "fighting") return;
  if (state.selected.length < 3) {
    showToast("至少选择 3 名武将");
    return;
  }
  const grainCost = 8 + state.selected.length * 4 + state.stageIndex * 3;
  const armsCost = 5 + state.selected.length * 2 + state.stageIndex * 2;
  if (state.resources.grain < grainCost || state.resources.arms < armsCost) {
    showToast("粮草或军械不足");
    return;
  }
  state.resources.grain -= grainCost;
  state.resources.arms -= armsCost;
  state.battle = createBattle();
  state.paused = false;
  ui.resultModal.hidden = true;
  addLog(`开战：${activeStage().title}，消耗粮草 ${grainCost}、军械 ${armsCost}。`);
  showRibbon(`${activeStage().title} 开战`);
  saveGame();
  updateUi(true);
}

function createBattle() {
  const stage = activeStage();
  const allies = createSideUnits("ally", state.selected, state.formation);
  const enemies = createSideUnits("enemy", stage.enemy, stage.enemyFormation);
  return {
    status: "fighting",
    time: 0,
    terrain: stage.terrain,
    allies,
    enemies,
    projectiles: [],
    effects: [],
    floaters: [],
    allyFormation: state.formation,
    enemyFormation: stage.enemyFormation,
  };
}

function createSideUnits(side, generalIds, formationId) {
  const positions = sidePositions(side, formationId, generalIds.length);
  return generalIds.map((id, index) => {
    const general = GENERALS[id];
    const troop = TROOPS[general.troop];
    const levelBonus = side === "enemy" ? 1 + state.stageIndex * 0.08 : 1;
    const moraleBonus = side === "ally" ? 0.9 + state.resources.morale / 220 : 1;
    const hp = troop.hp * (1 + general.leadership / 120) * levelBonus * moraleBonus;
    const atk = troop.atk * (1 + general.power / 180) * levelBonus * moraleBonus;
    const pos = positions[index];
    return {
      id: `${side}-${id}-${index}-${Date.now()}`,
      side,
      generalId: id,
      name: general.name,
      surname: general.surname,
      troop: general.troop,
      x: pos.x,
      y: pos.y,
      homeX: pos.x,
      homeY: pos.y,
      hp,
      maxHp: hp,
      atk,
      range: troop.range,
      cooldown: rand(0.2, troop.cooldown),
      attackDelay: troop.cooldown,
      speed: troop.speed,
      morale: 100,
      chargeUsed: false,
      attackFlash: 0,
      slow: 0,
      routed: false,
    };
  });
}

function repositionUnits() {
  const battle = state.battle;
  const allyPositions = sidePositions("ally", battle.allyFormation, battle.allies.length);
  const enemyPositions = sidePositions("enemy", battle.enemyFormation, battle.enemies.length);
  battle.allies.forEach((unit, index) => {
    const pos = allyPositions[index];
    unit.homeX = pos.x;
    unit.homeY = pos.y;
  });
  battle.enemies.forEach((unit, index) => {
    const pos = enemyPositions[index];
    unit.homeX = pos.x;
    unit.homeY = pos.y;
  });
}

function update(dt) {
  if (!state.battle || state.battle.status !== "fighting" || state.paused) return;
  const battle = state.battle;
  battle.time += dt;
  updateUnits(dt);
  updateProjectiles(dt);
  updateEffects(dt);
  checkBattleEnd();
}

function alive(units) {
  return units.filter((unit) => unit.hp > 0 && !unit.routed);
}

function updateUnits(dt) {
  const battle = state.battle;
  [...battle.allies, ...battle.enemies].forEach((unit) => {
    if (unit.hp <= 0 || unit.routed) return;
    unit.cooldown = Math.max(0, unit.cooldown - dt);
    unit.attackFlash = Math.max(0, unit.attackFlash - dt * 4);
    unit.slow = Math.max(0, unit.slow - dt);
    if (unit.hp / unit.maxHp < 0.18 && unit.morale < 28 && Math.random() < dt * 0.08) {
      unit.routed = true;
      addFloater(unit.x, unit.y - 32, "溃退", "#f0c861");
      addLog(`${unit.name}部士气崩溃，退出战线。`);
      return;
    }

    const enemies = unit.side === "ally" ? alive(battle.enemies) : alive(battle.allies);
    if (!enemies.length) return;
    const target = chooseTarget(unit, enemies);
    const dist = distance(unit, target);
    const range = effectiveRange(unit);
    if (dist > range * 0.92) {
      moveToward(unit, target, dt);
    } else if (unit.cooldown <= 0) {
      performAttack(unit, target);
    } else {
      driftHome(unit, dt);
    }
  });
}

function chooseTarget(unit, enemies) {
  const general = GENERALS[unit.generalId];
  if ((general.name === "赵云" || general.name === "张辽") && Math.random() < 0.68) {
    const back = enemies
      .filter((enemy) => enemy.troop === "archer" || enemy.troop === "strategist")
      .sort((a, b) => distance(unit, a) - distance(unit, b))[0];
    if (back) return back;
  }
  if (unit.troop === "spear") {
    const cavalry = enemies.filter((enemy) => enemy.troop === "cavalry").sort((a, b) => distance(unit, a) - distance(unit, b))[0];
    if (cavalry) return cavalry;
  }
  if (unit.troop === "archer") {
    return enemies.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  }
  return enemies.sort((a, b) => distance(unit, a) - distance(unit, b))[0];
}

function effectiveRange(unit) {
  let range = TROOPS[unit.troop].range;
  if (state.battle.terrain === "river" && unit.troop === "archer") range *= 1.1;
  if (formationOf(unit.side).name === "鹤翼阵" && unit.troop === "archer") range *= 1.12;
  return range;
}

function moveToward(unit, target, dt) {
  const dx = target.x - unit.x;
  const dy = target.y - unit.y;
  const dist = Math.max(1, Math.hypot(dx, dy));
  let speed = TROOPS[unit.troop].speed * (unit.slow > 0 ? 0.55 : 1);
  if (state.battle.terrain === "mountain" && unit.troop === "cavalry") speed *= 0.75;
  if (state.battle.terrain === "river" && unit.troop === "cavalry") speed *= 0.72;
  unit.x += (dx / dist) * speed * dt;
  unit.y += (dy / dist) * speed * dt;
}

function driftHome(unit, dt) {
  const dx = unit.homeX - unit.x;
  const dy = unit.homeY - unit.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 3) return;
  unit.x += (dx / dist) * Math.min(dist, 16 * dt);
  unit.y += (dy / dist) * Math.min(dist, 16 * dt);
}

function performAttack(attacker, target) {
  const troop = TROOPS[attacker.troop];
  attacker.cooldown = troop.cooldown * rand(0.88, 1.12);
  attacker.attackFlash = 1;
  const ranged = troop.range > 90;
  if (ranged) {
    state.battle.projectiles.push({
      x: attacker.x,
      y: attacker.y - 20,
      target,
      attacker,
      color: troop.color,
      speed: attacker.troop === "siege" ? 360 : 520,
      life: 1.6,
    });
  } else {
    hitUnit(attacker, target);
  }
}

function updateProjectiles(dt) {
  const projectiles = [];
  state.battle.projectiles.forEach((projectile) => {
    if (!projectile.target || projectile.target.hp <= 0 || projectile.life <= 0) return;
    projectile.life -= dt;
    const dx = projectile.target.x - projectile.x;
    const dy = projectile.target.y - 18 - projectile.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const step = projectile.speed * dt;
    if (dist <= step + 8) {
      hitUnit(projectile.attacker, projectile.target);
      return;
    }
    projectile.x += (dx / dist) * step;
    projectile.y += (dy / dist) * step;
    projectiles.push(projectile);
  });
  state.battle.projectiles = projectiles;
}

function formationOf(side) {
  const id = side === "ally" ? state.battle.allyFormation : state.battle.enemyFormation;
  return FORMATIONS[id] || FORMATIONS.wedge;
}

function hitUnit(attacker, target) {
  if (!attacker || !target || attacker.hp <= 0 || target.hp <= 0) return;
  const terrainId = state.battle.terrain;
  const counter = counterMultiplier(attacker.troop, target.troop);
  const terrain = terrainMultiplier(attacker.troop, terrainId, "attack");
  const formationAtk = formationAttackMultiplier(attacker.troop, formationOf(attacker.side), terrainId);
  const formationDef = formationDefenseMultiplier(target.troop, formationOf(target.side), terrainId);
  const general = GENERALS[attacker.generalId];
  let special = 1;
  if (general.name === "关羽" && !attacker.chargeUsed && attacker.troop === "cavalry") {
    special *= 1.65;
    attacker.chargeUsed = true;
    addFloater(attacker.x, attacker.y - 42, "突阵", "#f0c861");
  }
  if (general.name === "张飞" && target.troop === "cavalry") special *= 1.24;
  if (general.name === "魏延" && (terrainId === "forest" || terrainId === "mountain")) special *= 1.18;
  if (general.name === "黄忠" && distance(attacker, target) > 130) special *= 1.18;
  if (general.name === "诸葛亮" && formationOf(attacker.side).name === "八卦阵") special *= 1.22;
  if (general.name === "司马懿") target.morale -= 4;

  const random = rand(0.9, 1.12);
  const damage = Math.max(3, attacker.atk * counter * terrain * formationAtk * formationDef * special * random);
  target.hp -= damage;
  target.morale -= Math.max(1.2, damage / target.maxHp * 24);

  if (attacker.troop === "strategist") {
    target.slow = Math.max(target.slow, 1.1 * (formationOf(attacker.side).bonuses.control || 1));
    target.morale -= 3;
    addEffect(target.x, target.y, "#92d6ff", 36);
  } else if (attacker.troop === "cavalry") {
    addEffect(target.x, target.y, "#f0c861", 28);
  } else {
    addEffect(target.x, target.y, TROOPS[attacker.troop].color, 24);
  }

  if (counter >= 1.28 && Math.random() < 0.42) {
    addFloater(target.x, target.y - 34, "克制", "#f0c861");
    addLog(`${TROOPS[attacker.troop].name}克制${TROOPS[target.troop].name}，${attacker.name}部打出优势。`);
  }
  if (terrain >= 1.18 && Math.random() < 0.32) {
    addFloater(attacker.x, attacker.y - 38, TERRAIN[terrainId].name, "#fff3c4");
  }
  addFloater(target.x, target.y - 18, String(Math.round(damage)), attacker.side === "ally" ? "#fff0a6" : "#d7e3ff");
}

function counterMultiplier(attackerTroop, defenderTroop) {
  const table = {
    spear: { cavalry: 1.65, shield: 0.92 },
    cavalry: { archer: 1.48, strategist: 1.48, navy: 0.9, spear: 0.72 },
    archer: { spear: 1.24, shield: 0.78, cavalry: 0.86 },
    shield: { archer: 1.22, strategist: 0.88, siege: 0.72 },
    strategist: { shield: 1.32, spear: 1.2, cavalry: 0.78 },
    navy: { cavalry: 1.18, spear: 1.08 },
    siege: { shield: 1.38, city: 1.3 },
  };
  return table[attackerTroop]?.[defenderTroop] || 1;
}

function terrainMultiplier(troop, terrainId, mode = "attack") {
  const terrain = {
    forest: { archer: 1.18, strategist: 1.18, cavalry: 0.82, spear: 1.06 },
    plain: { cavalry: 1.24, spear: 1.08, shield: 0.96 },
    river: { navy: 1.48, archer: 1.1, cavalry: 0.75, shield: 0.94 },
    mountain: { shield: 1.16, spear: 1.16, archer: 1.14, cavalry: 0.8, strategist: 1.1 },
    city: { shield: mode === "defense" ? 0.84 : 1.08, siege: 1.22, strategist: 1.1, cavalry: 0.88 },
  };
  return terrain[terrainId]?.[troop] || 1;
}

function formationAttackMultiplier(troop, formation, terrainId) {
  let value = formation.bonuses[troop] || 1;
  if (formation.bonuses[terrainId]) value *= formation.bonuses[terrainId];
  return value;
}

function formationDefenseMultiplier(troop, formation, terrainId) {
  let value = formation.bonuses.defense || 1;
  if (terrainId === "city" && troop === "shield") value *= 0.88;
  if (terrainId === "mountain" && (troop === "shield" || troop === "spear")) value *= 0.9;
  if (formation.bonuses.incoming) value *= formation.bonuses.incoming;
  return value;
}

function addEffect(x, y, color, radius) {
  state.battle.effects.push({ x, y, color, radius, life: 0.42, maxLife: 0.42 });
}

function addFloater(x, y, text, color) {
  state.battle.floaters.push({ x, y, text, color, life: 1.0, vy: rand(-28, -18) });
}

function updateEffects(dt) {
  const battle = state.battle;
  battle.effects = battle.effects.filter((effect) => {
    effect.life -= dt;
    return effect.life > 0;
  });
  battle.floaters = battle.floaters.filter((floater) => {
    floater.life -= dt;
    floater.y += floater.vy * dt;
    return floater.life > 0;
  });
}

function checkBattleEnd() {
  const battle = state.battle;
  if (!alive(battle.enemies).length) {
    finishBattle(true);
  } else if (!alive(battle.allies).length) {
    finishBattle(false);
  }
}

function finishBattle(win) {
  const battle = state.battle;
  battle.status = win ? "won" : "lost";
  const stage = activeStage();
  if (win) {
    Object.entries(stage.reward).forEach(([key, value]) => {
      state.resources[key] = (state.resources[key] || 0) + value;
    });
    state.resources.morale = clamp(state.resources.morale + 8, 0, 100);
    state.completed[stage.id] = true;
    state.unlockedStage = Math.max(state.unlockedStage, Math.min(STAGES.length - 1, state.stageIndex + 1));
    addLog(`胜利：夺下${stage.title}。获得粮草、军械与士气。`);
    showResult("胜利", `${stage.title} 得胜`, `阵法与地形判断正确。下一关已解锁。`, true);
  } else {
    state.resources.morale = clamp(state.resources.morale - 12, 0, 100);
    state.resources.population = Math.max(8, state.resources.population - 1);
    addLog(`失利：${stage.title} 未能突破。调整兵种和阵法再战。`);
    showResult("失利", `${stage.title} 受挫`, `敌军克制了你的阵型。试试换阵法或换武将。`, false);
  }
  saveGame();
  updateUi(true);
}

function showResult(kicker, title, text, win) {
  ui.resultKicker.textContent = kicker;
  ui.resultTitle.textContent = title;
  ui.resultText.textContent = text;
  ui.nextStageBtn.disabled = !win || state.stageIndex >= STAGES.length - 1;
  ui.resultModal.hidden = false;
}

function nextStage() {
  if (state.stageIndex < STAGES.length - 1) {
    state.stageIndex += 1;
    state.battle = null;
    ui.resultModal.hidden = true;
    switchTab("campaign");
    saveGame();
    updateUi(true);
  }
}

function retryStage() {
  state.battle = null;
  ui.resultModal.hidden = true;
  saveGame();
  updateUi(true);
}

function updateUi(force = false) {
  const stage = activeStage();
  const formation = activeFormation();
  ui.city.textContent = state.resources.city;
  ui.population.textContent = state.resources.population;
  ui.grain.textContent = state.resources.grain;
  ui.arms.textContent = state.resources.arms;
  ui.morale.textContent = state.resources.morale;
  ui.pauseIcon.textContent = state.paused ? "▶" : "II";
  ui.speedBtn.textContent = `${state.speed}x`;
  ui.stageTitle.textContent = stage.title;
  ui.stageMeta.textContent = `${TERRAIN[stage.terrain].name} · 蜀军对魏军 · 敌阵 ${FORMATIONS[stage.enemyFormation].name}`;
  ui.allyPower.textContent = `蜀军 ${selectedPower()}`;
  ui.enemyPower.textContent = `魏军 ${enemyPower()}`;
  ui.selectedText.textContent = `已选 ${state.selected.length}/5`;
  ui.formationText.textContent = `当前：${formation.name}`;
  ui.campaignText.textContent = `第 ${state.stageIndex + 1}/${STAGES.length} 关`;
  ui.startBtn.disabled = state.battle?.status === "fighting";
  ui.startBtn.textContent = state.battle?.status === "fighting" ? "交战中" : "开战";

  const signature = JSON.stringify({
    tab: state.activeTab,
    selected: state.selected,
    formation: state.formation,
    stage: state.stageIndex,
    unlocked: state.unlockedStage,
    resources: state.resources,
    log: state.log,
    fighting: state.battle?.status,
  });
  if (!force && signature === renderSignature) return;
  renderSignature = signature;
  renderRoster();
  renderFormations();
  renderTerrainCard();
  renderStages();
  renderReport();
}

function renderRoster() {
  ui.rosterGrid.innerHTML = "";
  PLAYER_ROSTER.forEach((id) => {
    const general = GENERALS[id];
    const troop = TROOPS[general.troop];
    const active = state.selected.includes(id);
    const button = document.createElement("button");
    button.className = `general-card${active ? " active" : ""}`;
    button.type = "button";
    button.style.setProperty("--troop-color", troop.color);
    button.innerHTML = `
      <span class="portrait" aria-hidden="true"><i class="weapon ${troop.weapon}"></i></span>
      <span class="general-info">
        <strong>${general.name}</strong>
        <span>${general.title} · ${troop.name}</span>
        <span class="general-tags">${general.traits.map((trait) => `<i class="tag">${trait}</i>`).join("")}</span>
        <small>${general.tactic}</small>
      </span>
      <span class="mini-power">${generalPower(id)}</span>
    `;
    button.addEventListener("click", () => toggleGeneral(id));
    ui.rosterGrid.appendChild(button);
  });
}

function renderFormations() {
  ui.formationGrid.innerHTML = "";
  Object.entries(FORMATIONS).forEach(([id, formation]) => {
    const button = document.createElement("button");
    button.className = `formation-card${state.formation === id ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="formation-mini" aria-hidden="true">${formation.positions
        .map(([x, y]) => `<i style="left:${Math.round(x * 48 + 5)}px;top:${Math.round(y * 32 + 5)}px"></i>`)
        .join("")}</span>
      <span>
        <strong>${formation.name}</strong>
        <span>${formation.desc}</span>
        <small>适合：${formation.best}</small>
      </span>
    `;
    button.addEventListener("click", () => selectFormation(id));
    ui.formationGrid.appendChild(button);
  });
}

function renderTerrainCard() {
  const stage = activeStage();
  const terrain = TERRAIN[stage.terrain];
  ui.terrainCard.innerHTML = `
    <strong>${terrain.name}地形</strong>
    <span>${terrain.desc}</span>
    <div class="terrain-icons">
      <span class="terrain-icon"><i class="terrain-symbol ${terrain.icon}"></i></span>
      <span class="terrain-icon"><i class="terrain-symbol ${state.formation}"></i></span>
      <span class="terrain-icon"><i class="terrain-symbol camp-shu"></i></span>
      <span class="terrain-icon"><i class="terrain-symbol camp-wei"></i></span>
    </div>
    <span>${terrain.tags.join(" · ")}</span>
  `;
}

function renderStages() {
  ui.stageGrid.innerHTML = "";
  STAGES.forEach((stage, index) => {
    const unlocked = index <= state.unlockedStage;
    const button = document.createElement("button");
    button.className = `stage-card${index === state.stageIndex ? " active" : ""}`;
    button.disabled = !unlocked || state.battle?.status === "fighting";
    button.type = "button";
    button.innerHTML = `
      <strong>${index + 1}. ${stage.title}</strong>
      <span class="terrain-pill">${TERRAIN[stage.terrain].name} · 敌阵 ${FORMATIONS[stage.enemyFormation].name}</span>
      <span>${unlocked ? stage.desc : "通关上一关后解锁"}</span>
      <small>敌将：${stage.enemy.map((id) => GENERALS[id].name).join("、")}</small>
    `;
    button.addEventListener("click", () => selectStage(index));
    ui.stageGrid.appendChild(button);
  });
}

function renderReport() {
  ui.counterBoard.innerHTML = "";
  COUNTER_ROWS.forEach(([badge, text]) => {
    const row = document.createElement("div");
    row.className = "counter-row";
    row.innerHTML = `<span class="counter-badge">${badge}</span><span>${text}</span>`;
    ui.counterBoard.appendChild(row);
  });
  ui.logList.innerHTML = "";
  state.log.slice(0, 8).forEach((entry) => {
    const card = document.createElement("div");
    card.className = "log-card";
    card.textContent = entry;
    ui.logList.appendChild(card);
  });
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);
  drawBattlefield(w, h);
  const battle = state.battle;
  if (battle?.status === "fighting" || battle?.status === "won" || battle?.status === "lost") {
    drawUnits();
    drawProjectiles();
    drawEffectsAndFloaters();
  } else {
    drawPreview();
  }
  drawFrontLayer(w, h);
}

function drawBattlefield(w, h) {
  const stage = activeStage();
  const terrainId = stage.terrain;
  const base = {
    forest: ["#66884d", "#557442"],
    plain: ["#7e9b58", "#66884d"],
    river: ["#638e71", "#416d76"],
    mountain: ["#75745c", "#5d604d"],
    city: ["#79714e", "#5c5740"],
  }[terrainId];
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, base[0]);
  sky.addColorStop(1, base[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawTerrain(w, h, terrainId);
  drawCamp(w, h, "ally");
  drawCamp(w, h, "enemy");

  ctx.strokeStyle = "rgba(27, 23, 19, 0.28)";
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 14]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.17);
  ctx.lineTo(w * 0.5, h * 0.9);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTerrain(w, h, terrainId) {
  if (terrainId === "river") {
    ctx.fillStyle = "#4f8798";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.54);
    ctx.bezierCurveTo(w * 0.26, h * 0.42, w * 0.46, h * 0.72, w, h * 0.5);
    ctx.lineTo(w, h * 0.68);
    ctx.bezierCurveTo(w * 0.58, h * 0.82, w * 0.3, h * 0.54, 0, h * 0.73);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(235, 246, 240, 0.35)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(w * (0.08 + i * 0.14), h * (0.58 + (i % 2) * 0.04));
      ctx.quadraticCurveTo(w * (0.13 + i * 0.14), h * 0.53, w * (0.2 + i * 0.14), h * 0.58);
      ctx.stroke();
    }
  } else if (terrainId === "forest") {
    for (let i = 0; i < 34; i += 1) {
      const x = (i * 109) % Math.max(1, w);
      const y = h * (0.2 + ((i * 47) % 68) / 100);
      drawTree(x, y, 0.82 + (i % 3) * 0.14);
    }
  } else if (terrainId === "mountain") {
    for (let i = 0; i < 12; i += 1) {
      const x = w * (0.08 + ((i * 23) % 84) / 100);
      const y = h * (0.24 + ((i * 37) % 62) / 100);
      drawRock(x, y, 26 + (i % 3) * 11);
    }
  } else if (terrainId === "city") {
    ctx.fillStyle = "rgba(58, 48, 37, 0.28)";
    ctx.fillRect(w * 0.58, h * 0.22, w * 0.32, h * 0.58);
    drawWall(w * 0.62, h * 0.25, w * 0.24, h * 0.45);
  } else {
    ctx.fillStyle = "rgba(238, 206, 119, 0.15)";
    for (let i = 0; i < 14; i += 1) {
      ctx.beginPath();
      ctx.ellipse((i * 137) % w, h * (0.25 + ((i * 61) % 60) / 100), 48, 16, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawTree(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#3f5f34";
  ctx.fillRect(-4, 8, 8, 22);
  ctx.fillStyle = "#5f9a53";
  ctx.beginPath();
  ctx.arc(0, 2, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawRock(x, y, size) {
  ctx.fillStyle = "#8b8066";
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - size, y + size * 0.4);
  ctx.lineTo(x - size * 0.36, y - size * 0.5);
  ctx.lineTo(x + size * 0.52, y - size * 0.34);
  ctx.lineTo(x + size, y + size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawWall(x, y, width, height) {
  ctx.fillStyle = "#b38955";
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 4;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = "#6d4c30";
    ctx.fillRect(x + 12, y + 20 + i * (height - 40) / 6, width - 24, 10);
  }
}

function drawCamp(w, h, side) {
  const x = side === "ally" ? w * 0.1 : w * 0.9;
  const color = side === "ally" ? "#4f9a64" : "#475f85";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, h * 0.88, 92, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, h * 0.19);
  ctx.lineTo(x, h * 0.82);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, h * 0.2);
  ctx.lineTo(x + (side === "ally" ? 54 : -54), h * 0.23);
  ctx.lineTo(x, h * 0.29);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff2c7";
  ctx.font = "900 18px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(side === "ally" ? "蜀" : "魏", x + (side === "ally" ? 22 : -22), h * 0.255);
}

function drawPreview() {
  const field = battlefield();
  const allies = state.selected;
  const enemies = activeStage().enemy;
  sidePositions("ally", state.formation, allies.length).forEach((pos, index) => {
    drawPreviewToken(pos.x, pos.y, allies[index], "ally");
  });
  sidePositions("enemy", activeStage().enemyFormation, enemies.length).forEach((pos, index) => {
    drawPreviewToken(pos.x, pos.y, enemies[index], "enemy");
  });
  ctx.fillStyle = "rgba(27, 23, 19, 0.52)";
  ctx.font = "900 22px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("布阵阶段：选择武将、阵法与关卡后开战", field.mid, field.top - 34);
}

function drawPreviewToken(x, y, generalId, side) {
  ctx.globalAlpha = 0.72;
  drawTroopToken({ x, y, generalId, side, troop: GENERALS[generalId].troop, hp: 1, maxHp: 1, attackFlash: 0, surname: GENERALS[generalId].surname });
  ctx.globalAlpha = 1;
}

function drawUnits() {
  const battle = state.battle;
  const units = [...battle.allies, ...battle.enemies].sort((a, b) => a.y - b.y);
  units.forEach((unit) => {
    if (unit.hp > 0 && !unit.routed) drawTroopToken(unit);
  });
}

function drawTroopToken(unit) {
  const general = GENERALS[unit.generalId];
  const troop = TROOPS[unit.troop];
  const sideColor = unit.side === "ally" ? "#4f9a64" : "#475f85";
  const x = unit.x;
  const y = unit.y;
  const pulse = unit.attackFlash > 0 ? 1 + unit.attackFlash * 0.08 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 25, 31, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  if (unit.troop === "navy") drawBoatBase();
  if (unit.troop === "cavalry") drawHorseBase();

  ctx.fillStyle = troop.color;
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  roundRect(-15, -7, 30, 34, 8, true, true);
  ctx.fillStyle = "#efbd78";
  ctx.beginPath();
  ctx.arc(0, -18, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1b1713";
  ctx.fillRect(-6, -20, 3, 7);
  ctx.fillRect(5, -20, 3, 7);

  drawWeapon(unit.troop, troop.color);
  drawBanner(general.surname, sideColor);
  ctx.restore();

  const hpPct = clamp(unit.hp / unit.maxHp, 0, 1);
  drawHpBar(x - 28, y - 54, 56, hpPct, unit.side === "ally" ? "#7ed18b" : "#e26d62");
}

function drawHorseBase() {
  ctx.fillStyle = "#8d6343";
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  roundRect(-30, 10, 60, 24, 14, true, true);
  ctx.fillRect(-20, 28, 7, 18);
  ctx.fillRect(14, 28, 7, 18);
}

function drawBoatBase() {
  ctx.fillStyle = "#9a6e41";
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-38, 18);
  ctx.lineTo(38, 18);
  ctx.quadraticCurveTo(26, 40, 0, 40);
  ctx.quadraticCurveTo(-26, 40, -38, 18);
  ctx.fill();
  ctx.stroke();
}

function drawWeapon(troop, color) {
  ctx.strokeStyle = "#1b1713";
  ctx.fillStyle = "#e9e1c9";
  if (troop === "spear") {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, 6);
    ctx.lineTo(42, -38);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(42, -38);
    ctx.lineTo(39, -24);
    ctx.lineTo(53, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (troop === "archer") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(18, -5, 26, -Math.PI * 0.55, Math.PI * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, -28);
    ctx.lineTo(18, 18);
    ctx.stroke();
  } else if (troop === "shield") {
    ctx.fillStyle = "#7e8a84";
    roundRect(-32, -10, 21, 38, 8, true, true);
  } else if (troop === "strategist") {
    ctx.fillStyle = "#e8efd8";
    ctx.beginPath();
    ctx.ellipse(24, -16, 20, 13, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(12, -6);
      ctx.lineTo(26 + i * 5, -25);
      ctx.stroke();
    }
  } else if (troop === "cavalry") {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(13, -3);
    ctx.lineTo(42, -17);
    ctx.stroke();
  } else if (troop === "navy") {
    ctx.fillStyle = "#d8c072";
    ctx.fillRect(18, -30, 16, 30);
    ctx.strokeRect(18, -30, 16, 30);
  } else {
    ctx.fillStyle = "#8b8067";
    roundRect(16, -4, 34, 16, 5, true, true);
  }
}

function drawBanner(text, color) {
  ctx.strokeStyle = "#1b1713";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-24, 20);
  ctx.lineTo(-24, -45);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-24, -45);
  ctx.lineTo(-56, -39);
  ctx.lineTo(-24, -28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff2c7";
  ctx.font = "900 16px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text.slice(0, 1), -40, -34);
}

function drawHpBar(x, y, width, pct, color) {
  ctx.fillStyle = "#1b1713";
  roundRect(x, y, width, 8, 4, true, false);
  ctx.fillStyle = color;
  roundRect(x + 1, y + 1, (width - 2) * pct, 6, 3, true, false);
}

function drawProjectiles() {
  state.battle.projectiles.forEach((projectile) => {
    ctx.strokeStyle = projectile.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(projectile.x - 10, projectile.y + 3);
    ctx.lineTo(projectile.x + 10, projectile.y - 3);
    ctx.stroke();
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEffectsAndFloaters() {
  const battle = state.battle;
  battle.effects.forEach((effect) => {
    const t = clamp(effect.life / effect.maxLife, 0, 1);
    ctx.globalAlpha = t;
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 5 * t;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (1.2 - t * 0.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  ctx.textAlign = "center";
  ctx.font = "900 15px Microsoft YaHei, sans-serif";
  battle.floaters.forEach((floater) => {
    ctx.globalAlpha = clamp(floater.life, 0, 1);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1b1713";
    ctx.strokeText(floater.text, floater.x, floater.y);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, floater.x, floater.y);
    ctx.globalAlpha = 1;
  });
}

function drawFrontLayer(w, h) {
  ctx.fillStyle = "rgba(27, 23, 19, 0.18)";
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

function saveGame() {
  const payload = {
    version: 1,
    activeTab: state.activeTab,
    stageIndex: state.stageIndex,
    unlockedStage: state.unlockedStage,
    selected: state.selected,
    formation: state.formation,
    resources: state.resources,
    log: state.log,
    completed: state.completed,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1) return false;
    state.activeTab = saved.activeTab || state.activeTab;
    state.stageIndex = clamp(saved.stageIndex || 0, 0, STAGES.length - 1);
    state.unlockedStage = clamp(saved.unlockedStage || 0, 0, STAGES.length - 1);
    state.selected = Array.isArray(saved.selected)
      ? saved.selected.filter((id) => PLAYER_ROSTER.includes(id)).slice(0, 5)
      : state.selected;
    if (state.selected.length < 3) state.selected = createState().selected;
    state.formation = FORMATIONS[saved.formation] ? saved.formation : state.formation;
    state.resources = { ...state.resources, ...(saved.resources || {}) };
    state.log = Array.isArray(saved.log) ? saved.log.slice(0, 12) : state.log;
    state.completed = { ...(saved.completed || {}) };
    return true;
  } catch {
    return false;
  }
}

function exportSave() {
  saveGame();
  return btoa(unescape(encodeURIComponent(localStorage.getItem(SAVE_KEY) || "")));
}

function importSave(code) {
  const raw = decodeURIComponent(escape(atob(code.trim())));
  const parsed = JSON.parse(raw);
  if (!parsed || parsed.version !== 1) throw new Error("bad save");
  localStorage.setItem(SAVE_KEY, raw);
  state = createState();
  loadGame();
  closeSaveModal();
  showToast("存档已读取");
  updateUi(true);
}

function openExportModal() {
  ui.saveTitle.textContent = "导出存档";
  ui.saveText.value = exportSave();
  ui.copySaveBtn.style.display = "";
  ui.loadSaveBtn.style.display = "none";
  ui.saveModal.hidden = false;
}

function openImportModal() {
  ui.saveTitle.textContent = "导入存档";
  ui.saveText.value = "";
  ui.copySaveBtn.style.display = "none";
  ui.loadSaveBtn.style.display = "";
  ui.saveModal.hidden = false;
}

function closeSaveModal() {
  ui.saveModal.hidden = true;
}

function loop(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastFrame) / 1000 || 0);
  lastFrame = timestamp;
  update(dt * state.speed);
  draw();
  updateUi();
  requestAnimationFrame(loop);
}

function bindEvents() {
  ui.tabs.forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));
  ui.startBtn.addEventListener("click", startBattle);
  ui.pauseBtn.addEventListener("click", () => {
    state.paused = !state.paused;
    updateUi(true);
  });
  ui.speedBtn.addEventListener("click", () => {
    state.speed = state.speed === 1 ? 2 : 1;
    updateUi(true);
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
      showToast("已复制");
    } catch {
      document.execCommand("copy");
      showToast("已复制");
    }
  });
  ui.loadSaveBtn.addEventListener("click", () => {
    try {
      importSave(ui.saveText.value);
    } catch {
      showToast("存档码无效");
    }
  });
  ui.nextStageBtn.addEventListener("click", nextStage);
  ui.retryBtn.addEventListener("click", retryStage);
}

function init() {
  state = createState();
  loadGame();
  resizeCanvas();
  if (resizeObserver) resizeObserver.disconnect();
  resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);
  bindEvents();
  switchTab(state.activeTab);
  updateUi(true);
  showRibbon("三国阵战 S1");
  requestAnimationFrame(loop);
}

init();

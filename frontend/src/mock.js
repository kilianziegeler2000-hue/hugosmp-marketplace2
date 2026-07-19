// Mock data for HugoSMP Market clone (Minecraft SMP marketplace)
// Currency = Coins / HugoSMP-Dollar ($). Prices realistic (into the millions).
// Rule: Spawners can NOT be listed in the Auction House (AH) -> only Orders / Marketplace.

export const DISCORD_URL = "https://discord.gg/qQJr23WZz";

export const NAV_LINKS = [
  { key: "home", label: "Startseite", path: "/" },
  { key: "items", label: "Items", path: "/items" },
  { key: "live", label: "Live Feed", path: "/live" },
  { key: "arbitrage", label: "Arbitrage", path: "/arbitrage" },
  { key: "schematic", label: "Schematic", path: "/schematic" },
  { key: "rtp", label: "RTP Tracker", path: "/rtp" },
  { key: "marketplace", label: "Marktplatz", path: "/marketplace" },
  { key: "maparts", label: "Maparts", path: "/maparts" },
  { key: "portfolio", label: "Portfolio", path: "/portfolio" },
  { key: "premium", label: "Premium", path: "/premium" },
  { key: "profile", label: "Profil", path: "/profile" },
];

// Format a coin amount as HugoSMP-Dollar ($). Abbreviates large numbers.
export function fmtCoins(n) {
  const neg = n < 0;
  const abs = Math.abs(n);
  let s;
  if (abs >= 1000000) s = (abs / 1000000).toLocaleString("de-DE", { maximumFractionDigits: 2 }) + "M";
  else if (abs >= 1000) s = (abs / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + "k";
  else s = abs.toLocaleString("de-DE");
  return (neg ? "-" : "") + s + "$";
}

// ah: true = can be traded in the Auction House. Spawners are ah:false.
export const ITEMS = [
  { id: "iron_golem", name: "Iron Golem Spawner", cat: "Spawner", icon: "golem", color: "#c0c0c0", price: 6000000, change: -3.1, ah: false },
  { id: "blaze", name: "Blaze Spawner", cat: "Spawner", icon: "blaze", color: "#f5b301", price: 1500000, change: 2.4, ah: false },
  { id: "piglin", name: "Piglin Spawner", cat: "Spawner", icon: "skull", color: "#c98a5e", price: 1100000, change: 4.1, ah: false },
  { id: "creeper", name: "Creeper Spawner", cat: "Spawner", icon: "creeper", color: "#4caf50", price: 800000, change: 1.1, ah: false },
  { id: "skeleton", name: "Skeleton Spawner", cat: "Spawner", icon: "skeleton", color: "#d9d9d9", price: 400000, change: -0.8, ah: false },
  { id: "spider", name: "Spider Spawner", cat: "Spawner", icon: "spider", color: "#6b4226", price: 350000, change: -2.0, ah: false },
  { id: "zombie", name: "Zombie Spawner", cat: "Spawner", icon: "zombie", color: "#3fa34d", price: 250000, change: 0.5, ah: false },
  { id: "cow", name: "Cow Spawner", cat: "Spawner", icon: "box", color: "#b5651d", price: 180000, change: 0.9, ah: false },
  { id: "beacon", name: "Beacon", cat: "Item", icon: "beacon", color: "#7fdbff", price: 220000, change: 2.9, ah: true },
  { id: "elytra", name: "Elytra", cat: "Item", icon: "elytra", color: "#b0a4c9", price: 150000, change: 0.2, ah: true },
  { id: "netherite", name: "Netherite Barren", cat: "Item", icon: "ingot", color: "#7a6a6f", price: 85000, change: 1.0, ah: true },
  { id: "totem", name: "Totem der Unsterblichkeit", cat: "Item", icon: "totem", color: "#e5c07b", price: 45000, change: -0.6, ah: true },
  { id: "shulker", name: "Shulker-Box", cat: "Item", icon: "box", color: "#a679c1", price: 30000, change: 0.8, ah: true },
  { id: "mending", name: "Mending Buch", cat: "Item", icon: "book", color: "#5b8def", price: 28000, change: 0.3, ah: true },
];

// Real Minecraft item icons (same CDN naming HugoSMP uses). Spawners -> mob spawn eggs.
export const MC_ICON_BASE = "https://mc.nerothe.com/img/1.21.4";
const MC_ICON = {
  iron_golem: "spawner",
  blaze: "blaze_spawn_egg",
  piglin: "piglin_spawn_egg",
  creeper: "creeper_spawn_egg",
  skeleton: "skeleton_spawn_egg",
  spider: "spider_spawn_egg",
  zombie: "zombie_spawn_egg",
  cow: "cow_spawn_egg",
  beacon: "beacon",
  elytra: "elytra",
  netherite: "netherite_ingot",
  totem: "totem_of_undying",
  shulker: "shulker_box",
  mending: "enchanted_book",
};
ITEMS.forEach((it) => { it.img = `${MC_ICON_BASE}/minecraft_${MC_ICON[it.id] || "spawner"}.png`; });

export const AH_ITEMS = ITEMS.filter((i) => i.ah); // auctionable
export const SPAWNERS = ITEMS.filter((i) => i.cat === "Spawner");

const PLAYERS = ["Notch_2010", "CraftKing", "EnderPvP", "xX_Diamond", "MobFarmer", "RedstoneGod", "NetherNomad", "PixelQueen", "BlazeRod99", "OreHunter", "VoidWalker", "HugoFan", "SpawnerLord", "AFKmachine", "LootGoblin"];
function randPlayer() { return PLAYERS[Math.floor(Math.random() * PLAYERS.length)]; }

function timeAgo(minsAgo) {
  if (minsAgo < 1) return "gerade eben";
  if (minsAgo < 60) return `vor ${Math.floor(minsAgo)} Min`;
  return `vor ${Math.floor(minsAgo / 60)} Std`;
}

// Create one feed entry. kind = "auction" (AH, no spawners) or "order" (all items).
export function makeEntry(kind, minsAgo = null) {
  const pool = kind === "auction" ? AH_ITEMS : ITEMS;
  const item = pool[Math.floor(Math.random() * pool.length)];
  const qty = item.cat === "Spawner" ? [1, 1, 2, 3, 4][Math.floor(Math.random() * 5)] : [1, 4, 8, 16, 32, 64][Math.floor(Math.random() * 6)];
  const unit = Math.round(item.price * (0.85 + Math.random() * 0.4));
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    item,
    qty,
    unitPrice: unit,
    totalPrice: unit * qty,
    player: randPlayer(),
    time: timeAgo(minsAgo == null ? Math.floor(Math.random() * 180) : minsAgo),
    kind,
    fresh: minsAgo === 0,
  };
}

export function generateFeed(kind, count = 14) {
  return Array.from({ length: count }).map(() => makeEntry(kind));
}

export const HOME_FEATURES = [
  { title: "Maparts", desc: "Durchstöbere Mapart-Alben und Einzelstücke, verfolge Besitz und entdecke Community-Favoriten.", cta: "Maparts ansehen", path: "/maparts", icon: "image" },
  { title: "Marktplatz", desc: "Handle Spawner von Spieler zu Spieler mit Angeboten, Kaufaufträgen und Deal-Chat. Nur In-Game-Trades, kein IRL-Handel.", cta: "Marktplatz öffnen", path: "/marketplace", icon: "store" },
  { title: "RTP Tracker", desc: "Finde die optimalen Koordinaten für deine nächste Farm oder dein Versteck.", cta: "Karte öffnen", path: "/rtp", icon: "map" },
  { title: "Live Feed", desc: "Verfolge Auktionen und Orders in Echtzeit. Filtere nach Item, um bestimmte Spawner und Tools zu tracken.", cta: "Live Feed öffnen", path: "/live", icon: "activity" },
  { title: "Arbitrage", desc: "Vergleiche AH- und Order-Preise, um profitable Deals zu finden. Kaufe niedrig, verkaufe hoch.", cta: "Arbitrage öffnen", path: "/arbitrage", icon: "trending" },
  { title: "Schematic Rechner", desc: "Berechne die benötigten Blöcke für deine Builds mit 3D-Vorschau.", cta: "Rechner öffnen", path: "/schematic", icon: "cube" },
];

export const HOME_STATS = [
  { label: "Getrackte Items", value: "142" },
  { label: "Aktive Auktionen", value: "1.284" },
  { label: "Offene Orders", value: "3.907" },
  { label: "Trades (24h)", value: "512" },
];

// Arbitrage only makes sense for AH-tradeable items (buy via order, sell in AH).
export function generateArbitrage(count = 10) {
  const arr = AH_ITEMS.map((item, i) => {
    const buy = Math.round(item.price * (0.72 + Math.random() * 0.13));
    const sell = Math.round(item.price * (1.05 + Math.random() * 0.28));
    const profit = sell - buy;
    return { id: `arb-${i}`, item, buy, sell, profit, margin: ((profit / buy) * 100).toFixed(1) };
  });
  return arr.sort((a, b) => b.margin - a.margin).slice(0, count);
}

// Marketplace = player-to-player spawner trading (allowed, this is NOT the AH).
export const MARKETPLACE_LISTINGS = SPAWNERS.map((item, idx) => ({
  id: `ml-${idx}`,
  item,
  seller: ["CraftKing", "EnderPvP", "MobFarmer", "SpawnerLord", "LootGoblin", "OreHunter"][idx % 6],
  qty: [1, 2, 3, 4][idx % 4],
  price: item.price,
  type: idx % 3 === 0 ? "order" : "listing",
  note: ["Sofort lieferbar", "Verhandelbar", "Nur Mengenrabatt", "Trusted Trader"][idx % 4],
}));

export const MAPARTS = [
  { id: "m1", title: "Mona Lisa", author: "PixelQueen", panels: 4, likes: 342, palette: ["#8a6d3b", "#d9b382", "#2f2417"] },
  { id: "m2", title: "Starry Night", author: "VoidWalker", panels: 6, likes: 512, palette: ["#1a237e", "#3949ab", "#fdd835"] },
  { id: "m3", title: "The Great Wave", author: "CraftKing", panels: 9, likes: 289, palette: ["#0d47a1", "#e3f2fd", "#1565c0"] },
  { id: "m4", title: "Pixel Dragon", author: "EnderPvP", panels: 2, likes: 176, palette: ["#4a148c", "#7b1fa2", "#00e676"] },
  { id: "m5", title: "Sunset Beach", author: "HugoFan", panels: 3, likes: 421, palette: ["#ff6f00", "#ffca28", "#ff5252"] },
  { id: "m6", title: "Cyber City", author: "RedstoneGod", panels: 12, likes: 634, palette: ["#00bcd4", "#e91e63", "#212121"] },
  { id: "m7", title: "Forest Spirit", author: "MobFarmer", panels: 4, likes: 198, palette: ["#2e7d32", "#66bb6a", "#1b5e20"] },
  { id: "m8", title: "Galaxy Map", author: "NetherNomad", panels: 8, likes: 377, palette: ["#311b92", "#5e35b1", "#b388ff"] },
];

export const RTP_POINTS = Array.from({ length: 18 }).map((_, i) => ({
  id: `rtp-${i}`,
  x: Math.floor(Math.random() * 20000 - 10000),
  z: Math.floor(Math.random() * 20000 - 10000),
  biome: ["Ebene", "Wüste", "Taiga", "Dschungel", "Sumpf", "Savanne", "Berge", "Ozean"][i % 8],
  distance: Math.floor(Math.random() * 12000 + 500),
  safe: Math.random() > 0.3,
}));

const byId = (id) => ITEMS.find((i) => i.id === id);

export const PORTFOLIO = {
  totalValue: 0, // computed below
  change24h: 3.7,
  holdings: [
    { item: byId("iron_golem"), qty: 3, avgBuy: 5200000 },
    { item: byId("blaze"), qty: 5, avgBuy: 1350000 },
    { item: byId("piglin"), qty: 4, avgBuy: 980000 },
    { item: byId("creeper"), qty: 8, avgBuy: 720000 },
    { item: byId("beacon"), qty: 12, avgBuy: 180000 },
    { item: byId("netherite"), qty: 64, avgBuy: 78000 },
  ],
};
PORTFOLIO.totalValue = PORTFOLIO.holdings.reduce((s, h) => s + h.item.price * h.qty, 0);

export const PREMIUM_PLANS = [
  { name: "Free", price: "0", period: "", featured: false, features: ["Live Feed (verzögert)", "Basis Item-Preise", "5 Portfolio-Slots", "Community-Zugang"] },
  { name: "Premium", price: "4,99", period: "/Monat", featured: true, features: ["Echtzeit Live Feed", "Arbitrage-Alarme", "Unbegrenztes Portfolio", "RTP Tracker Pro", "Preis-Historie & Charts", "Discord Premium-Rolle"] },
  { name: "Premium+", price: "9,99", period: "/Monat", featured: false, features: ["Alles aus Premium", "API-Zugang", "Custom Alarme (Webhook)", "Schematic 3D Export", "Priorität-Support", "Early Access Features"] },
];

export const PROFILE = {
  username: "Steve_Builder",
  joined: "März 2024",
  rank: "Premium",
  trades: 148,
  reputation: 4.9,
  balance: 8450000,
};

export const PRICE_HISTORY = Array.from({ length: 24 }).map((_, i) => ({
  t: i,
  v: Math.round(100 + Math.sin(i / 3) * 20 + Math.random() * 15),
}));

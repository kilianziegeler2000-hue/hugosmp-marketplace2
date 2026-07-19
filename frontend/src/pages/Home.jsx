import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Image, Store, Map, Activity, TrendingUp, Box, ArrowUpRight, ArrowDownRight, Radio } from "lucide-react";
import { HOME_FEATURES, HOME_STATS, generateFeed, DISCORD_URL, fmtCoins } from "../mock";
import ItemIcon from "../components/ItemIcon";
import ServerStatus from "../components/ServerStatus";
import { Button } from "../components/ui/button";

const ICONS = { image: Image, store: Store, map: Map, activity: Activity, trending: TrendingUp, cube: Box };

function FeedRow({ row }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5 last:border-0 hover:bg-secondary/40">
      <ItemIcon item={row.item} size={34} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{row.item.name}</div>
        <div className="text-xs text-muted-foreground">{row.player} · {row.time}</div>
      </div>
      <div className="text-right">
        <div className="mono text-sm font-semibold text-violet-400">{fmtCoins(row.totalPrice)}</div>
        <div className="mono text-xs text-muted-foreground">{row.qty}× {fmtCoins(row.unitPrice)}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const auctions = generateFeed("auction", 6);
  const orders = generateFeed("order", 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-background/60 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="fade-up inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
            <Radio className="live-dot h-3 w-3" /> Live-Marktdaten für den HugoSMP
          </div>
          <h1 className="fade-up mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Der smarteste Weg, den <span className="bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">HugoSMP-Markt</span> zu handeln.
          </h1>
          <p className="fade-up mt-5 max-w-2xl text-lg text-muted-foreground">
            Verfolge Auktionen & Orders live, finde Arbitrage-Deals, berechne Schematics mit 3D-Vorschau, tracke RTP-Koordinaten und verwalte dein Portfolio – alles an einem Ort.
          </p>
          <div className="fade-up mt-8 flex flex-wrap gap-3">
            <Link to="/live"><Button size="lg" className="gap-2 bg-violet-600 text-white hover:bg-violet-500">Live Feed öffnen <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/marketplace"><Button size="lg" variant="outline">Marktplatz durchstöbern</Button></Link>
          </div>

          <div className="fade-up mt-10 max-w-2xl">
            <ServerStatus />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {HOME_STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur">
                <div className="mono text-2xl font-bold text-violet-400">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14">
        {/* Features */}
        <h2 className="text-2xl font-bold">Alle Tools</h2>
        <p className="mt-1 text-muted-foreground">Alles, was du für den Handel auf dem HugoSMP brauchst.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {HOME_FEATURES.map((f) => {
            const Icon = ICONS[f.icon] || Box;
            return (
              <Link key={f.title} to={f.path} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-violet-500/40 hover:glow-violet">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-400">
                  {f.cta} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Live preview */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2"><ArrowDownRight className="h-4 w-4 text-violet-400" /><h3 className="font-semibold">Auktionen</h3></div>
              <Link to="/live" className="text-xs text-violet-400 hover:underline">Alle ansehen</Link>
            </div>
            <div>{auctions.map((r) => <FeedRow key={r.id} row={r} />)}</div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-cyan-400" /><h3 className="font-semibold">Orders</h3></div>
              <Link to="/live" className="text-xs text-violet-400 hover:underline">Alle ansehen</Link>
            </div>
            <div>{orders.map((r) => <FeedRow key={r.id} row={r} />)}</div>
          </div>
        </div>

        {/* Discord CTA */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-card p-8 text-center">
          <h3 className="text-2xl font-bold">Werde Teil der Community</h3>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Tritt dem Discord bei, um Deals zu finden, Preis-Alarme zu erhalten und mit anderen Händlern zu chatten.</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#4752c4]">Discord-Server beitreten</a>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Map, Navigation, ShieldCheck, ShieldAlert, Compass } from "lucide-react";
import { RTP_POINTS } from "../mock";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function RTPTracker() {
  const [points, setPoints] = useState(RTP_POINTS);
  const [selected, setSelected] = useState(RTP_POINTS[0]);

  const reroll = () => {
    const next = RTP_POINTS.map((p) => ({ ...p, x: Math.floor(Math.random() * 20000 - 10000), z: Math.floor(Math.random() * 20000 - 10000), distance: Math.floor(Math.random() * 12000 + 500), safe: Math.random() > 0.3 }));
    setPoints(next);
    setSelected(next[0]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2"><Map className="h-5 w-5 text-violet-400" /><h1 className="text-3xl font-bold">RTP Tracker</h1></div>
      <p className="mt-1 text-muted-foreground">Finde die optimalen Koordinaten für deine nächste Farm oder dein Versteck.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card grid-bg">
            <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-violet-500/20" />
            <div className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-violet-500/20" />
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 shadow-lg shadow-violet-500/50"><div className="h-1.5 w-1.5 rounded-full bg-black" /></div>
              <span className="absolute left-5 top-0 text-[10px] text-violet-400">Spawn</span>
            </div>
            {points.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${50 + (p.x / 20000) * 45}%`, top: `${50 + (p.z / 20000) * 45}%` }}
              >
                <span className={`block h-2.5 w-2.5 rounded-full ring-2 ring-background transition-transform hover:scale-150 ${p.safe ? "bg-violet-400" : "bg-amber-400"} ${selected.id === p.id ? "scale-150 ring-violet-400" : ""}`} />
              </button>
            ))}
          </div>
          <Button onClick={reroll} className="mt-4 gap-2 bg-violet-600 text-white hover:bg-violet-500"><Compass className="h-4 w-4" /> Neue Koordinaten würfeln</Button>
        </div>

        {/* Detail + list */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-violet-500/30 bg-card p-5 glow-violet">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Ausgewählt</h3>
              {selected.safe ? <Badge className="gap-1 bg-violet-500/15 text-violet-400"><ShieldCheck className="h-3 w-3" /> Sicher</Badge> : <Badge className="gap-1 bg-amber-500/15 text-amber-400"><ShieldAlert className="h-3 w-3" /> Risiko</Badge>}
            </div>
            <div className="mono mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">X</span><span>{selected.x.toLocaleString("de-DE")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Z</span><span>{selected.z.toLocaleString("de-DE")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Biom</span><span>{selected.biome}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Distanz</span><span>{selected.distance.toLocaleString("de-DE")} m</span></div>
            </div>
            <Button variant="outline" className="mt-4 w-full gap-2"><Navigation className="h-4 w-4" /> Koordinaten kopieren</Button>
          </div>
          <div className="max-h-[340px] overflow-y-auto rounded-2xl border border-border bg-card">
            {points.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)} className={`flex w-full items-center gap-3 border-b border-border/60 px-4 py-2.5 text-left last:border-0 hover:bg-secondary/40 ${selected.id === p.id ? "bg-secondary/60" : ""}`}>
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.safe ? "bg-violet-400" : "bg-amber-400"}`} />
                <div className="min-w-0 flex-1"><div className="text-sm font-medium">{p.biome}</div><div className="mono text-xs text-muted-foreground">{p.x}, {p.z}</div></div>
                <span className="mono text-xs text-muted-foreground">{p.distance}m</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

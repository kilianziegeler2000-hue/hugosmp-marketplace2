import React, { useMemo, useState } from "react";
import { Box, Layers, Calculator } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";

const BLOCKS = [
  { name: "Stein", color: "#7d7d7d" },
  { name: "Eichenholz", color: "#9c7a4d" },
  { name: "Glas", color: "#a7d8de" },
  { name: "Smaragdblock", color: "#17c964" },
];

export default function Schematic() {
  const [w, setW] = useState(8);
  const [h, setH] = useState(6);
  const [d, setD] = useState(8);
  const [block, setBlock] = useState(0);

  const total = w * h * d;
  const stacks = useMemo(() => ({ full: Math.floor(total / 64), rest: total % 64 }), [total]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2"><Box className="h-5 w-5 text-violet-400" /><h1 className="text-3xl font-bold">Schematic Rechner</h1></div>
      <p className="mt-1 text-muted-foreground">Berechne die benötigten Blöcke für deine Builds – mit 3D-Vorschau.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          {[{ l: "Breite (X)", v: w, set: setW }, { l: "Höhe (Y)", v: h, set: setH }, { l: "Tiefe (Z)", v: d, set: setD }].map((c) => (
            <div key={c.l}>
              <div className="mb-2 flex items-center justify-between"><Label>{c.l}</Label><span className="mono text-sm text-violet-400">{c.v}</span></div>
              <Slider value={[c.v]} min={1} max={32} step={1} onValueChange={(val) => c.set(val[0])} />
            </div>
          ))}
          <div>
            <Label className="mb-2 block">Block</Label>
            <div className="grid grid-cols-2 gap-2">
              {BLOCKS.map((b, i) => (
                <button key={b.name} onClick={() => setBlock(i)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${block === i ? "border-violet-500 bg-violet-500/10" : "border-border hover:bg-secondary"}`}>
                  <span className="h-5 w-5 rounded" style={{ background: b.color }} /> {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D preview */}
        <div className="space-y-4">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-card grid-bg" style={{ perspective: "800px" }}>
            <div style={{ transformStyle: "preserve-3d", transform: "rotateX(-25deg) rotateY(-35deg)" }} className="relative">
              <div style={{ width: w * 12, height: h * 12, background: BLOCKS[block].color, transform: "translateZ(0px)", border: "1px solid rgba(0,0,0,0.3)" }} />
              <div style={{ position: "absolute", top: 0, left: 0, width: d * 12, height: h * 12, background: BLOCKS[block].color, filter: "brightness(0.7)", transform: `rotateY(90deg) translateZ(${w * 12}px)`, transformOrigin: "left", border: "1px solid rgba(0,0,0,0.3)" }} />
              <div style={{ position: "absolute", top: 0, left: 0, width: w * 12, height: d * 12, background: BLOCKS[block].color, filter: "brightness(1.2)", transform: `rotateX(90deg) translateZ(0px)`, transformOrigin: "top", border: "1px solid rgba(0,0,0,0.3)" }} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calculator className="h-3.5 w-3.5" /> Blöcke gesamt</div><div className="mono mt-1 text-xl font-bold text-violet-400">{total.toLocaleString("de-DE")}</div></div>
            <div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Layers className="h-3.5 w-3.5" /> Volle Stacks</div><div className="mono mt-1 text-xl font-bold">{stacks.full}</div></div>
            <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Rest</div><div className="mono mt-1 text-xl font-bold">{stacks.rest}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

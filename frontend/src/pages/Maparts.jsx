import React, { useState } from "react";
import { Image as ImageIcon, Heart, LayoutGrid, X } from "lucide-react";
import { MAPARTS } from "../mock";
import { Badge } from "../components/ui/badge";

function Panel({ palette }) {
  return (
    <div className="grid h-full w-full grid-cols-8 grid-rows-8">
      {Array.from({ length: 64 }).map((_, i) => (
        <div key={i} style={{ background: palette[(i * 7 + (i % 5)) % palette.length] }} />
      ))}
    </div>
  );
}

export default function Maparts() {
  const [liked, setLiked] = useState([]);
  const [active, setActive] = useState(null);
  const toggle = (id) => setLiked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-violet-400" /><h1 className="text-3xl font-bold">Maparts</h1></div>
      <p className="mt-1 text-muted-foreground">Durchstöbere Mapart-Alben und Einzelstücke, verfolge Besitz und entdecke Community-Favoriten.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {MAPARTS.map((m) => (
          <div key={m.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-violet-500/40">
            <button onClick={() => setActive(m)} className="relative block aspect-square w-full overflow-hidden">
              <Panel palette={m.palette} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">Ansehen</span>
              </div>
              <Badge className="absolute left-2 top-2 gap-1 bg-black/60 text-white"><LayoutGrid className="h-3 w-3" /> {m.panels}</Badge>
            </button>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0"><div className="truncate text-sm font-semibold">{m.title}</div><div className="truncate text-xs text-muted-foreground">von {m.author}</div></div>
                <button onClick={() => toggle(m.id)} className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs hover:bg-secondary">
                  <Heart className={`h-4 w-4 ${liked.includes(m.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  <span className="mono">{m.likes + (liked.includes(m.id) ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setActive(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div><div className="font-semibold">{active.title}</div><div className="text-xs text-muted-foreground">von {active.author} · {active.panels} Panels</div></div>
              <button onClick={() => setActive(null)} className="rounded-md p-1.5 hover:bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <div className="aspect-square w-full"><Panel palette={active.palette} /></div>
            <div className="flex items-center justify-between p-4">
              <Badge variant="secondary" className="gap-1"><Heart className="h-3 w-3" /> {active.likes} Likes</Badge>
              <span className="text-sm text-muted-foreground">{active.panels} Karten · {active.panels * 128}×{active.panels * 128} px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

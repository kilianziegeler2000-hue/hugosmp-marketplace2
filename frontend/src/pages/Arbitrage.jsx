import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Lock, Crown, LogIn } from "lucide-react";
import { generateArbitrage, fmtCoins } from "../mock";
import ItemIcon from "../components/ItemIcon";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function Arbitrage() {
  const { isPremium, user, login } = useAuth();
  const rows = useMemo(() => generateArbitrage(12), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-violet-400" />
        <h1 className="text-3xl font-bold">Arbitrage</h1>
        <Badge className="ml-1 gap-1 bg-violet-500/15 text-violet-300"><Crown className="h-3 w-3" /> Premium</Badge>
      </div>
      <p className="mt-1 text-muted-foreground">Vergleiche AH- und Order-Preise, um profitable Deals zu finden. Kaufe niedrig (Order), verkaufe hoch (AH).</p>

      {!isPremium ? (
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-violet-500/30">
          {/* Blurred teaser */}
          <div className="pointer-events-none select-none blur-sm">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              {rows.slice(0, 3).map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3"><ItemIcon item={r.item} size={38} /><span className="truncate text-sm font-medium">{r.item.name}</span></div>
                  <div className="mono mt-3 text-2xl font-bold text-violet-400">+{fmtCoins(r.profit)}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/70 p-8 text-center backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300"><Lock className="h-7 w-7" /></div>
            <div>
              <h3 className="text-xl font-bold">Arbitrage ist ein Premium-Feature</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Finde die profitabelsten AH/Order-Deals in Echtzeit. Schalte Arbitrage mit Premium frei.</p>
            </div>
            {user ? (
              <Link to="/premium"><Button className="gap-1.5 bg-violet-600 text-white hover:bg-violet-500"><Crown className="h-4 w-4" /> Premium holen</Button></Link>
            ) : (
              <Button onClick={login} className="gap-1.5 bg-violet-600 text-white hover:bg-violet-500"><LogIn className="h-4 w-4" /> Anmelden & upgraden</Button>
            )}
          </div>
        </div>
      ) : (
      <>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Deals gefunden</div><div className="mono mt-1 text-2xl font-bold">{rows.length}</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Beste Marge</div><div className="mono mt-1 text-2xl font-bold text-violet-400">{rows[0]?.margin}%</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Max. Profit / Stück</div><div className="mono mt-1 text-2xl font-bold text-violet-400">{fmtCoins(Math.max(...rows.map(r => r.profit)))}</div></div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-12 gap-2 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Kauf (Order)</div>
          <div className="col-span-2 text-right">Verkauf (AH)</div>
          <div className="col-span-1 text-right">Profit</div>
          <div className="col-span-2 text-right">Marge</div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-2 items-center gap-2 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-secondary/40 sm:grid-cols-12">
            <div className="col-span-2 flex items-center gap-3 sm:col-span-5">
              <ItemIcon item={r.item} size={38} />
              <span className="truncate text-sm font-medium">{r.item.name}</span>
            </div>
            <div className="mono col-span-1 text-right text-sm text-cyan-400 sm:col-span-2"><span className="text-muted-foreground sm:hidden">Kauf </span>{fmtCoins(r.buy)}</div>
            <div className="mono col-span-1 text-right text-sm text-violet-400 sm:col-span-2"><span className="text-muted-foreground sm:hidden">VK </span>{fmtCoins(r.sell)}</div>
            <div className="mono col-span-1 text-right text-sm font-semibold sm:col-span-1">+{fmtCoins(r.profit)}</div>
            <div className="col-span-1 flex justify-end sm:col-span-2">
              <Badge className={`mono ${Number(r.margin) > 25 ? "bg-violet-500/15 text-violet-400" : "bg-secondary text-foreground"}`}>{r.margin}%</Badge>
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

import React from "react";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PORTFOLIO, PRICE_HISTORY, fmtCoins } from "../mock";
import ItemIcon from "../components/ItemIcon";

function Sparkline({ data, color = "#a78bfa" }) {
  const max = Math.max(...data.map((d) => d.v));
  const min = Math.min(...data.map((d) => d.v));
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${40 - ((d.v - min) / (max - min || 1)) * 38}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-16 w-full">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function Portfolio() {
  const up = PORTFOLIO.change24h >= 0;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2"><Wallet className="h-5 w-5 text-violet-400" /><h1 className="text-3xl font-bold">Portfolio</h1></div>
      <p className="mt-1 text-muted-foreground">Verfolge den Wert deiner Spawner und Items in Echtzeit.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-card p-6 lg:col-span-2">
          <div className="text-sm text-muted-foreground">Gesamtwert</div>
          <div className="mono mt-1 text-4xl font-extrabold">{fmtCoins(PORTFOLIO.totalValue)}</div>
          <div className={`mono mt-2 inline-flex items-center gap-1 text-sm ${up ? "text-violet-400" : "text-red-400"}`}>{up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{Math.abs(PORTFOLIO.change24h)}% (24h)</div>
          <div className="mt-4"><Sparkline data={PRICE_HISTORY} /></div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm text-muted-foreground">Positionen</div>
          <div className="mono mt-1 text-3xl font-bold">{PORTFOLIO.holdings.length}</div>
          <div className="mt-4 text-sm text-muted-foreground">Bester Performer</div>
          <div className="mt-2 flex items-center gap-2"><ItemIcon item={PORTFOLIO.holdings[1].item} size={36} /><span className="text-sm font-medium">{PORTFOLIO.holdings[1].item.name}</span></div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-12 gap-2 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <div className="col-span-5">Position</div><div className="col-span-2 text-right">Menge</div><div className="col-span-2 text-right">Ø Kauf</div><div className="col-span-3 text-right">Wert / P&L</div>
        </div>
        {PORTFOLIO.holdings.map((h) => {
          const value = h.item.price * h.qty;
          const pnl = (h.item.price - h.avgBuy) * h.qty;
          const pos = pnl >= 0;
          return (
            <div key={h.item.id} className="grid grid-cols-2 items-center gap-2 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-secondary/40 sm:grid-cols-12">
              <div className="col-span-2 flex items-center gap-3 sm:col-span-5"><ItemIcon item={h.item} size={40} /><span className="truncate text-sm font-medium">{h.item.name}</span></div>
              <div className="mono col-span-1 text-right text-sm sm:col-span-2">{h.qty}</div>
              <div className="mono col-span-1 hidden text-right text-sm text-muted-foreground sm:col-span-2 sm:block">{fmtCoins(h.avgBuy)}</div>
              <div className="col-span-2 text-right sm:col-span-3">
                <div className="mono text-sm font-semibold">{fmtCoins(value)}</div>
                <div className={`mono text-xs ${pos ? "text-violet-400" : "text-red-400"}`}>{pos ? "+" : ""}{fmtCoins(pnl)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Radio, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

function fmtCoins(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(n) + " $";
}

function formatTime(value) {
  if (!value) return "unbekannt";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("de-DE");
}

function AuctionRow({ auction }) {
  return (
    <div className="grid gap-3 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-secondary/40 sm:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">{auction.displayName || auction.name}</span>
          <Badge variant="secondary">{auction.count || 1}×</Badge>
          {auction.enchants?.length > 0 && <Badge className="bg-violet-500/15 text-violet-300">Verzaubert</Badge>}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Verkäufer: {auction.seller || "Unbekannt"} · entdeckt: {formatTime(auction.firstSeenAt)}
        </div>
        {auction.expires && <div className="mt-1 text-xs text-cyan-300">Läuft ab in: {auction.expires}</div>}
      </div>
      <div className="text-left sm:text-right">
        <div className="mono text-sm font-bold text-violet-400">{fmtCoins(auction.price?.value)}</div>
        <div className="mono text-xs text-muted-foreground">{fmtCoins(auction.unitPrice)} / Stück</div>
      </div>
    </div>
  );
}

export default function LiveFeed() {
  const [auctions, setAuctions] = useState([]);
  const [scanner, setScanner] = useState(null);
  const [query, setQuery] = useState("");
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAuctions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/auctions?limit=300`);
      if (!response.ok) throw new Error(`API-Fehler ${response.status}`);
      const data = await response.json();
      setAuctions(data.auctions || []);
      setScanner(data.scanner || null);
      setError("");
    } catch (err) {
      setError(err.message || "Auktionen konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
    if (paused) return undefined;
    const timer = setInterval(loadAuctions, 5000);
    return () => clearInterval(timer);
  }, [loadAuctions, paused]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return auctions;
    return auctions.filter((auction) =>
      [auction.displayName, auction.name, auction.seller].some((value) =>
        String(value || "").toLowerCase().includes(needle)
      )
    );
  }, [auctions, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="live-dot h-5 w-5 text-violet-400" />
            <h1 className="text-3xl font-bold">Live Auktionen</h1>
          </div>
          <p className="mt-1 text-muted-foreground">Echte Daten direkt vom HugoSMP-Auktionsscanner.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAuctions} className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
          </button>
          <button onClick={() => setPaused((v) => !v)} className={`rounded-lg border px-3 py-1.5 text-sm ${paused ? "border-border bg-secondary" : "border-violet-500/40 bg-violet-500/10 text-violet-300"}`}>
            {paused ? "Fortsetzen" : "Live"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Aktive Auktionen</div><div className="mt-1 text-2xl font-bold">{auctions.length}</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Letzter Scan</div><div className="mt-1 text-sm font-semibold">{formatTime(scanner?.scannedAt)}</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Neue im letzten Scan</div><div className="mt-1 text-2xl font-bold text-violet-400">{scanner?.newAuctions ?? 0}</div></div>
      </div>

      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Item oder Verkäufer suchen..." className="pl-9" />
      </div>

      {error && <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-semibold">Neueste Auktionen</h2>
          <Badge variant="secondary">{filtered.length}</Badge>
        </div>
        {loading && auctions.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Auktionen werden geladen …</div>}
        {!loading && filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Noch keine passenden Auktionen vorhanden. Starte den Scanner und prüfe den API-Schlüssel.</div>}
        <div className="max-h-[720px] overflow-y-auto">
          {filtered.map((auction) => <AuctionRow key={auction.id} auction={auction} />)}
        </div>
      </div>
    </div>
  );
}

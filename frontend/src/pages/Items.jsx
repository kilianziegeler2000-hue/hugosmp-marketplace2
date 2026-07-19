import React, { useState } from "react";
import { Search, Bookmark, BookmarkCheck, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ITEMS, fmtCoins } from "../mock";
import ItemIcon from "../components/ItemIcon";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function Items() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [saved, setSaved] = useState(["blaze", "enderman", "guardian"]);

  const filtered = ITEMS.filter((i) => {
    const matchQ = i.name.toLowerCase().includes(query.toLowerCase());
    const matchC = cat === "all" || (cat === "saved" ? saved.includes(i.id) : i.cat.toLowerCase() === cat);
    return matchQ && matchC;
  });

  const toggleSave = (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Items</h1>
      <p className="mt-1 text-muted-foreground"><span className="mono font-semibold text-foreground">{ITEMS.length}</span> getrackte Items · <span className="mono font-semibold text-violet-400">{saved.length}</span> gespeichert</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Items suchen..." className="pl-9" />
        </div>
        <Tabs value={cat} onValueChange={setCat}>
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="spawner">Spawner</TabsTrigger>
            <TabsTrigger value="item">Items</TabsTrigger>
            <TabsTrigger value="saved">Gespeichert</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => {
          const up = i.change >= 0;
          const isSaved = saved.includes(i.id);
          return (
            <div key={i.id} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-violet-500/40">
              <ItemIcon item={i} size={48} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{i.name}</div>
                <div className="text-xs text-muted-foreground">{i.cat}</div>
              </div>
              <div className="text-right">
                <div className="mono font-semibold">{fmtCoins(i.price)}</div>
                <div className={`mono flex items-center justify-end gap-0.5 text-xs ${up ? "text-violet-400" : "text-red-400"}`}>
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{Math.abs(i.change)}%
                </div>
              </div>
              <button onClick={() => toggleSave(i.id)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-violet-400">
                {isSaved ? <BookmarkCheck className="h-5 w-5 text-violet-400" /> : <Bookmark className="h-5 w-5" />}
              </button>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="mt-10 text-center text-muted-foreground">Keine Items gefunden.</div>}
    </div>
  );
}

import React, { useState } from "react";
import { Store, MessageSquare, ShoppingCart, Tag, ShieldCheck, X, Send } from "lucide-react";
import { MARKETPLACE_LISTINGS, fmtCoins } from "../mock";
import ItemIcon from "../components/ItemIcon";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function Marketplace() {
  const [tab, setTab] = useState("all");
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  const listings = MARKETPLACE_LISTINGS.filter((l) => tab === "all" || l.type === tab);

  const openChat = (l) => {
    setChat(l);
    setMessages([{ me: false, text: `Hey! Ich verkaufe ${l.qty}× ${l.item.name} für ${fmtCoins(l.price)}/Stück. In-Game Trade?` }]);
  };
  const send = () => {
    if (!msg.trim()) return;
    setMessages((m) => [...m, { me: true, text: msg }]);
    setMsg("");
    setTimeout(() => setMessages((m) => [...m, { me: false, text: "Alles klar, treffen wir uns am Spawn? 👍".replace("👍", "") }]), 800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2"><Store className="h-5 w-5 text-violet-400" /><h1 className="text-3xl font-bold">Marktplatz</h1></div>
      <p className="mt-1 text-muted-foreground">Handle Spawner von Spieler zu Spieler mit Angeboten, Kaufaufträgen und Deal-Chat. Nur In-Game-Trades, kein IRL-Handel.</p>

      <div className="mt-6 flex items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="listing">Angebote</TabsTrigger>
            <TabsTrigger value="order">Kaufaufträge</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button className="gap-2 bg-violet-600 text-white hover:bg-violet-500"><Tag className="h-4 w-4" /> Angebot erstellen</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <div key={l.id} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-violet-500/40">
            <div className="flex items-start gap-3">
              <ItemIcon item={l.item} size={52} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{l.item.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-violet-400" /> {l.seller}</div>
              </div>
              <Badge className={l.type === "order" ? "bg-cyan-500/15 text-cyan-400" : "bg-violet-500/15 text-violet-400"}>{l.type === "order" ? "Kauf" : "Verkauf"}</Badge>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="mono text-2xl font-bold text-violet-400">{fmtCoins(l.price)}</div>
                <div className="text-xs text-muted-foreground">pro Stück · {l.qty} verfügbar</div>
              </div>
              <Badge variant="secondary">{l.note}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => openChat(l)}><MessageSquare className="h-4 w-4" /> Chat</Button>
              <Button className="flex-1 gap-1.5 bg-violet-600 text-white hover:bg-violet-500"><ShoppingCart className="h-4 w-4" /> {l.type === "order" ? "Anbieten" : "Kaufen"}</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Deal Chat Modal */}
      {chat && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={() => setChat(null)}>
          <div className="flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-card sm:h-[70vh] sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2"><ItemIcon item={chat.item} size={34} /><div><div className="text-sm font-semibold">{chat.seller}</div><div className="text-xs text-muted-foreground">{chat.item.name}</div></div></div>
              <button onClick={() => setChat(null)} className="rounded-md p-1.5 hover:bg-secondary"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.me ? "bg-violet-600 text-white" : "bg-secondary"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <Input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Nachricht..." />
              <Button size="icon" className="bg-violet-600 text-white hover:bg-violet-500" onClick={send}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { Gem, MessageCircle } from "lucide-react";
import { NAV_LINKS, DISCORD_URL } from "../mock";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600">
                <Gem className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-extrabold">HugoSMP Market</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Verfolge Auktionen & Orders live, AH/Order-Arbitrage, Schematic-Rechner mit 3D-Vorschau, RTP-Tracker und Portfolios.
            </p>
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4752c4]">
              <MessageCircle className="h-4 w-4" /> Discord-Server beitreten
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tools</h4>
              <ul className="space-y-2 text-sm">
                {NAV_LINKS.slice(1, 6).map((l) => (
                  <li key={l.key}><Link to={l.path} className="text-muted-foreground hover:text-violet-400">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Markt</h4>
              <ul className="space-y-2 text-sm">
                {NAV_LINKS.slice(6).map((l) => (
                  <li key={l.key}><Link to={l.path} className="text-muted-foreground hover:text-violet-400">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Info</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Nur In-Game-Trades</li>
                <li>Kein IRL-Handel</li>
                <li>Community-Projekt</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HugoSMP Market · Nicht offiziell mit Mojang/Microsoft verbunden.
        </div>
      </div>
    </footer>
  );
}

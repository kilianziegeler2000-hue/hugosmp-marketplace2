import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Gem, MessageCircle, LogIn, Crown, Code } from "lucide-react";
import { NAV_LINKS, DISCORD_URL } from "../mock";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, login, isPremium, isDev, plan } = useAuth();
  const isActive = (path) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path));

  const planLabel = isDev ? "Dev" : plan === "premium_plus" ? "Premium+" : plan === "premium" ? "Premium" : "Free";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
            <Gem className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight">HugoSMP</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-violet-400">Market</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.key}
              to={l.path}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(l.path) ? "bg-secondary text-violet-400" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/profile" className="hidden items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 hover:border-violet-500/40 sm:flex">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-6 w-6 rounded-full" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white">{user.username?.[0]?.toUpperCase()}</div>
              )}
              <span className="max-w-[90px] truncate text-sm font-medium">{user.username}</span>
              <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${isDev ? "bg-amber-400/20 text-amber-300" : isPremium ? "bg-violet-500/20 text-violet-300" : "bg-secondary text-muted-foreground"}`}>
                {isDev ? <Code className="h-2.5 w-2.5" /> : isPremium ? <Crown className="h-2.5 w-2.5" /> : null}{planLabel}
              </span>
            </Link>
          ) : (
            <Button size="sm" onClick={login} className="hidden gap-1.5 bg-violet-600 text-white hover:bg-violet-500 sm:flex">
              <LogIn className="h-4 w-4" /> Anmelden
            </Button>
          )}
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
            <Button size="sm" variant="outline" className="gap-1.5">
              <MessageCircle className="h-4 w-4" /> Discord
            </Button>
          </a>
          <button className="xl:hidden rounded-md p-2 text-foreground hover:bg-secondary" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background xl:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 p-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.key}
                to={l.path}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(l.path) ? "bg-secondary text-violet-400" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link to="/profile" onClick={() => setOpen(false)} className="col-span-2 mt-1 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5">
                {user.avatar ? <img src={user.avatar} alt="" className="h-6 w-6 rounded-full" /> : <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white">{user.username?.[0]?.toUpperCase()}</div>}
                <span className="flex-1 truncate text-sm font-medium">{user.username}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${isDev ? "bg-amber-400/20 text-amber-300" : isPremium ? "bg-violet-500/20 text-violet-300" : "bg-secondary text-muted-foreground"}`}>{planLabel}</span>
              </Link>
            ) : (
              <Button onClick={() => { setOpen(false); login(); }} className="col-span-2 mt-1 w-full gap-1.5 bg-violet-600 text-white hover:bg-violet-500">
                <LogIn className="h-4 w-4" /> Mit Discord anmelden
              </Button>
            )}
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="col-span-2">
              <Button variant="outline" className="w-full gap-1.5">
                <MessageCircle className="h-4 w-4" /> Discord-Server
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

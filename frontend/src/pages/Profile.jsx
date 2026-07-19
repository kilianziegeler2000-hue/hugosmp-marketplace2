import React from "react";
import { Link } from "react-router-dom";
import { User, Repeat, Crown, Bell, Shield, LogOut, LogIn, Sparkles, Calendar, Code } from "lucide-react";
import { DISCORD_URL } from "../mock";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, loading, login, logout, isPremium, isDev, plan } = useAuth();
  const planLabel = isDev ? "Dev" : plan === "premium_plus" ? "Premium+" : plan === "premium" ? "Premium" : "Free";

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted-foreground">Lädt…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300"><User className="h-8 w-8" /></div>
        <h1 className="mt-5 text-2xl font-bold">Melde dich an</h1>
        <p className="mt-2 text-muted-foreground">Logge dich mit Discord ein, um dein Profil, Portfolio und Premium zu verwalten.</p>
        <Button onClick={login} className="mt-6 gap-2 bg-violet-600 text-white hover:bg-violet-500"><LogIn className="h-4 w-4" /> Mit Discord anmelden</Button>
      </div>
    );
  }

  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("de-DE", { month: "long", year: "numeric" }) : "—";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2"><User className="h-5 w-5 text-violet-400" /><h1 className="text-3xl font-bold">Profil</h1></div>

      <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="h-20 w-20 rounded-2xl" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-3xl font-black text-white">
            {user.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <Badge className={`gap-1 ${isDev ? "bg-amber-400/20 text-amber-300" : isPremium ? "bg-violet-500/15 text-violet-400" : "bg-secondary text-muted-foreground"}`}>
              {isDev ? <Code className="h-3 w-3" /> : isPremium ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />} {planLabel}
            </Badge>
          </div>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start"><Calendar className="h-3.5 w-3.5" /> Mitglied seit {memberSince}</p>
        </div>
        {!isPremium && (
          <Link to="/premium"><Button className="gap-2 bg-violet-600 text-white hover:bg-violet-500"><Crown className="h-4 w-4" /> Premium holen</Button></Link>
        )}
      </div>

      {isPremium && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
          <Crown className="h-5 w-5 text-violet-300" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-violet-200">{planLabel} aktiv.</span>{" "}
            <span className="text-muted-foreground">
              {user.plan_expiry ? `Läuft bis ${new Date(user.plan_expiry).toLocaleDateString("de-DE")}` : ""}
            </span>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold">Einstellungen</h3>
        <div className="mt-4 space-y-1">
          {[
            { icon: Bell, label: "Preis-Alarme", desc: "Benachrichtigung bei Zielpreis (Premium)", on: isPremium },
            { icon: Repeat, label: "Arbitrage-Alarme", desc: "Push bei profitablen Deals (Premium)", on: isPremium },
            { icon: Shield, label: "Nur verifizierte Trader", desc: "Deals nur mit Trusted-Playern", on: false },
          ].map((r) => (
            <div key={r.label}>
              <div className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-violet-400"><r.icon className="h-4 w-4" /></div>
                <div className="flex-1"><div className="text-sm font-medium">{r.label}</div><div className="text-xs text-muted-foreground">{r.desc}</div></div>
                <Switch defaultChecked={r.on} disabled={!isPremium && r.label !== "Nur verifizierte Trader"} />
              </div>
              <Separator />
            </div>
          ))}
        </div>
        <Button onClick={logout} variant="outline" className="mt-4 gap-2 text-red-400 hover:text-red-300"><LogOut className="h-4 w-4" /> Abmelden</Button>
      </div>
    </div>
  );
}

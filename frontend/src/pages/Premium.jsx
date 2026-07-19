import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Check, Crown, Sparkles, LogIn, Loader2, CheckCircle2 } from "lucide-react";
import { PREMIUM_PLANS, DISCORD_URL } from "../mock";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { toast } from "../hooks/use-toast";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PLAN_ID = { Premium: "premium", "Premium+": "premium_plus" };

export default function Premium() {
  const { user, token, login, plan, refresh } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const [checking, setChecking] = useState(false);

  const pollStatus = useCallback(async (sessionId, attempts = 0) => {
    const maxAttempts = 6;
    if (attempts >= maxAttempts) {
      setChecking(false);
      toast({ title: "Zahlungsstatus unklar", description: "Bitte lade die Seite in einem Moment neu." });
      return;
    }
    try {
      const r = await axios.get(`${API}/payments/status/${sessionId}`);
      if (r.data.payment_status === "paid") {
        setChecking(false);
        toast({ title: "Zahlung erfolgreich! 🎉", description: "Dein Premium ist jetzt aktiv." });
        refresh();
        return;
      }
      if (r.data.status === "expired") {
        setChecking(false);
        toast({ title: "Sitzung abgelaufen", description: "Bitte versuche es erneut." });
        return;
      }
      setTimeout(() => pollStatus(sessionId, attempts + 1), 2000);
    } catch (e) {
      setChecking(false);
    }
  }, [refresh]);

  // Returning from Stripe
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get("session_id");
    if (sid) {
      setChecking(true);
      pollStatus(sid);
      navigate("/premium", { replace: true });
    }
  }, [location.search, pollStatus, navigate]);

  const startCheckout = async (planName) => {
    if (!user) {
      login();
      return;
    }
    const planId = PLAN_ID[planName];
    if (!planId) return;
    setBusy(planId);
    try {
      const r = await axios.post(
        `${API}/payments/checkout`,
        { plan_id: planId, origin_url: window.location.origin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = r.data.url;
    } catch (e) {
      setBusy(null);
      toast({ title: "Fehler", description: "Checkout konnte nicht gestartet werden." });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400"><Crown className="h-3.5 w-3.5" /> Premium</div>
        <h1 className="mt-4 text-4xl font-extrabold">Wähle deinen Plan</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Schalte Echtzeit-Daten, Arbitrage und Pro-Tools frei. Jederzeit kündbar.</p>
      </div>

      {checking && (
        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Zahlung wird geprüft…
        </div>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PREMIUM_PLANS.map((p) => {
          const planId = PLAN_ID[p.name];
          const isCurrent = (p.name === "Free" && plan === "free") || planId === plan;
          return (
            <div key={p.name} className={`relative rounded-2xl border p-6 ${p.featured ? "border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-card glow-violet" : "border-border bg-card"}`}>
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">Beliebt</div>}
              <div className="flex items-center gap-2">
                {p.featured ? <Crown className="h-5 w-5 text-violet-400" /> : <Sparkles className="h-5 w-5 text-muted-foreground" />}
                <h3 className="text-lg font-bold">{p.name}</h3>
              </div>
              <div className="mt-4 flex items-end gap-1"><span className="mono text-4xl font-extrabold">{p.price}€</span><span className="mb-1 text-sm text-muted-foreground">{p.period}</span></div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" /> {f}</li>
                ))}
              </ul>

              {p.name === "Free" ? (
                <Button className="mt-6 w-full" variant="outline" disabled>{plan === "free" ? "Aktueller Plan" : "Basis"}</Button>
              ) : isCurrent ? (
                <Button className="mt-6 w-full gap-1.5 bg-violet-600 text-white hover:bg-violet-500" disabled>
                  <CheckCircle2 className="h-4 w-4" /> Aktiv
                </Button>
              ) : (
                <Button
                  onClick={() => startCheckout(p.name)}
                  disabled={busy === planId}
                  className={`mt-6 w-full gap-1.5 ${p.featured ? "bg-violet-600 text-white hover:bg-violet-500" : ""}`}
                  variant={p.featured ? "default" : "outline"}
                >
                  {busy === planId ? <Loader2 className="h-4 w-4 animate-spin" /> : !user ? <LogIn className="h-4 w-4" /> : null}
                  {!user ? "Anmelden zum Kaufen" : busy === planId ? "Weiterleitung…" : `${p.name} kaufen`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Zahlung sicher über Stripe · Premium-Rolle wird über Discord vergeben.</p>
        <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4752c4]">Discord-Server</a>
      </div>
    </div>
  );
}

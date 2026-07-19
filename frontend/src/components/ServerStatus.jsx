import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Server, Wifi, WifiOff } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ServerStatus({ compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const r = await axios.get(`${API}/server-status`);
        if (active) setData(r.data);
      } catch (e) {
        if (active) setData({ online: false });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, []);

  const online = data?.online;
  const players = data?.players_online;
  const max = data?.players_max;

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
        <span className={`h-2 w-2 rounded-full ${online ? "live-dot bg-green-400" : "bg-red-400"}`} />
        <span className="text-sm font-medium">{loading ? "…" : online ? `${players?.toLocaleString("de-DE")} online` : "Offline"}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-violet-500/30 bg-card/70 p-5 backdrop-blur glow-violet sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
          <Server className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">hugosmp.net</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${online ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {loading ? "prüfe…" : online ? "Online" : "Offline"}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {data?.version ? `Version ${data.version}` : "Echter Server-Status · live"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <Users className="h-4 w-4 text-violet-300" />
            <span className="mono text-2xl font-bold">
              {loading ? "…" : online ? players?.toLocaleString("de-DE") : "–"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">von {max ? max.toLocaleString("de-DE") : "–"} Spielern online</div>
        </div>
      </div>
    </div>
  );
}

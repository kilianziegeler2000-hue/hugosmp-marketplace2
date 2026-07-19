import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("hugosmp_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (tk) => {
    if (!tk) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const r = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${tk}` } });
      setUser(r.data);
    } catch (e) {
      setUser(null);
      localStorage.removeItem("hugosmp_token");
    } finally {
      setLoading(false);
    }
  }, []);

  // Capture ?token= from Discord OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      localStorage.setItem("hugosmp_token", t);
      setToken(t);
      params.delete("token");
      const q = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (q ? `?${q}` : ""));
    }
  }, []);

  useEffect(() => {
    fetchMe(token);
  }, [token, fetchMe]);

  const login = async () => {
    try {
      const r = await axios.get(`${API}/auth/discord/login`);
      const url = r.data.url;
      // Discord forbids being loaded inside an iframe (e.g. the preview pane).
      // Break out to the top window, or open a new tab as fallback.
      const inIframe = window.self !== window.top;
      if (inIframe) {
        try {
          window.top.location.href = url;
        } catch (e) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      } else {
        window.location.href = url;
      }
    } catch (e) {
      console.error("login error", e);
    }
  };

  const logout = () => {
    localStorage.removeItem("hugosmp_token");
    setToken(null);
    setUser(null);
  };

  const refresh = () => fetchMe(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refresh,
        isPremium: !!user?.is_premium,
        isDev: !!user?.is_dev,
        plan: user?.plan || "free",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Items from "./pages/Items";
import LiveFeed from "./pages/LiveFeed";
import Arbitrage from "./pages/Arbitrage";
import Schematic from "./pages/Schematic";
import RTPTracker from "./pages/RTPTracker";
import Marketplace from "./pages/Marketplace";
import Maparts from "./pages/Maparts";
import Portfolio from "./pages/Portfolio";
import Premium from "./pages/Premium";
import Profile from "./pages/Profile";
import { Toaster } from "./components/ui/toaster";

function ScrollTop() {
  return null;
}

function App() {
  return (
    <div className="App relative min-h-screen text-foreground">
      <div className="galaxy-bg" />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/items" element={<Items />} />
              <Route path="/live" element={<LiveFeed />} />
              <Route path="/arbitrage" element={<Arbitrage />} />
              <Route path="/schematic" element={<Schematic />} />
              <Route path="/rtp" element={<RTPTracker />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/maparts" element={<Maparts />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </div>
  );
}

export default App;

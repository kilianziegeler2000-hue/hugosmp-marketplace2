import React, { useState } from "react";
import { Box, Skull, Bug, Sparkles, Feather, Shield, BookOpen, Flame, Zap, Ghost, Bot, Droplet, Package } from "lucide-react";

const MAP = {
  blaze: Flame,
  skull: Skull,
  ender: Ghost,
  zombie: Bug,
  skeleton: Skull,
  creeper: Bug,
  spider: Bug,
  witch: Sparkles,
  guardian: Shield,
  golem: Bot,
  slime: Droplet,
  magma: Flame,
  silverfish: Bug,
  elytra: Feather,
  ingot: Box,
  totem: Sparkles,
  book: BookOpen,
  box: Package,
  beacon: Zap,
};

export default function ItemIcon({ item, size = 40 }) {
  const [err, setErr] = useState(false);
  const Icon = MAP[item.icon] || Box;
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg"
      style={{
        width: size,
        height: size,
        background: `${item.color}22`,
        border: `1px solid ${item.color}44`,
      }}
    >
      {item.img && !err ? (
        <img
          src={item.img}
          alt={item.name}
          onError={() => setErr(true)}
          loading="lazy"
          style={{ width: size * 0.72, height: size * 0.72, imageRendering: "pixelated", objectFit: "contain" }}
        />
      ) : (
        <Icon style={{ color: item.color, width: size * 0.5, height: size * 0.5 }} />
      )}
    </div>
  );
}

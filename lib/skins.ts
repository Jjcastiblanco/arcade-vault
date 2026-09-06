export type SkinId = "neon" | "retro" | "clasico";

export type SkinTokens = {
  id: SkinId;
  label: string;
  background: string;
  primary: string;
  accent: string;
  text: string;
  effect?: "glow" | "scanlines" | "none";
};

export const SKINS: Record<string, Record<SkinId, SkinTokens>> = {
  caida: {
    neon: {
      id: "neon",
      label: "Neón",
      background: "#0a0a12",
      primary: "#ff006e", // --magenta, color oficial del juego en lib/data.ts
      accent: "#00f5ff", // --cyan como acento de contraste
      text: "#f5f5ff",
      effect: "glow",
    },
    retro: {
      id: "retro",
      label: "Retro CRT",
      background: "#1c1608",
      primary: "#ffb000", // ámbar fósforo, clásico terminal/arcade
      accent: "#33ff33", // verde fósforo de respaldo
      text: "#ffcc66",
      effect: "scanlines",
    },
    clasico: {
      id: "clasico",
      label: "Clásico",
      background: "#1a1a25",
      primary: "#9e9e9e",
      accent: "#7aa2f7",
      text: "#cccccc",
      effect: "none",
    },
  },
  rocas: {
    neon: {
      id: "neon",
      label: "Neón",
      background: "#050508",
      primary: "#00f5ff", // --cyan, trazo vectorial de nave/asteroides con máximo contraste
      accent: "#ffe600", // --yellow, color oficial del juego en lib/data.ts, usado como acento (disparos/OVNIs)
      text: "#e6feff",
      effect: "glow",
    },
    retro: {
      id: "retro",
      label: "Retro CRT",
      background: "#020a02",
      primary: "#33ff33", // verde fósforo, vector arcade clásico tipo osciloscopio
      accent: "#0aff9d",
      text: "#a6ffb0",
      effect: "scanlines",
    },
    clasico: {
      id: "clasico",
      label: "Clásico",
      background: "#000000",
      primary: "#ffffff", // fiel al Asteroids original: líneas blancas sobre negro puro
      accent: "#ffffff",
      text: "#ffffff",
      effect: "none",
    },
  },
  serpentina: {
    neon: {
      id: "neon",
      label: "Neón",
      background: "#0a0a12",
      primary: "#39ff88", // verde neón, color oficial del juego en lib/data.ts
      accent: "#ff006e", // --magenta como acento (fruta/cabeza)
      text: "#e6ffe9",
      effect: "glow",
    },
    retro: {
      id: "retro",
      label: "Retro CRT",
      background: "#031406",
      primary: "#33ff33", // verde fósforo, terminal clásica
      accent: "#ffb000",
      text: "#a6ffb0",
      effect: "scanlines",
    },
    clasico: {
      id: "clasico",
      label: "Clásico",
      background: "#0a0a0a",
      primary: "#ffffff", // fiel al Snake de Nokia: blanco sobre negro
      accent: "#ffffff",
      text: "#ffffff",
      effect: "none",
    },
  },
  "bloque-buster": {
    neon: {
      id: "neon",
      label: "Neón",
      background: "#0a0a12",
      primary: "#00f5ff", // --cyan, color oficial del juego en lib/data.ts (paleta)
      accent: "#ff006e", // --magenta como acento (pelota)
      text: "#e6feff",
      effect: "glow",
    },
    retro: {
      id: "retro",
      label: "Retro CRT",
      background: "#1c1608",
      primary: "#ffb000", // ámbar fósforo, clásico terminal/arcade
      accent: "#33ff33",
      text: "#ffcc66",
      effect: "scanlines",
    },
    clasico: {
      id: "clasico",
      label: "Clásico",
      background: "#000000",
      primary: "#ffffff", // fiel al Breakout/Arkanoid original: paleta y pelota blancas
      accent: "#ffffff",
      text: "#ffffff",
      effect: "none",
    },
  },
};

export const DEFAULT_SKIN: SkinId = "clasico";

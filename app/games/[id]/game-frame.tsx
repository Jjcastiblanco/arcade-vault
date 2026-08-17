"use client";

import { useState } from "react";
import { useSession } from "@/app/providers/session-provider";
import AsteroidsCanvas, { type AsteroidsHud } from "./asteroids-canvas";

export default function GameFrame({ onExit }: { onExit: () => void }) {
  const { user } = useSession();
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<AsteroidsHud>({
    score: 0,
    lives: 3,
    level: 1,
  });

  return (
    <div className="game-frame">
      <div className="game-frame-top">
        <div className="game-frame-stats">
          <div>
            <div className="l">Jugador</div>
            <div className="v neon-cyan">{user?.name ?? "INVITADO"}</div>
          </div>
          <div>
            <div className="l">Puntuación</div>
            <div className="v">{hud.score}</div>
          </div>
          <div>
            <div className="l">Vidas</div>
            <div className="v game-frame-lives">
              {Array.from({ length: hud.lives }).map((_, i) => (
                <span key={i} className="neon-magenta">
                  ♥
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="l">Nivel</div>
            <div className="v neon-yellow">
              {String(hud.level).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="game-frame-buttons">
          <button className="btn ghost lg" onClick={() => setPaused((p) => !p)}>
            {paused ? "▶ REANUDAR" : "❚❚ PAUSA"}
          </button>
          <button className="btn ghost lg" onClick={onExit}>
            ✕ FIN
          </button>
          <button className="btn ghost lg" onClick={onExit}>
            ✕ SALIR
          </button>
        </div>
      </div>

      <div className="game-frame-screen">
        <AsteroidsCanvas paused={paused} onHud={setHud} />
      </div>

      <div className="game-frame-status">
        <span className="game-frame-signal">● SEÑAL OK</span>
        <span>ASTEROIDS · CRT-01 · 60 HZ</span>
        <span>CARGA · 1MB</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "@/app/providers/session-provider";
import TetrisCanvas, { type TetrisHud } from "./tetris-canvas";

export default function TetrisFrame({ onExit }: { onExit: () => void }) {
  const { user } = useSession();
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<TetrisHud>({ score: 0, lines: 0, level: 1 });

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
            <div className="l">Líneas</div>
            <div className="v neon-magenta">{hud.lines}</div>
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
            ✕ SALIR
          </button>
        </div>
      </div>

      <div className="game-frame-screen">
        <TetrisCanvas paused={paused} onHud={setHud} />
      </div>

      <div className="game-frame-status">
        <span className="game-frame-signal">● SEÑAL OK</span>
        <span>TETRIS · CRT-01 · 60 HZ</span>
        <span>CARGA · 1MB</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "@/app/providers/session-provider";
import SnakeCanvas, { type SnakeHud } from "./snake-canvas";
import { SKINS, DEFAULT_SKIN, type SkinId } from "@/lib/skins";

export default function SnakeFrame({ onExit }: { onExit: () => void }) {
  const { user } = useSession();
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<SnakeHud>({ score: 0, length: 3, level: 1 });
  const [skinId, setSkinId] = useState<SkinId>(DEFAULT_SKIN);
  const skin = SKINS.serpentina[skinId];

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
            <div className="l">Longitud</div>
            <div className="v neon-magenta">{hud.length}</div>
          </div>
          <div>
            <div className="l">Nivel</div>
            <div className="v neon-yellow">
              {String(hud.level).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="game-frame-buttons">
          {(Object.keys(SKINS.serpentina) as SkinId[]).map((id) => (
            <button
              key={id}
              className="btn ghost lg"
              style={
                id === skinId
                  ? { borderColor: skin.primary, color: skin.primary }
                  : undefined
              }
              onClick={() => setSkinId(id)}
            >
              {SKINS.serpentina[id].label}
            </button>
          ))}
          <button className="btn ghost lg" onClick={() => setPaused((p) => !p)}>
            {paused ? "▶ REANUDAR" : "❚❚ PAUSA"}
          </button>
          <button className="btn ghost lg" onClick={onExit}>
            ✕ SALIR
          </button>
        </div>
      </div>

      <div className="game-frame-screen">
        <SnakeCanvas paused={paused} onHud={setHud} skin={skin} />
      </div>

      <div className="game-frame-status">
        <span className="game-frame-signal">● SEÑAL OK</span>
        <span>SERPENTINA · CRT-01 · 60 HZ</span>
        <span>CARGA · 1MB</span>
      </div>
    </div>
  );
}

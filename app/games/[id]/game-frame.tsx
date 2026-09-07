"use client";

import { useState } from "react";
import { useSession } from "@/app/providers/session-provider";
import { submitScore } from "@/lib/scores";
import AsteroidsCanvas, { type AsteroidsHud } from "./asteroids-canvas";
import { SKINS, DEFAULT_SKIN, type SkinId } from "@/lib/skins";
import GameOverModal from "./game-over-modal";

const INITIAL_HUD: AsteroidsHud = { score: 0, lives: 3, level: 1 };

export default function GameFrame({ onExit }: { onExit: () => void }) {
  const { user, signIn } = useSession();
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<AsteroidsHud>(INITIAL_HUD);
  const [skinId, setSkinId] = useState<SkinId>(DEFAULT_SKIN);
  const skin = SKINS.rocas[skinId];
  const [runId, setRunId] = useState(0);
  const [over, setOver] = useState<number | null>(null);

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
          {(Object.keys(SKINS.rocas) as SkinId[]).map((id) => (
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
              {SKINS.rocas[id].label}
            </button>
          ))}
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
        <AsteroidsCanvas
          key={runId}
          paused={paused}
          onHud={setHud}
          skin={skin}
          onGameOver={setOver}
        />
      </div>

      <div className="game-frame-status">
        <span className="game-frame-signal">● SEÑAL OK</span>
        <span>ASTEROIDS · CRT-01 · 60 HZ</span>
        <span>CARGA · 1MB</span>
      </div>

      {over !== null && (
        <GameOverModal
          score={over}
          defaultName={user?.name ?? "INVITADO"}
          onSave={(name) => {
            submitScore("rocas", name, over).catch(() => {});
            if (!user) signIn({ name });
          }}
          onRestart={() => {
            setOver(null);
            setHud(INITIAL_HUD);
            setRunId((id) => id + 1);
          }}
          onExit={onExit}
        />
      )}
    </div>
  );
}

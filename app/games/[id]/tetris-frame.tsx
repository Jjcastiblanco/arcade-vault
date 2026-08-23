"use client";

import { useState } from "react";
import { useSession } from "@/app/providers/session-provider";
import { submitScore } from "@/lib/scores";
import TetrisCanvas, { type TetrisHud } from "./tetris-canvas";
import GameOverModal from "./game-over-modal";

const INITIAL_HUD: TetrisHud = { score: 0, lines: 0, level: 1 };

export default function TetrisFrame({ onExit }: { onExit: () => void }) {
  const { user, signIn } = useSession();
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState<TetrisHud>(INITIAL_HUD);
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
        <TetrisCanvas
          key={runId}
          paused={paused}
          onHud={setHud}
          onGameOver={setOver}
        />
      </div>

      <div className="game-frame-status">
        <span className="game-frame-signal">● SEÑAL OK</span>
        <span>TETRIS · CRT-01 · 60 HZ</span>
        <span>CARGA · 1MB</span>
      </div>

      {over !== null && (
        <GameOverModal
          score={over}
          defaultName={user?.name ?? "INVITADO"}
          onSave={(name) => {
            submitScore("caida", name, over).catch(() => {});
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

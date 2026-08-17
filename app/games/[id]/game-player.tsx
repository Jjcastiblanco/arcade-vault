"use client";

import { useState, type ReactNode } from "react";
import type { Game } from "@/lib/data";
import GameFrame from "./game-frame";

export default function GamePlayer({
  game,
  children,
}: {
  game: Game;
  children: ReactNode;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      {game.id === "rocas" && playing ? (
        <GameFrame onExit={() => setPlaying(false)} />
      ) : (
        <div className="detail-cover">
          <div className={"cover-bg " + game.cover}></div>
        </div>
      )}
      <div style={{ marginTop: 20 }} className="detail-info">
        <div className="detail-tags">
          <span>{game.cat}</span>
          <span>1 JUGADOR</span>
          <span>TECLADO / TÁCTIL</span>
          <span>RETRO 1985</span>
        </div>
        <h2 className="neon-cyan">{game.title}</h2>
        <p>{game.long}</p>
        <div className="stat-strip">
          <div>
            <div className="l">Partidas</div>
            <div className="v">{game.plays}</div>
          </div>
          <div>
            <div className="l">Mejor global</div>
            <div
              className="v"
              style={{
                color: "var(--magenta)",
                textShadow: "0 0 6px rgba(255,0,110,0.5)",
              }}
            >
              {game.best.toLocaleString("es-ES")}
            </div>
          </div>
          <div>
            <div className="l">Dificultad</div>
            <div
              className="v"
              style={{
                color: "var(--yellow)",
                textShadow: "0 0 6px rgba(245,255,0,0.5)",
              }}
            >
              ★ ★ ★ ☆ ☆
            </div>
          </div>
        </div>
        <div className="detail-actions">
          {game.id === "rocas" ? (
            <button className="btn xl pulse" onClick={() => setPlaying(true)}>
              ▶ JUGAR AHORA
            </button>
          ) : (
            <button className="btn xl pulse" disabled title="Próximamente">
              ▶ JUGAR AHORA
            </button>
          )}
          {children}
        </div>
      </div>
    </>
  );
}

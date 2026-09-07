"use client";

import { useEffect, useState } from "react";
import type { ScoreRow } from "@/lib/data";
import { getTopScores } from "@/lib/scores";

export default function GameSidebarScores({ gameId }: { gameId: string }) {
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTopScores(gameId, 10)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return (
    <div className="leaderboard">
      <h3>MEJORES PUNTUACIONES</h3>
      {loading && <div className="lb-row">CARGANDO...</div>}
      {!loading && error && (
        <div className="lb-row">NO SE PUDIERON CARGAR LOS PUNTAJES.</div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div className="lb-row">AUN SIN PUNTUACIONES</div>
      )}
      {!loading &&
        !error &&
        rows.map((r, i) => (
          <div
            key={r.name + i}
            className={
              "lb-row" +
              (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")
            }
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">
              {r.name}
              <div
                style={{
                  fontSize: 10,
                  color: "var(--ink-faint)",
                  letterSpacing: "0.1em",
                }}
              >
                {r.date}
              </div>
            </div>
            <div className="sc">{r.score.toLocaleString("es-ES")}</div>
          </div>
        ))}
    </div>
  );
}

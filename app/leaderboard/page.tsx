"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GAMES, type ScoreRow } from "@/lib/data";
import { useSession } from "@/app/providers/session-provider";
import { getTopScores, getUserBestScore } from "@/lib/scores";

export default function HallOfFame() {
  const { user } = useSession();
  const [tab, setTab] = useState(GAMES[0].id);

  const game = GAMES.find((g) => g.id === tab)!;

  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [best, setBest] = useState<ScoreRow | null>(null);

  function selectTab(id: string) {
    setTab(id);
  }

  useEffect(() => {
    setLoading(true);
    setError(false);
    setBest(null);
    let cancelled = false;
    getTopScores(tab, 12)
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
  }, [tab]);

  useEffect(() => {
    if (!user) {
      setBest(null);
      return;
    }
    let cancelled = false;
    getUserBestScore(tab, user.name)
      .then((data) => {
        if (!cancelled) setBest(data);
      })
      .catch(() => {
        if (!cancelled) setBest(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, user]);

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            className={"chip" + (tab === g.id ? " active" : "")}
            onClick={() => selectTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          {rows[1] ? (
            <>
              <div className="rank-num">02</div>
              <div className="name">{rows[1].name}</div>
              <div className="score">
                {rows[1].score.toLocaleString("es-ES")}
              </div>
              <div className="date">{rows[1].date}</div>
            </>
          ) : (
            <div className="rank-num">02</div>
          )}
        </div>
        <div className="podium-slot gold">
          <div
            className="pixel"
            style={{
              fontSize: 9,
              color: "var(--gold)",
              letterSpacing: "0.18em",
            }}
          >
            CAMPEÓN
          </div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>
            01
          </div>
          {rows[0] && (
            <>
              <div className="name">{rows[0].name}</div>
              <div className="score" style={{ fontSize: 20 }}>
                {rows[0].score.toLocaleString("es-ES")}
              </div>
              <div className="date">{rows[0].date}</div>
            </>
          )}
        </div>
        <div className="podium-slot bronze">
          {rows[2] ? (
            <>
              <div className="rank-num">03</div>
              <div className="name">{rows[2].name}</div>
              <div className="score">
                {rows[2].score.toLocaleString("es-ES")}
              </div>
              <div className="date">{rows[2].date}</div>
            </>
          ) : (
            <div className="rank-num">03</div>
          )}
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {loading && (
          <div className="tr">
            <div className="pl">CARGANDO...</div>
          </div>
        )}
        {!loading && error && (
          <div className="tr">
            <div className="pl">NO SE PUDIERON CARGAR LOS PUNTAJES.</div>
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="tr">
            <div className="pl">AUN SIN PUNTUACIONES</div>
          </div>
        )}
        {!loading &&
          !error &&
          rows.map((r, i) => (
            <div
              key={r.name + i}
              className={
                "tr" +
                (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")
              }
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
              <div className="pl">{r.name}</div>
              <div className="sc">{r.score.toLocaleString("es-ES")}</div>
              <div className="dt">{r.date}</div>
            </div>
          ))}
        {user && best && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div
              className="tr you"
              style={{ animationDelay: `${rows.length * 50 + 50}ms` }}
            >
              <div className="rk" style={{ color: "var(--yellow)" }}>
                #{String(best.rank).padStart(2, "0")}
              </div>
              <div className="pl" style={{ color: "var(--yellow)" }}>
                {user.name}
              </div>
              <div
                className="sc"
                style={{
                  color: "var(--yellow)",
                  textShadow: "0 0 6px rgba(245,255,0,0.5)",
                }}
              >
                {best.score.toLocaleString("es-ES")}
              </div>
              <div className="dt">{best.date}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/games" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}

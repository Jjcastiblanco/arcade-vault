import Link from "next/link";
import { notFound } from "next/navigation";
import { GAMES, seededScores } from "@/lib/data";
import GamePlayer from "./game-player";

export async function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export default async function GameDetail({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

  const scores = seededScores(id.length * 17 + 3, 10);

  return (
    <div className="av-detail fade-in">
      <div>
        <GamePlayer game={game}>
          <Link href="/games" className="btn ghost lg">
            VOLVER AL VAULT
          </Link>
        </GamePlayer>
      </div>

      <aside>
        <div className="leaderboard">
          <h3>MEJORES PUNTUACIONES</h3>
          {scores.map((r, i) => (
            <div
              key={r.name}
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
      </aside>
    </div>
  );
}

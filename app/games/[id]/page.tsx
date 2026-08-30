import Link from "next/link";
import { notFound } from "next/navigation";
import { GAMES } from "@/lib/data";
import GamePlayer from "./game-player";
import GameSidebarScores from "./game-sidebar-scores";

export async function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export default async function GameDetail({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

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
        <GameSidebarScores gameId={game.id} />
      </aside>
    </div>
  );
}

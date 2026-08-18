import { createClient } from "@/lib/supabase/client";
import type { ScoreRow } from "@/lib/data";

type ScoreDbRow = {
  player_name: string;
  score: number;
  created_at: string;
};

function toScoreRow(row: ScoreDbRow, rank: number): ScoreRow {
  const created = new Date(row.created_at);
  const day = String(created.getDate()).padStart(2, "0");
  const mon = String(created.getMonth() + 1).padStart(2, "0");
  const year = created.getFullYear();
  return {
    rank,
    name: row.player_name,
    score: row.score,
    date: `${day}/${mon}/${year}`,
  };
}

export async function submitScore(gameId: string, playerName: string, score: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("scores")
    .insert({ game_id: gameId, player_name: playerName, score });
  if (error) throw error;
}

export async function getTopScores(gameId: string, limit = 12): Promise<ScoreRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("player_name, score, created_at")
    .eq("game_id", gameId)
    .order("score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row, i) => toScoreRow(row, i + 1));
}

export async function getUserBestScore(gameId: string, playerName: string): Promise<ScoreRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("player_name, score, created_at")
    .eq("game_id", gameId)
    .eq("player_name", playerName)
    .order("score", { ascending: false })
    .limit(1);
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return toScoreRow(data[0], 1);
}

"use client";

import { useEffect, useRef } from "react";
import { getSession } from "@/lib/session";
import { submitScore } from "@/lib/scores";

const COLS = 10;
const ROWS = 20;
const BLOCK = 36;
const NEXT_BLOCK = 36;

const W = COLS * BLOCK;
const H = ROWS * BLOCK;
const NEXT_W = 4 * NEXT_BLOCK;
const NEXT_H = 4 * NEXT_BLOCK;

const COLORS = [
  null,
  "#4dd0e1", // I - cyan
  "#ffd54f", // O - yellow
  "#ba68c8", // T - purple
  "#81c784", // S - green
  "#e57373", // Z - red
  "#90caf9", // J - pale blue
  "#ffb74d", // L - orange
  "#9e9e9e", // N - tuerca (gris metálico)
] as const;

const PIECES: number[][][] = [
  [],
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ], // I
  [
    [2, 2],
    [2, 2],
  ], // O
  [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ], // T
  [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ], // S
  [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ], // Z
  [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ], // J
  [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ], // L
  [
    [8, 8, 8],
    [8, 0, 8],
    [8, 8, 8],
  ], // N (tuerca)
];

const LINE_SCORES = [0, 100, 300, 500, 800];

type Piece = { type: number; shape: number[][]; x: number; y: number };
type GameState = "playing" | "paused" | "gameover";

export type TetrisHud = { score: number; lines: number; level: number };

export default function TetrisCanvas({
  paused = false,
  onHud,
}: {
  paused?: boolean;
  onHud?: (hud: TetrisHud) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const onHudRef = useRef(onHud);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onHudRef.current = onHud;
  }, [onHud]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (!canvas || !nextCanvas) return;
    const ctx = canvas.getContext("2d");
    const nextCtx = nextCanvas.getContext("2d");
    if (!ctx || !nextCtx) return;

    const GAME_KEYS = new Set([
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Space",
      "KeyX",
    ]);

    let board: number[][];
    let current: Piece;
    let next: Piece;
    let score: number;
    let lines: number;
    let level: number;
    let state: GameState;
    let dropAccum: number;
    let dropInterval: number;
    let scoreSubmitted: boolean;

    function createBoard(): number[][] {
      return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
    }

    function randomPiece(): Piece {
      const type = Math.floor(Math.random() * 8) + 1;
      const shape = PIECES[type].map((row) => [...row]);
      return {
        type,
        shape,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0,
      };
    }

    function collide(shape: number[][], ox: number, oy: number) {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const nx = ox + c;
          const ny = oy + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && board[ny][nx]) return true;
        }
      }
      return false;
    }

    function rotateCW(shape: number[][]) {
      const rows = shape.length,
        cols = shape[0].length;
      const result = Array.from({ length: cols }, () =>
        new Array(rows).fill(0),
      );
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) result[c][rows - 1 - r] = shape[r][c];
      return result;
    }

    function tryRotate() {
      const rotated = rotateCW(current.shape);
      const kicks = [0, -1, 1, -2, 2];
      for (const kick of kicks) {
        if (!collide(rotated, current.x + kick, current.y)) {
          current.shape = rotated;
          current.x += kick;
          return;
        }
      }
    }

    function merge() {
      for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
          if (current.shape[r][c])
            board[current.y + r][current.x + c] = current.shape[r][c];
    }

    function clearLines() {
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every((v) => v !== 0)) {
          board.splice(r, 1);
          board.unshift(new Array(COLS).fill(0));
          cleared++;
          r++;
        }
      }
      if (cleared) {
        lines += cleared;
        score += (LINE_SCORES[cleared] || 0) * level;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 90);
      }
    }

    function ghostY() {
      let gy = current.y;
      while (!collide(current.shape, current.x, gy + 1)) gy++;
      return gy;
    }

    function hardDrop() {
      const gy = ghostY();
      score += (gy - current.y) * 2;
      current.y = gy;
      lockPiece();
    }

    function softDrop() {
      if (!collide(current.shape, current.x, current.y + 1)) {
        current.y++;
        score += 1;
      } else {
        lockPiece();
      }
    }

    function lockPiece() {
      merge();
      clearLines();
      spawn();
    }

    function spawn() {
      current = next;
      next = randomPiece();
      if (collide(current.shape, current.x, current.y)) {
        endGame();
      }
    }

    function endGame() {
      state = "gameover";
      if (!scoreSubmitted) {
        scoreSubmitted = true;
        const session = getSession();
        if (session) {
          submitScore("caida", session.name, score).catch(() => {});
        }
      }
    }

    function drawBlock(
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      colorIndex: number,
      size: number,
      alpha?: number,
    ) {
      if (!colorIndex) return;
      const color = COLORS[colorIndex] as string;
      context.globalAlpha = alpha ?? 1;
      context.shadowColor = color;
      context.shadowBlur = 10;
      context.fillStyle = color;
      context.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
      context.shadowBlur = 0;
      context.fillStyle = "rgba(255,255,255,0.25)";
      context.fillRect(x * size + 2, y * size + 2, size - 4, 5);
      context.strokeStyle = "rgba(0,0,0,0.35)";
      context.lineWidth = 1;
      context.strokeRect(x * size + 2, y * size + 2, size - 4, size - 4);
      context.globalAlpha = 1;
    }

    function drawGrid() {
      ctx!.strokeStyle = "#22222e";
      ctx!.lineWidth = 0.5;
      for (let c = 1; c < COLS; c++) {
        ctx!.beginPath();
        ctx!.moveTo(c * BLOCK, 0);
        ctx!.lineTo(c * BLOCK, ROWS * BLOCK);
        ctx!.stroke();
      }
      for (let r = 1; r < ROWS; r++) {
        ctx!.beginPath();
        ctx!.moveTo(0, r * BLOCK);
        ctx!.lineTo(COLS * BLOCK, r * BLOCK);
        ctx!.stroke();
      }
    }

    function draw() {
      ctx!.fillStyle = "#1a1a25";
      ctx!.fillRect(0, 0, W, H);
      drawGrid();

      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          drawBlock(ctx!, c, r, board[r][c], BLOCK);

      const gy = ghostY();
      for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
          if (current.shape[r][c])
            drawBlock(
              ctx!,
              current.x + c,
              gy + r,
              current.shape[r][c],
              BLOCK,
              0.2,
            );

      for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
          drawBlock(
            ctx!,
            current.x + c,
            current.y + r,
            current.shape[r][c],
            BLOCK,
          );

      if (state === "gameover") {
        ctx!.fillStyle = "rgba(10,10,20,0.75)";
        ctx!.fillRect(0, 0, W, H);
        ctx!.textAlign = "center";
        ctx!.fillStyle = "#e57373";
        ctx!.font = "bold 24px monospace";
        ctx!.fillText("GAME OVER", W / 2, H / 2 - 20);
        ctx!.fillStyle = "#7aa2f7";
        ctx!.font = "14px monospace";
        ctx!.fillText(`PUNTUACIÓN: ${score}`, W / 2, H / 2 + 8);
        ctx!.fillStyle = "rgba(255,255,255,0.65)";
        ctx!.font = "12px monospace";
        ctx!.fillText("ESPACIO PARA REINICIAR", W / 2, H / 2 + 32);
      } else if (pausedRef.current) {
        ctx!.fillStyle = "rgba(10,10,20,0.75)";
        ctx!.fillRect(0, 0, W, H);
        ctx!.textAlign = "center";
        ctx!.fillStyle = "#fff";
        ctx!.font = "bold 24px monospace";
        ctx!.fillText("PAUSA", W / 2, H / 2);
      }
    }

    function drawNext() {
      nextCtx!.fillStyle = "#1a1a25";
      nextCtx!.fillRect(0, 0, NEXT_W, NEXT_H);
      const shape = next.shape;
      const offX = Math.floor((4 - shape[0].length) / 2);
      const offY = Math.floor((4 - shape.length) / 2);
      for (let r = 0; r < shape.length; r++)
        for (let c = 0; c < shape[r].length; c++)
          drawBlock(nextCtx!, offX + c, offY + r, shape[r][c], NEXT_BLOCK);
    }

    let lastReportedHud: TetrisHud | null = null;
    function reportHud() {
      if (!onHudRef.current) return;
      if (
        lastReportedHud &&
        lastReportedHud.score === score &&
        lastReportedHud.lines === lines &&
        lastReportedHud.level === level
      )
        return;
      lastReportedHud = { score, lines, level };
      onHudRef.current(lastReportedHud);
    }

    function init() {
      board = createBoard();
      score = 0;
      lines = 0;
      level = 1;
      dropInterval = 1000;
      dropAccum = 0;
      scoreSubmitted = false;
      next = randomPiece();
      spawn();
      state = "playing";
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();

      if (state === "gameover") {
        if (e.code === "Space") init();
        return;
      }
      if (pausedRef.current) return;

      switch (e.code) {
        case "ArrowLeft":
          if (!collide(current.shape, current.x - 1, current.y)) current.x--;
          break;
        case "ArrowRight":
          if (!collide(current.shape, current.x + 1, current.y)) current.x++;
          break;
        case "ArrowDown":
          softDrop();
          break;
        case "ArrowUp":
        case "KeyX":
          tryRotate();
          break;
        case "Space":
          hardDrop();
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);

    let lastTime: number | null = null;
    let rafId: number;

    function loop(ts: number) {
      const dt = lastTime === null ? 0 : ts - lastTime;
      lastTime = ts;

      if (state === "playing" && !pausedRef.current) {
        dropAccum += dt;
        if (dropAccum >= dropInterval) {
          dropAccum = 0;
          if (!collide(current.shape, current.x, current.y + 1)) {
            current.y++;
          } else {
            lockPiece();
          }
        }
      }

      draw();
      drawNext();
      reportHud();
      rafId = requestAnimationFrame(loop);
    }

    init();
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: "block", background: "#1a1a25" }}
      />
      <div
        style={{
          width: 190,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "var(--ink-faint)",
              marginBottom: 6,
            }}
          >
            SIGUIENTE
          </div>
          <canvas
            ref={nextCanvasRef}
            width={NEXT_W}
            height={NEXT_H}
            style={{
              display: "block",
              background: "#1a1a25",
              border: "1px solid #2a2a3a",
              borderRadius: 4,
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "var(--ink-faint)",
              marginBottom: 10,
            }}
          >
            CONTROLES
          </div>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 12,
              color: "#888",
            }}
          >
            {[
              ["← →", "mover"],
              ["↑", "rotar"],
              ["↓", "bajar"],
              ["Espacio", "caída"],
            ].map(([key, label]) => (
              <li
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <kbd
                  style={{
                    background: "#22223a",
                    border: "1px solid #3a3a5a",
                    borderRadius: 3,
                    padding: "2px 8px",
                    fontSize: 11,
                    color: "#aaa",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {key}
                </kbd>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { getSession } from "@/lib/session";
import { submitScore } from "@/lib/scores";

const COLS = 20;
const ROWS = 20;
const CELL = 30;
const W = COLS * CELL;
const H = ROWS * CELL;

const FRUIT_ATLAS: Record<
  string,
  { x: number; y: number; w: number; h: number }
> = {
  apple: { x: 2786, y: 136, w: 110, h: 160 },
  cherry: { x: 1066, y: 136, w: 110, h: 160 },
  strawberry: { x: 894, y: 136, w: 110, h: 160 },
  grape: { x: 378, y: 136, w: 110, h: 160 },
  orange: { x: 186, y: 136, w: 150, h: 160 },
  watermelon: { x: 1734, y: 136, w: 150, h: 160 },
};
const FRUIT_KINDS = Object.keys(FRUIT_ATLAS);

type Cell = { x: number; y: number };
type GameState = "playing" | "gameover";

export type SnakeHud = { score: number; length: number; level: number };

export default function SnakeCanvas({
  paused = false,
  onHud,
}: {
  paused?: boolean;
  onHud?: (hud: SnakeHud) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    let imgLoaded = false;
    img.onload = () => {
      imgLoaded = true;
    };
    img.src = "/games/serpentina/fruits.png";

    const GAME_KEYS = new Set([
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Space",
    ]);

    let snake: Cell[];
    let dir: Cell;
    let nextDir: Cell;
    let fruit: Cell & { kind: string };
    let score: number;
    let level: number;
    let state: GameState;
    let tickAccum: number;
    let tickInterval: number;
    let eaten: number;
    let scoreSubmitted: boolean;

    function randCell(): Cell {
      return {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    }

    function spawnFruit() {
      let cell: Cell;
      do {
        cell = randCell();
      } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
      const kind = FRUIT_KINDS[Math.floor(Math.random() * FRUIT_KINDS.length)];
      fruit = { ...cell, kind };
    }

    function endGame() {
      state = "gameover";
      if (!scoreSubmitted) {
        scoreSubmitted = true;
        const session = getSession();
        if (session) {
          submitScore("serpentina", session.name, score).catch(() => {});
        }
      }
    }

    function tick() {
      dir = nextDir;
      const head = snake[snake.length - 1];
      const nx = head.x + dir.x;
      const ny = head.y + dir.y;

      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
        endGame();
        return;
      }
      if (snake.some((s) => s.x === nx && s.y === ny)) {
        endGame();
        return;
      }

      snake.push({ x: nx, y: ny });

      if (nx === fruit.x && ny === fruit.y) {
        score += 10;
        eaten++;
        if (eaten % 5 === 0) {
          level++;
          tickInterval = Math.max(60, 160 - (level - 1) * 12);
        }
        spawnFruit();
      } else {
        snake.shift();
      }
    }

    function drawBlock(x: number, y: number, isHead: boolean) {
      const color = isHead ? "#c8ffb0" : "#39ff6a";
      ctx!.shadowColor = color;
      ctx!.shadowBlur = isHead ? 14 : 8;
      ctx!.fillStyle = color;
      ctx!.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
      ctx!.shadowBlur = 0;
      ctx!.fillStyle = "rgba(255,255,255,0.25)";
      ctx!.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, 4);
      ctx!.strokeStyle = "rgba(0,0,0,0.35)";
      ctx!.lineWidth = 1;
      ctx!.strokeRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
    }

    function drawGrid() {
      ctx!.strokeStyle = "#22222e";
      ctx!.lineWidth = 0.5;
      for (let c = 1; c < COLS; c++) {
        ctx!.beginPath();
        ctx!.moveTo(c * CELL, 0);
        ctx!.lineTo(c * CELL, H);
        ctx!.stroke();
      }
      for (let r = 1; r < ROWS; r++) {
        ctx!.beginPath();
        ctx!.moveTo(0, r * CELL);
        ctx!.lineTo(W, r * CELL);
        ctx!.stroke();
      }
    }

    function draw() {
      ctx!.fillStyle = "#1a1a25";
      ctx!.fillRect(0, 0, W, H);
      drawGrid();

      if (imgLoaded) {
        const atlas = FRUIT_ATLAS[fruit.kind];
        ctx!.drawImage(
          img,
          atlas.x,
          atlas.y,
          atlas.w,
          atlas.h,
          fruit.x * CELL + 2,
          fruit.y * CELL + 2,
          CELL - 4,
          CELL - 4,
        );
      }

      for (let i = 0; i < snake.length; i++) {
        const s = snake[i];
        drawBlock(s.x, s.y, i === snake.length - 1);
      }

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

    let lastReportedHud: SnakeHud | null = null;
    function reportHud() {
      if (!onHudRef.current) return;
      const hud = { score, length: snake.length, level };
      if (
        lastReportedHud &&
        lastReportedHud.score === hud.score &&
        lastReportedHud.length === hud.length &&
        lastReportedHud.level === hud.level
      )
        return;
      lastReportedHud = hud;
      onHudRef.current(hud);
    }

    function init() {
      const cx = Math.floor(COLS / 2);
      const cy = Math.floor(ROWS / 2);
      snake = [
        { x: cx - 2, y: cy },
        { x: cx - 1, y: cy },
        { x: cx, y: cy },
      ];
      dir = { x: 1, y: 0 };
      nextDir = dir;
      score = 0;
      level = 1;
      eaten = 0;
      tickInterval = 160;
      tickAccum = 0;
      scoreSubmitted = false;
      state = "playing";
      spawnFruit();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();

      if (state === "gameover") {
        if (e.code === "Space") init();
        return;
      }
      if (pausedRef.current) return;

      const isReverse = (d: Cell) => d.x === -dir.x && d.y === -dir.y;
      switch (e.code) {
        case "ArrowLeft":
          if (!isReverse({ x: -1, y: 0 })) nextDir = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (!isReverse({ x: 1, y: 0 })) nextDir = { x: 1, y: 0 };
          break;
        case "ArrowUp":
          if (!isReverse({ x: 0, y: -1 })) nextDir = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (!isReverse({ x: 0, y: 1 })) nextDir = { x: 0, y: 1 };
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
        tickAccum += dt;
        if (tickAccum >= tickInterval) {
          tickAccum = 0;
          tick();
        }
      }

      draw();
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
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ display: "block", background: "#1a1a25" }}
    />
  );
}

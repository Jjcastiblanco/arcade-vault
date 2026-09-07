"use client";

import { useEffect, useRef } from "react";
import { getSession } from "@/lib/session";
import { submitScore } from "@/lib/scores";
import { SKINS, DEFAULT_SKIN, type SkinTokens } from "@/lib/skins";
import { useSwipeDispatch, TouchControls } from "./touch-controls";

const COLS = 20;
const ROWS = 20;
const CELL = 30;
const W = COLS * CELL;
const H = ROWS * CELL;

const FRUITS_URL = "/games/serpentina/fruits.png";

// Subconjunto de SPRITE_ATLAS.fruits (resources/started-games/05-snake/snake-assets/sprites.js)
// copiado literalmente — hoja fruits.png 3790x442, fila y=136..295.
const FRUIT_ATLAS = [
  { x: 2786, y: 136, w: 110, h: 160 }, // apple
  { x: 1066, y: 136, w: 110, h: 160 }, // cherry
  { x: 894, y: 136, w: 110, h: 160 }, // strawberry
  { x: 378, y: 136, w: 110, h: 160 }, // grape
  { x: 186, y: 136, w: 150, h: 160 }, // orange
  { x: 1734, y: 136, w: 150, h: 160 }, // watermelon
] as const;

type Vec = { x: number; y: number };
type Fruit = { x: number; y: number; kind: number };
type GameState = "playing" | "gameover";

export type SnakeHud = { score: number; length: number; level: number };

export default function SnakeCanvas({
  paused = false,
  onHud,
  skin = SKINS.serpentina?.[DEFAULT_SKIN],
}: {
  paused?: boolean;
  onHud?: (hud: SnakeHud) => void;
  skin?: SkinTokens;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const onHudRef = useRef(onHud);
  const skinRef = useRef(skin);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onHudRef.current = onHud;
  }, [onHud]);

  useSwipeDispatch(canvasRef, {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  });

  useEffect(() => {
    skinRef.current = skin;
  }, [skin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fruitImg = new Image();
    let imgLoaded = false;
    fruitImg.onload = () => {
      imgLoaded = true;
    };
    fruitImg.src = FRUITS_URL;

    const GAME_KEYS = new Set([
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Space",
    ]);

    let snake: Vec[]; // cabeza al final del array
    let dir: Vec;
    let nextDir: Vec;
    let fruit: Fruit;
    let score: number;
    let level: number;
    let eaten: number;
    let tickInterval: number;
    let tickAccum: number;
    let state: GameState;
    let scoreSubmitted: boolean;

    function randCell(): Vec {
      let cell: Vec;
      do {
        cell = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS),
        };
      } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
      return cell;
    }

    function spawnFruit() {
      const cell = randCell();
      fruit = {
        x: cell.x,
        y: cell.y,
        kind: Math.floor(Math.random() * FRUIT_ATLAS.length),
      };
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
      const newHead: Vec = { x: head.x + dir.x, y: head.y + dir.y };

      if (
        newHead.x < 0 ||
        newHead.x >= COLS ||
        newHead.y < 0 ||
        newHead.y >= ROWS ||
        snake.some((s) => s.x === newHead.x && s.y === newHead.y)
      ) {
        endGame();
        return;
      }

      snake.push(newHead);

      if (newHead.x === fruit.x && newHead.y === fruit.y) {
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
      const color = isHead ? skinRef.current!.accent : skinRef.current!.primary;
      ctx!.shadowColor = color;
      ctx!.shadowBlur = skinRef.current!.effect === "none" ? 0 : 12;
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
      ctx!.strokeStyle = skinRef.current!.accent + "22";
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

    function drawScanlines() {
      ctx!.fillStyle = "rgba(0,0,0,0.15)";
      for (let y = 0; y < H; y += 4) ctx!.fillRect(0, y, W, 2);
    }

    function draw() {
      ctx!.fillStyle = skinRef.current!.background;
      ctx!.fillRect(0, 0, W, H);
      drawGrid();

      for (let i = 0; i < snake.length; i++) {
        const s = snake[i];
        drawBlock(s.x, s.y, i === snake.length - 1);
      }

      if (imgLoaded) {
        const atlas = FRUIT_ATLAS[fruit.kind];
        ctx!.drawImage(
          fruitImg,
          atlas.x,
          atlas.y,
          atlas.w,
          atlas.h,
          fruit.x * CELL,
          fruit.y * CELL,
          CELL,
          CELL,
        );
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

      if (skinRef.current!.effect === "scanlines") drawScanlines();
    }

    let lastReportedHud: SnakeHud | null = null;
    function reportHud() {
      if (!onHudRef.current) return;
      const length = snake.length;
      if (
        lastReportedHud &&
        lastReportedHud.score === score &&
        lastReportedHud.length === length &&
        lastReportedHud.level === level
      )
        return;
      lastReportedHud = { score, length, level };
      onHudRef.current(lastReportedHud);
    }

    function init() {
      const startX = Math.floor(COLS / 2);
      const startY = Math.floor(ROWS / 2);
      snake = [
        { x: startX - 2, y: startY },
        { x: startX - 1, y: startY },
        { x: startX, y: startY },
      ];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
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

      switch (e.code) {
        case "ArrowLeft":
          if (dir.x === 0) nextDir = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (dir.x === 0) nextDir = { x: 1, y: 0 };
          break;
        case "ArrowUp":
          if (dir.y === 0) nextDir = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (dir.y === 0) nextDir = { x: 0, y: 1 };
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
    <>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: "block", background: "#0a0a12", touchAction: "none" }}
      />
      <TouchControls
        up={{ code: "ArrowUp", label: "▲" }}
        down={{ code: "ArrowDown", label: "▼" }}
        left={{ code: "ArrowLeft", label: "◄" }}
        right={{ code: "ArrowRight", label: "►" }}
        actions={[{ code: "Space", label: "⟳", color: "#4d7dff" }]}
      />
    </>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";

const HOLD_REPEAT_DELAY = 280;
const HOLD_REPEAT_INTERVAL = 90;
const SWIPE_MIN_DISTANCE = 24;

export function dispatchKeyEvent(code: string, type: "keydown" | "keyup") {
  window.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: code,
      bubbles: true,
      cancelable: true,
    }),
  );
}

export type TouchButtonConfig = { code: string; label: string };
export type ActionButtonConfig = TouchButtonConfig & { color: string };

function useHoldRepeat(code: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    dispatchKeyEvent(code, "keydown");
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(
        () => dispatchKeyEvent(code, "keydown"),
        HOLD_REPEAT_INTERVAL,
      );
    }, HOLD_REPEAT_DELAY);
  }, [code]);

  const stop = useCallback(() => {
    clear();
    dispatchKeyEvent(code, "keyup");
  }, [clear, code]);

  useEffect(() => clear, [clear]);

  return { start, stop };
}

function HoldButton({
  code,
  label,
  className,
  style,
}: TouchButtonConfig & { className: string; style?: CSSProperties }) {
  const { start, stop } = useHoldRepeat(code);
  return (
    <button
      type="button"
      className={className}
      style={style}
      onPointerDown={(e) => {
        e.preventDefault();
        start();
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      {label}
    </button>
  );
}

export function TouchControls({
  up,
  down,
  left,
  right,
  actions,
}: {
  up?: TouchButtonConfig;
  down?: TouchButtonConfig;
  left?: TouchButtonConfig;
  right?: TouchButtonConfig;
  actions: ActionButtonConfig[];
}) {
  return (
    <div className="touch-controls">
      <div className="touch-dpad">
        {up && <HoldButton {...up} className="touch-btn touch-dpad-up" />}
        {left && <HoldButton {...left} className="touch-btn touch-dpad-left" />}
        {right && (
          <HoldButton {...right} className="touch-btn touch-dpad-right" />
        )}
        {down && <HoldButton {...down} className="touch-btn touch-dpad-down" />}
      </div>
      <div className="touch-actions">
        {actions.map((a) => (
          <HoldButton
            key={a.code}
            code={a.code}
            label={a.label}
            className="touch-btn touch-action"
            style={{ background: a.color }}
          />
        ))}
      </div>
    </div>
  );
}

type SwipeCodes = { up: string; down: string; left: string; right: string };

export function useSwipeDispatch(
  ref: RefObject<HTMLElement | null>,
  codes: SwipeCodes,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_DISTANCE) return;
      const code =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? codes.right
            : codes.left
          : dy > 0
            ? codes.down
            : codes.up;
      dispatchKeyEvent(code, "keydown");
      dispatchKeyEvent(code, "keyup");
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref, codes]);
}

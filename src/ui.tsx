import React, { createContext, useContext } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FPS } from "../scenes.config";

export const SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'DejaVu Sans Mono', 'Courier New', monospace";
// Safe margins at 1920x1080: 96px left/right, 72px top; captions own y >= 910.
export const SAFE = { x: 96, top: 72, bottom: 880 };

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const prog = (frame: number, startSec: number, durSec = 0.7) =>
  interpolate(frame, [startSec * FPS, (startSec + durSec) * FPS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

type Ctx = { frames: number; exit: boolean };
export const SceneCtx = createContext<Ctx>({ frames: 0, exit: true });
export const useScene = () => useContext(SceneCtx);

/** Entrance (fade + slide) at `at` seconds into the scene; fades out just before the scene ends. */
export const Reveal: React.FC<{
  at: number;
  dur?: number;
  dx?: number;
  dy?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, dur = 0.7, dx = 0, dy = 24, style, children }) => {
  const frame = useCurrentFrame();
  const { frames, exit } = useScene();
  const p = prog(frame, at, dur);
  const out = exit ? interpolate(frame, [frames - 14, frames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <div style={{ opacity: p * out, transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px)`, ...style }}>{children}</div>
  );
};

export const Kicker: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 8, color, textTransform: "uppercase" }}>{children}</div>
);

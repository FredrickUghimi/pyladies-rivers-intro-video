import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { fitText } from "@remotion/layout-utils";
import captions from "./data/captions.json";
import { FPS } from "../scenes.config";
import { BRAND } from "../scenes.config";
import { SANS } from "./ui";

type Cap = { scene: string; start: number; end: number; words: { text: string; start: number; end: number }[] };
const CAPS = captions as Cap[];
const MAX_W = 1728; // 1920 - 2 * 96 safe margin
const PAD_X = 34;
const WORD_PAD = 9;

const Phrase: React.FC<{ cap: Cap; t: number }> = ({ cap, t }) => {
  const text = cap.words.map((w) => w.text).join(" ");
  const size = useMemo(() => {
    const room = MAX_W - 2 * PAD_X - cap.words.length * 2 * WORD_PAD - 8;
    return Math.min(46, fitText({ text, withinWidth: room, fontFamily: SANS, fontWeight: "600" }).fontSize);
  }, [cap, text]);
  let active = -1;
  cap.words.forEach((w, i) => { if (t >= w.start) active = i; });
  const fadeIn = interpolate(t, [cap.start, cap.start + 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 62, display: "flex", justifyContent: "center", opacity: fadeIn }}>
      <div style={{ background: "rgba(35,39,47,0.92)", borderRadius: 18, padding: `16px ${PAD_X}px`, fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.25, whiteSpace: "nowrap", maxWidth: MAX_W }}>
        {cap.words.map((w, i) => (
          <span key={i} style={{ display: "inline-block", padding: `0 ${WORD_PAD}px`, borderRadius: 10, background: i === active ? BRAND.red : "transparent", color: i <= active ? "#fff" : "rgba(255,255,255,0.74)" }}>
            {w.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cap = CAPS.find((c) => t >= c.start && t < c.end);
  return cap ? <Phrase cap={cap} t={t} /> : null;
};

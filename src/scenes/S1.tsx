import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { BRAND, LOGO, TAGLINE } from "../../scenes.config";
import { Scene } from "../Scene";
import { MONO, Reveal, SANS, prog } from "../ui";
import { SNIPPETS } from "../data/snippets";

const BG_CODE = [...SNIPPETS[0].lines, "", ...SNIPPETS[3].lines, "", ...SNIPPETS[2].lines.slice(0, 4)].join("\n");

const Letters: React.FC<{ text: string; at: number; color: string }> = ({ text, at, color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex" }}>
      {text.split("").map((ch, i) => {
        const p = prog(frame, at + i * 0.07, 0.5);
        return <span key={i} style={{ color, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, display: "inline-block" }}>{ch}</span>;
      })}
    </div>
  );
};

export const S1: React.FC = () => (
  <Scene id="S1" bg={BRAND.offWhite}>
    {/* faint Python background, kept to the right so it never sits behind the logo */}
    <div style={{ position: "absolute", left: 960, top: 90, width: 900, height: 800, overflow: "hidden", opacity: 0.07, fontFamily: MONO, fontSize: 34, lineHeight: 1.5, color: BRAND.charcoal, whiteSpace: "pre", WebkitMaskImage: "linear-gradient(to right, transparent, #000 25%)" }}>
      {BG_CODE}
    </div>
    <Reveal at={0.3} dur={1.1} dx={-30} dy={0} style={{ position: "absolute", left: 110, top: 157 }}>
      <Img src={staticFile(LOGO.src)} style={{ width: LOGO.width, height: LOGO.height, display: "block" }} />
    </Reveal>
    <div style={{ position: "absolute", left: 900, top: 190, width: 924, fontFamily: SANS }}>
      <div style={{ fontWeight: 800, fontSize: 128, lineHeight: 1.02, letterSpacing: 2 }}>
        <Letters text="PYLADIES" at={1.4} color={BRAND.charcoal} />
        <Letters text="RIVERS" at={2.1} color={BRAND.blue} />
      </div>
      <Reveal at={3.6} style={{ marginTop: 36, fontSize: 46, fontWeight: 500, color: BRAND.ink, display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: BRAND.red, display: "inline-block" }} />
        Port Harcourt, Nigeria
      </Reveal>
      <Reveal at={5.6} style={{ marginTop: 44, fontSize: 40, fontWeight: 700, color: BRAND.red }}>{TAGLINE}</Reveal>
    </div>
  </Scene>
);

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BRAND, FPS } from "../../scenes.config";
import { Scene } from "../Scene";
import { SNIPPETS } from "../data/snippets";
import { MONO, Reveal, SANS, prog, useScene } from "../ui";

const KW = /^(if|elif|else|for|in|True|False)$/;
const BUILTIN = /^(print|range|type)$/;
type Tok = { t: string; c: string };
const highlight = (line: string): Tok[] => {
  const out: Tok[] = [];
  const re = /(#.*$)|("[^"]*")|(\d+(?:\.\d+)?)|([A-Za-z_]\w*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const [t, com, str, num, id] = m;
    out.push({ t, c: com ? "#7D8590" : str ? BRAND.yellow : num ? "#7CC0F5" : id ? (KW.test(t) ? "#FF7A90" : BUILTIN.test(t) ? "#7CC0F5" : "#E6EDF3") : "#E6EDF3" });
  }
  return out;
};

const SNIP_START = 1.7;
const SNIP_LEN = 3.6;
const TYPE_SEC = 2.0;

const Editor: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = Math.max(0, Math.min(SNIPPETS.length - 1, Math.floor((t - SNIP_START) / SNIP_LEN)));
  const sn = SNIPPETS[idx];
  const local = t - SNIP_START - idx * SNIP_LEN;
  const total = sn.lines.reduce((a, l) => a + l.length + 1, 0);
  let left = Math.floor(interpolate(local, [0.2, TYPE_SEC], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const typing = left < total;
  const rows = sn.lines.map((line) => {
    const vis = Math.max(0, Math.min(line.length, left));
    left -= line.length + 1;
    const toks = highlight(line);
    let n = vis;
    return toks.map((k) => { const s = k.t.slice(0, Math.max(0, n)); n -= k.t.length; return { ...k, t: s }; });
  });
  const fade = interpolate(local, [-0.15, 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ width: 1024, height: 600, borderRadius: 18, background: "#0F131A", border: "1px solid #2A3140", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", overflow: "hidden" }}>
      <div style={{ height: 64, background: "#1A2030", display: "flex", alignItems: "center", padding: "0 24px", gap: 10, fontFamily: SANS }}>
        {["#4A5266", "#4A5266", "#4A5266"].map((c, i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
        <span style={{ marginLeft: 20, color: "#AAB3C5", fontSize: 24, fontWeight: 600 }}>{sn.week} · {sn.topic}</span>
      </div>
      <div style={{ padding: "34px 40px", fontFamily: MONO, fontSize: 26, lineHeight: 1.7, whiteSpace: "pre", opacity: fade }}>
        {rows.map((toks, i) => (
          <div key={i} style={{ minHeight: 44 }}>
            {toks.map((k, j) => <span key={j} style={{ color: k.c }}>{k.t}</span>)}
          </div>
        ))}
        {typing && <span style={{ display: "inline-block", width: 12, height: 28, background: "#E6EDF3", opacity: 0.8 }} />}
      </div>
    </div>
  );
};

const BULLETS = ["Python Fundamentals", "Practical Exercises", "Mentorship", "Collaborative Learning"];

export const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const { frames } = useScene();
  return (
    <Scene id="S4" bg="#151922">
      <div style={{ position: "absolute", left: 96, top: 150, width: 660, fontFamily: SANS }}>
        <Reveal at={0.4}>
          <span style={{ display: "inline-block", background: BRAND.blue, color: "#fff", fontSize: 26, fontWeight: 700, letterSpacing: 3, padding: "10px 22px", borderRadius: 10 }}>8-WEEK PYTHON MENTORSHIP</span>
        </Reveal>
        <Reveal at={0.8} style={{ marginTop: 34, fontSize: 80, fontWeight: 800, lineHeight: 1.05, color: "#fff" }}>LEARNING BY DOING</Reveal>
        <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 22 }}>
          {BULLETS.map((b, i) => (
            <Reveal key={b} at={2.2 + i * 1.5} dx={-24} dy={0} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 600, color: "#E6EDF3" }}>
              <svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="17" fill={BRAND.blue} /><path d="M9 17.5 L15 23 L25 11.5" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {b}
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal at={1.0} dx={40} dy={0} style={{ position: "absolute", left: 800, top: 150 }}>
        <Editor />
      </Reveal>
    </Scene>
  );
};

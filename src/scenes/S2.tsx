import React from "react";
import { BRAND } from "../../scenes.config";
import { Scene } from "../Scene";
import { Kicker, MONO, Reveal, SANS } from "../ui";

const stroke = { fill: "none", strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Person: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="0" cy="-14" r="11" fill={c} />
    <path d="M-20 22 C-20 4 20 4 20 22 Z" fill={c} />
  </g>
);
const IconCode = (c: string) => <text x="48" y="64" textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize="44" fill={c}>{"</>"}</text>;
const IconMentor = (c: string) => (<><Person x={30} y={60} s={1.5} c={c} /><Person x={72} y={68} s={1} c={BRAND.charcoal} /><path d="M46 28 L58 28 M54 23 L59 28 L54 33" {...stroke} strokeWidth={4} stroke={c} /></>);
const IconCollab = (c: string) => (<><path d="M48 26 L24 68 M48 26 L72 68 M24 68 L72 68" {...stroke} strokeWidth={3} stroke={BRAND.charcoal} opacity={0.5} /><circle cx="48" cy="26" r="11" fill={c} /><circle cx="24" cy="68" r="11" fill={c} /><circle cx="72" cy="68" r="11" fill={c} /></>);
const IconOpp = (c: string) => (<><rect x="14" y="58" width="16" height="22" rx="3" fill={c} opacity={0.45} /><rect x="38" y="44" width="16" height="36" rx="3" fill={c} opacity={0.7} /><rect x="62" y="28" width="16" height="52" rx="3" fill={c} /><path d="M16 40 L50 18 L82 10 M70 8 L82 10 L78 21" {...stroke} strokeWidth={4} stroke={BRAND.charcoal} /></>);

const ITEMS = [
  { label: "Python Education", icon: IconCode, color: BRAND.red, at: 2.8 },
  { label: "Mentorship", icon: IconMentor, color: BRAND.blue, at: 4.8 },
  { label: "Collaboration", icon: IconCollab, color: BRAND.blue, at: 6.8 },
  { label: "Opportunities in Technology", icon: IconOpp, color: BRAND.red, at: 8.8 },
];

export const S2: React.FC = () => (
  <Scene id="S2" bg={BRAND.paper}>
    {/* faint collaboration network, illustration only */}
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
      {[[160, 700, 420, 820], [420, 820, 620, 640], [620, 640, 160, 700], [1450, 140, 1700, 260], [1700, 260, 1560, 420]].map(([a, b, c, d], i) => (
        <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={BRAND.charcoal} strokeWidth={3} />
      ))}
      {[[160, 700], [420, 820], [620, 640], [1450, 140], [1700, 260], [1560, 420]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill={BRAND.charcoal} />)}
    </svg>
    <div style={{ position: "absolute", left: 96, top: 214, width: 660, fontFamily: SANS }}>
      <Reveal at={0.4}><Kicker color={BRAND.red}>Our Mission</Kicker></Reveal>
      <Reveal at={0.9} style={{ marginTop: 28, fontSize: 76, fontWeight: 800, lineHeight: 1.08, color: BRAND.charcoal }}>
        Empowering women through:
      </Reveal>
    </div>
    <div style={{ position: "absolute", left: 840, top: 190, width: 984, display: "grid", gridTemplateColumns: "470px 470px", gap: 44 }}>
      {ITEMS.map((it) => (
        <Reveal key={it.label} at={it.at} dy={30}>
          <div style={{ height: 250, borderRadius: 20, background: "#fff", boxShadow: "0 8px 28px rgba(35,39,47,0.10)", borderTop: `8px solid ${it.color}`, padding: "26px 30px", boxSizing: "border-box", fontFamily: SANS }}>
            <svg width="96" height="96" viewBox="0 0 96 96">{it.icon(it.color)}</svg>
            <div style={{ marginTop: 14, fontSize: 38, fontWeight: 700, color: BRAND.charcoal, lineHeight: 1.15 }}>{it.label}</div>
          </div>
        </Reveal>
      ))}
    </div>
  </Scene>
);

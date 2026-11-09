import React from "react";
import { useCurrentFrame } from "remotion";
import { BRAND, FLAGS, URLS, WORKSHOP_DATES } from "../../scenes.config";
import { Scene } from "../Scene";
import { Reveal, SANS, prog } from "../ui";

const PINS: [number, number][] = [[150, 330], [330, 210], [500, 360], [270, 450], [610, 250]];
const LINKS: [number, number][] = [[0, 1], [1, 2], [0, 3], [3, 2], [2, 4], [1, 4]];

const MapTile: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width="760" height="640" viewBox="0 0 760 640" style={{ borderRadius: 28, background: "#fff", boxShadow: "0 12px 40px rgba(36,102,158,0.18)" }}>
      <rect width="760" height="640" rx="28" fill="#F7FBFE" />
      {/* river (stylised) */}
      <path d="M-20 520 C 160 440, 260 560, 420 480 S 650 420, 790 470" stroke="#BFD9EE" strokeWidth="46" fill="none" strokeLinecap="round" />
      <path d="M-20 520 C 160 440, 260 560, 420 480 S 650 420, 790 470" stroke="#DCEBF7" strokeWidth="12" fill="none" strokeLinecap="round" />
      {/* connections draw in slowly: "community connections" */}
      {LINKS.map(([a, b], i) => {
        const p = prog(frame, 1.6 + i * 0.8, 1.2);
        const [x1, y1] = PINS[a], [x2, y2] = PINS[b];
        return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={BRAND.blue} strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />;
      })}
      {PINS.map(([x, y], i) => {
        const p = prog(frame, 1.0 + i * 0.5, 0.6);
        return <g key={i} transform={`translate(${x} ${y}) scale(${p})`} opacity={p}><circle r="15" fill={i === 2 ? BRAND.red : BRAND.blue} /><circle r="6" fill="#fff" /></g>;
      })}
      {/* generic stylised skyline (no real landmarks implied) */}
      <g fill={BRAND.blue} opacity="0.9">
        {[[40, 70, 560], [100, 120, 510], [170, 90, 540], [250, 150, 480], [340, 100, 530], [420, 170, 460], [520, 110, 520], [600, 140, 490], [680, 80, 550]].map(([x, w, y], i) => (
          <rect key={i} x={x} y={y} width={w * 0.62} height={640 - y} />
        ))}
      </g>
      <rect x="0" y="600" width="760" height="40" fill={BRAND.charcoal} />
    </svg>
  );
};

export const S5: React.FC = () => (
  <Scene id="S5" bg="#EAF1F7">
    <div style={{ position: "absolute", left: 96, top: 150, width: 860, fontFamily: SANS }}>
      <Reveal at={0.4} style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.06, color: BRAND.charcoal, letterSpacing: 1 }}>BUILDING OUR<br /><span style={{ color: BRAND.blue }}>COMMUNITY</span></Reveal>
    </div>
    <Reveal at={0.9} dx={40} dy={0} style={{ position: "absolute", left: 1000, top: 150 }}>
      <MapTile />
    </Reveal>
    <Reveal at={6.6} dy={30} style={{ position: "absolute", left: 96, top: 380 }}>
      <div style={{ width: 840, boxSizing: "border-box", padding: "34px 48px", borderRadius: 24, background: "#fff", border: `4px dashed ${BRAND.red}`, fontFamily: SANS }}>
        <span style={{ display: "inline-block", background: BRAND.red, color: "#fff", fontSize: 30, fontWeight: 800, letterSpacing: 6, padding: "8px 24px", borderRadius: 999 }}>UPCOMING</span>
        <div style={{ marginTop: 20, fontSize: 60, fontWeight: 800, lineHeight: 1.1, color: BRAND.charcoal }}>In-Person Python Workshop</div>
        <div style={{ marginTop: 18, fontSize: 54, fontWeight: 800, color: BRAND.blue }}>{WORKSHOP_DATES}</div>
        <div style={{ marginTop: 14, fontSize: 42, fontWeight: 500, color: "#4B5563" }}>Port Harcourt, Nigeria</div>
        {FLAGS.WORKSHOP_CAP_CONFIRMED && <div style={{ marginTop: 22, fontSize: 34, fontWeight: 700, color: BRAND.red }}>Limited to 30 beginners</div>}
        {FLAGS.WORKSHOP_REGISTRATION_OPEN && <div style={{ marginTop: 14, fontSize: 32, fontWeight: 600, color: BRAND.blue }}>{URLS.workshop}</div>}
      </div>
    </Reveal>
  </Scene>
);

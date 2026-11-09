import React from "react";
import { Img, staticFile } from "remotion";
import { BRAND, PORTRAIT } from "../../scenes.config";
import { Scene } from "../Scene";
import { ORGANIZERS } from "../data/organizers";
import { Kicker, Reveal, SANS } from "../ui";

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);
const RING = 10;
const D = PORTRAIT.display; // outer diameter including the ring; image itself is D - 2*RING (< native, so never upscaled)

export const S3: React.FC = () => (
  <Scene id="S3" bg={BRAND.charcoal}>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M0 ${790 + i * 50} C 400 ${730 + i * 50}, 700 ${870 + i * 50}, 1100 ${800 + i * 50} S 1700 ${750 + i * 50}, 1920 ${810 + i * 50}`} stroke={BRAND.blue} strokeWidth={4} fill="none" />
      ))}
    </svg>
    <div style={{ position: "absolute", left: 96, right: 96, top: 170, fontFamily: SANS, textAlign: "center" }}>
      <Reveal at={0.5}><Kicker color="#FF6B81">Our Leadership</Kicker></Reveal>
    </div>
    <div style={{ position: "absolute", left: 96, right: 96, top: 262, display: "flex", justifyContent: "center", gap: 48, fontFamily: SANS }}>
      {ORGANIZERS.map((o, i) => (
        <Reveal key={o.name} at={2.0 + i * 0.4} dy={34}>
          <div style={{ width: 1400, height: 480, borderRadius: 28, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 64, padding: "0 64px", boxSizing: "border-box", boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>
            <div style={{ width: D, height: D, borderRadius: D / 2, background: BRAND.red, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {o.portrait ? (
                <Img src={staticFile(o.portrait)} style={{ width: D - 2 * RING, height: D - 2 * RING, borderRadius: "50%", display: "block" }} />
              ) : (
                <div style={{ width: D - 2 * RING, height: D - 2 * RING, borderRadius: "50%", background: BRAND.blue, color: "#fff", fontSize: 120, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials(o.name)}</div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 80, fontWeight: 800, color: BRAND.charcoal, lineHeight: 1.05, whiteSpace: "nowrap" }}>{o.name}</div>
              <div style={{ marginTop: 20, fontSize: 44, fontWeight: 600, color: BRAND.blue, whiteSpace: "nowrap" }}>{o.role}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </Scene>
);

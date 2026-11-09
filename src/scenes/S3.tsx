import React from "react";
import { BRAND } from "../../scenes.config";
import { Scene } from "../Scene";
import { ORGANIZERS } from "../data/organizers";
import { Img, staticFile } from "remotion";
import { Kicker, Reveal, SANS } from "../ui";

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);

export const S3: React.FC = () => (
  <Scene id="S3" bg={BRAND.charcoal}>
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M0 ${760 + i * 60} C 400 ${700 + i * 60}, 700 ${840 + i * 60}, 1100 ${770 + i * 60} S 1700 ${720 + i * 60}, 1920 ${780 + i * 60}`} stroke={BRAND.blue} strokeWidth={4} fill="none" />
      ))}
    </svg>
    <div style={{ position: "absolute", left: 96, right: 96, top: 270, fontFamily: SANS, textAlign: "center" }}>
      <Reveal at={0.5}><Kicker color="#FF6B81">Our Leadership</Kicker></Reveal>
    </div>
    <div style={{ position: "absolute", left: 96, right: 96, top: 380, display: "flex", justifyContent: "center", gap: 48, fontFamily: SANS }}>
      {ORGANIZERS.map((o, i) => (
        <Reveal key={o.name} at={2.0 + i * 0.4} dy={34}>
          <div style={{ width: 1000, height: 320, borderRadius: 28, background: "#fff", display: "flex", alignItems: "center", gap: 56, padding: "0 64px", boxSizing: "border-box", boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>
            <div style={{ width: 190, height: 190, borderRadius: 95, background: BRAND.blue, border: `10px solid ${BRAND.red}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 76, fontWeight: 800, flex: "none" }}>
              {o.photo ? <Img src={staticFile(o.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 95 }} /> : initials(o.name)}
            </div>
            <div>
              <div style={{ fontSize: 78, fontWeight: 800, color: BRAND.charcoal, lineHeight: 1.05 }}>{o.name}</div>
              <div style={{ marginTop: 18, fontSize: 42, fontWeight: 600, color: BRAND.blue }}>{o.role}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </Scene>
);

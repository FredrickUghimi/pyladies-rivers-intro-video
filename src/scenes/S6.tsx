import React from "react";
import { Img, staticFile } from "remotion";
import { BRAND, LOGO, TAGLINE, URLS } from "../../scenes.config";
import { Scene } from "../Scene";
import { Reveal, SANS } from "../ui";

// No exit animation here: the closing fade is applied once, over the last 1.0s, in Root.tsx.
export const S6: React.FC = () => (
  <Scene id="S6" bg={BRAND.offWhite} exit={false}>
    <div style={{ position: "absolute", left: 96, top: 170, width: 940, fontFamily: SANS }}>
      <Reveal at={0.5} style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, color: BRAND.charcoal }}>BE PART OF<br />OUR JOURNEY</Reveal>
      <Reveal at={5.0} style={{ marginTop: 44, display: "inline-block", fontSize: 38, fontWeight: 700, color: BRAND.blue, borderBottom: `4px solid ${BRAND.red}`, paddingBottom: 8 }}>{URLS.site}</Reveal>
      <Reveal at={10.8} style={{ marginTop: 56 }}>
        <div style={{ fontSize: 58, fontWeight: 800, color: BRAND.charcoal }}>PyLadies <span style={{ color: BRAND.blue }}>Rivers</span></div>
        <div style={{ marginTop: 10, fontSize: 38, fontWeight: 700, color: BRAND.red }}>{TAGLINE}</div>
      </Reveal>
    </div>
    <Reveal at={2.0} dur={1.1} dx={30} dy={0} style={{ position: "absolute", left: 1140, top: 157 }}>
      <Img src={staticFile(LOGO.src)} style={{ width: LOGO.width, height: LOGO.height, display: "block" }} />
    </Reveal>
  </Scene>
);

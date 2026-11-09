import React from "react";
import { AbsoluteFill, Audio, Composition, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BRAND, FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "../scenes.config";
import { Captions } from "./Captions";
import { S1 } from "./scenes/S1";
import { S2 } from "./scenes/S2";
import { S3 } from "./scenes/S3";
import { S4 } from "./scenes/S4";
import { S5 } from "./scenes/S5";
import { S6 } from "./scenes/S6";

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  // Closing fade to the logo's own background colour over the last 1.0s (S6 shows logo + URL well before this).
  const fade = interpolate(frame, [TOTAL_FRAMES - 30, TOTAL_FRAMES - 1], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ background: BRAND.offWhite }}>
      <S1 /><S2 /><S3 /><S4 /><S5 /><S6 />
      <Captions />
      <AbsoluteFill style={{ background: BRAND.offWhite, opacity: fade }} />
      <Audio src={staticFile("audio/voiceover.wav")} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition id="Intro" component={Intro} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);

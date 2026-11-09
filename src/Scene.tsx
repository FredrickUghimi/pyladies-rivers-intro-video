import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { SceneId, SCENE_IDS, XFADE_FRAMES, sceneFrames, sceneStartFrame } from "../scenes.config";
import { SceneCtx } from "./ui";

const Inner: React.FC<{ bg: string; fadeIn: boolean; children: React.ReactNode }> = ({ bg, fadeIn, children }) => {
  const frame = useCurrentFrame();
  const o = fadeIn ? interpolate(frame, [0, XFADE_FRAMES], [0, 1], { extrapolateRight: "clamp" }) : 1;
  return <AbsoluteFill style={{ background: bg, opacity: o }}>{children}</AbsoluteFill>;
};

/**
 * Reusable scene shell. Starts at the scene's slot in scenes.config.ts and runs XFADE_FRAMES past its end,
 * so the next scene (rendered on top) cross-dissolves over it. Children use <Reveal> for timed entrances;
 * they exit automatically before the slot ends unless `exit={false}`.
 */
export const Scene: React.FC<{ id: SceneId; bg: string; exit?: boolean; children: React.ReactNode }> = ({ id, bg, exit = true, children }) => {
  const last = id === SCENE_IDS[SCENE_IDS.length - 1];
  const frames = sceneFrames(id);
  return (
    <Sequence from={sceneStartFrame(id)} durationInFrames={frames + (last ? 0 : XFADE_FRAMES)} name={id}>
      <SceneCtx.Provider value={{ frames, exit }}>
        <Inner bg={bg} fadeIn={id !== SCENE_IDS[0]}>{children}</Inner>
      </SceneCtx.Provider>
    </Sequence>
  );
};

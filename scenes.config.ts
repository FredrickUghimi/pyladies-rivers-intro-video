// Single source of truth for scene timing and brand constants.
// scripts/prep.py and scripts/verify.py parse SLOT_SECONDS below; keep the literal `S1: 12.7,` format.
import flags from "./config/flags.json";
import narration from "./config/narration.json";
import timings from "./config/timings.json";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_SECONDS = 90;
export const LEAD_IN = 0.8; // seconds of silence before narration starts in each scene
export const MIN_TAIL = 0.7; // narration must end at least this long before the scene ends
export const XFADE_FRAMES = 12; // cross-dissolve overlap into the next scene (0.4s)

export const SLOT_SECONDS = {
  S1: 12.7,
  S2: 14,
  S3: 13,
  S4: 16.5,
  S5: 17,
  S6: 16.8,
};

export type SceneId = keyof typeof SLOT_SECONDS;
export const SCENE_IDS = Object.keys(SLOT_SECONDS) as SceneId[];

export const FLAGS = flags as {
  PSF_CONFIRMED: boolean;
  WORKSHOP_CAP_CONFIRMED: boolean;
  WORKSHOP_REGISTRATION_OPEN: boolean;
};

export const BRAND = {
  red: "#EC1F3D", // sampled from logo
  blue: "#24669E", // sampled from logo
  yellow: "#FBC729", // sampled from logo (Python mark); used sparingly
  charcoal: "#23272F",
  ink: "#2B2F38",
  offWhite: "#FEFEFE", // exactly the logo JPEG's background (254,254,254)
  paper: "#F3F4F6",
  mist: "#EAF1F7",
};

// Logo: margin-cropped from assets/logo/pyladies-rivers.jpg, pixels untouched.
export const LOGO = { src: "img/logo.png", width: 660, height: 638 };

export const URLS = {
  site: "https://pyladies-rivers.github.io/website/",
  workshop: "pyladies-rivers.github.io/website/#workshop",
};
export const WORKSHOP_DATES = "12-13 February 2027";
export const TAGLINE = "Learning. Growing. Building Together.";

// Real, measured narration length per scene (seconds), from config/timings.json
export const NARRATION_SECONDS = Object.fromEntries(
  SCENE_IDS.map((id) => [id, (timings as Record<string, { seconds: number }>)[id].seconds]),
) as Record<SceneId, number>;

export const NARRATION_TEXT = Object.fromEntries(
  SCENE_IDS.map((id) => [id, (timings as Record<string, { text: string }>)[id].text]),
) as Record<SceneId, string>;

export const VOICE = narration.voice;

export const sceneStartSeconds = (id: SceneId) => {
  let t = 0;
  for (const s of SCENE_IDS) {
    if (s === id) return t;
    t += SLOT_SECONDS[s];
  }
  return t;
};
export const sceneStartFrame = (id: SceneId) => Math.round(sceneStartSeconds(id) * FPS);
export const sceneFrames = (id: SceneId) => Math.round(SLOT_SECONDS[id] * FPS);
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);

// Build-time enforcement: throws (and so fails the render) if timing rules are broken.
const total = SCENE_IDS.reduce((a, s) => a + SLOT_SECONDS[s], 0);
if (Math.abs(total - TOTAL_SECONDS) > 1e-6) throw new Error(`Scene slots sum to ${total}s, expected ${TOTAL_SECONDS}s`);
for (const s of SCENE_IDS) {
  const need = LEAD_IN + NARRATION_SECONDS[s] + MIN_TAIL;
  if (need > SLOT_SECONDS[s] + 1e-6) throw new Error(`${s} narration needs ${need.toFixed(3)}s but slot is ${SLOT_SECONDS[s]}s`);
}

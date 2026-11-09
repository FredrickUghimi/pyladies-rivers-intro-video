# PyLadies Rivers: Chapter Introduction Video

A 90-second, faceless chapter introduction video for **PyLadiesCon 2026**, built for **PyLadies Rivers** (Port Harcourt, Rivers State, Nigeria).

- Format: 1920x1080, 16:9, 30 fps, exactly 90.0 seconds
- Stack: React + Remotion
- Narration: Microsoft neural voice `en-NG-EzinneNeural` via `edge-tts` (rate +0%, no pitch change, no time-stretching), 0.3s silence between sentences, word-level timings
- Output: MP4, voice-over audio, `.srt` subtitles (also burned in, current word highlighted)

## Status

- [x] TTS per-scene timing pass (`scripts/tts.py`, results in `config/timings.json`)
- [x] Scenes built (S1 to S6)
- [x] Subtitles burned in and exported (`deliverables/PyLadies-Rivers-Intro.srt`)
- [x] Low-res 90s preview rendered, verification 11/11 on the preview
- [ ] Verification checklist passed on the final MP4
- [ ] Final MP4 rendered (waiting for approval of the preview)

Update this list as work lands. Do not tick a box that isn't true.

## Scenes

| # | Scene | Target |
|---|---|---|
| 1 | Opening identity | 10s |
| 2 | Our mission | 15s |
| 3 | Our leadership | 12s |
| 4 | Learning by doing (existing mentorship programme) | 20s |
| 5 | Building our community (upcoming workshop) | 18s |
| 6 | Invitation and closing | 15s |

Durations live in `scenes.config.ts`. Each scene is its narration length plus about 0.8s lead-in and 0.7s tail, adjusted so the total is exactly 90.0s.

## Setup

Requirements: Node 20+, Python 3 with `edge-tts` and `Pillow` and `numpy`, `ffmpeg` and `ffprobe`, Chromium (the render scripts use `/opt/pw-browsers/chromium`; change `--browser-executable` in `package.json` elsewhere). The scenes use the system fonts Inter and DejaVu Sans Mono.

```bash
npm install
```

## Build pipeline

All scripts are in `package.json`:

```bash
npm run tts              # per-scene narration (one clip per sentence, 0.3s pauses, word timings) -> public/audio, config/timings.json
npm run prep             # crop logo, build captions + .srt, assemble the 90.0s voiceover (also run by the render scripts)
npm run preview          # Remotion studio
npm run render:preview   # 960x540 full 90s preview -> deliverables/preview-lowres.mp4
npm run render           # 1920x1080 final -> deliverables/PyLadies-Rivers-Intro.mp4
npm run verify:preview   # checklist against the preview (exit 1 on any failure)
npm run verify           # checklist against the final MP4 (exit 1 on any failure; duration must be 90.0s +/-0.05s)
```

The voice is fixed to `en-NG-EzinneNeural` (`config/narration.json`), rate +0%, no pitch change, no time-stretching. The environment must be able to reach `speech.platform.bing.com`. `edge-tts` 7.x pins certifi's CA bundle, so behind a TLS-inspecting proxy `scripts/tts.py` uses the bundle in `SSL_CERT_FILE` when it is set (verification stays on).

Order matters: run the TTS timing pass before touching visuals, so scene lengths come from real audio. Scene slots live in `scenes.config.ts`; the render throws if a narration clip does not fit its slot.

## Configuration

Flags live in `config/flags.json`, never in components. All default to `false`. Narration text is in `config/narration.json`.

| Flag | Effect when `true` |
|---|---|
| `PSF_CONFIRMED` | S5 narration says the workshop is supported by the Python Software Foundation. Set only with written confirmation. |
| `WORKSHOP_CAP_CONFIRMED` | S5 shows "Limited to 30 beginners". |
| `WORKSHOP_REGISTRATION_OPEN` | S5 shows the workshop registration link. |

Organizers are a data array (name, role, optional photo). Only Fredrick Ughimi is listed. Add others only when they are confirmed.

## Assets

```
assets/
  logo/        pyladies-rivers.jpg
  curriculum/  PyLadies_Rivers_Curriculum.md
  photos/      cleared pilot-cohort photos + CONSENT.md
  _do-not-use/ forbidden promo poster, kept out of the build
```

Rules:

- **Logo:** crop margins only. Never recolour, stretch, redraw or cut out the background. Scenes 1 and 6 use a white or off-white background so it sits natively. Accent colours are sampled from the logo.
- **One brand identity only.** Promo flyers, posters, and anything with a TikTok watermark or creator handle are not used.
- **Photos:** only those marked "cleared" in `assets/photos/CONSENT.md`. Captioned "Our pilot cohort". No stock footage and no AI-generated imagery presented as real people.
- **Code demos in S4** come from the 8-week curriculum, not invented examples.
- **No music.** The video is narration only.


## Accuracy rules

- No invented organizers, achievements, member counts, partnerships, activities or venues.
- Existing mentorship activity and the upcoming workshop stay visually and verbally distinct.
- Workshop: 12-13 February 2027, Port Harcourt, Nigeria. No venue or session times on screen.

## Verification before final render

- [ ] Duration is 90.0s (ffprobe)
- [ ] Every narration clip ends before its scene ends
- [ ] Six scenes in order, no missing media, no broken transitions
- [ ] Logo proportions intact, no white-box artefacts
- [ ] URL is `https://pyladies-rivers.github.io/website/`; dates are 12-13 February 2027
- [ ] S5 text matches the flag states
- [ ] No forbidden assets used
- [ ] Narration is clearly audible; captions match the narration text; S4 code is verbatim from the curriculum

## Licensing notes

Remotion has its own licence terms, and company use may require a paid licence. Check before rendering for any commercial context.

## Links

- Website: https://pyladies-rivers.github.io/website/
- YouTube: https://www.youtube.com/@RiversPyLadies
- GitHub: https://github.com/orgs/PyLadies-Rivers
- PyLadies Global: https://pyladies.com/
- Contact: rivers@pyladies.com

## Maintainer

Fredrick Ughimi, Lead Organizer and Mentor, PyLadies Rivers.

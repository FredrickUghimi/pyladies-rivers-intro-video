# PyLadies Rivers: Chapter Introduction Video

A 90-second, faceless chapter introduction video for **PyLadiesCon 2026**, built for **PyLadies Rivers** (Port Harcourt, Rivers State, Nigeria).

- Format: 1920x1080, 16:9, 30 fps, exactly 90.0 seconds
- Stack: React + Remotion
- Narration: Microsoft neural voice `en-NG-EzinneNeural` via `edge-tts`
- Output: MP4, voice-over audio, mixed audio, `.srt` subtitles

## Status

- [ ] TTS per-scene timing pass
- [ ] Scenes built (S1 to S6)
- [ ] Subtitles burned in and exported
- [ ] Music mixed and ducked (optional)
- [ ] Verification checklist passed
- [ ] Final MP4 rendered

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

Requirements: Node 20+, Python 3, `ffmpeg` and `ffprobe`, `edge-tts` (`pip install edge-tts`).

```bash
npm install
```

The cloud environment must be able to reach `speech.platform.bing.com`, or voice generation fails.

## Build pipeline

> Script names below must match `package.json`. If they don't, fix this section.

```bash
npm run tts        # generate per-scene narration, measure clips with ffprobe
npm run preview    # open the Remotion studio
npm run render     # render the final MP4
npm run verify     # fail unless the MP4 is 90.0s (+/-0.05s)
```

Order matters: run the TTS timing pass before touching visuals, so scene lengths come from real audio.

## Configuration

Flags live in the config file, never in components. All default to `false`.

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
  curriculum/  PyLadies_Rivers_Curriculum_Overhaul.md
  photos/      cleared pilot-cohort photos + CONSENT.md
  music/       licensed track (optional)
```

Rules:

- **Logo:** crop margins only. Never recolour, stretch, redraw or cut out the background. Scenes 1 and 6 use a white or off-white background so it sits natively. Accent colours are sampled from the logo.
- **One brand identity only.** Promo flyers, posters, and anything with a TikTok watermark or creator handle are not used.
- **Photos:** only those marked "cleared" in `assets/photos/CONSENT.md`. Captioned "Our pilot cohort". No stock footage and no AI-generated imagery presented as real people.
- **Code demos in S4** come from the 8-week curriculum, not invented examples.
- **Music:** licensed tracks only, with the licence noted below. No licensed track means narration only.

### Music licence

Track: _not yet added_
Source and licence: _fill in when added_

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
- [ ] Music (if present) is ducked and narration is clearly audible

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

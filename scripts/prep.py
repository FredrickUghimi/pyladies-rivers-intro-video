"""Build-time asset prep: logo crop, captions.json, .srt, full-length voiceover track.
Run via `npm run prep` (also called by the render scripts)."""
import json, math, os, re, subprocess, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda p: json.load(open(f"{ROOT}/{p}"))
cfg = open(f"{ROOT}/scenes.config.ts").read()
SLOTS = {k: float(v) for k, v in re.findall(r"^\s*(S\d):\s*([\d.]+),", cfg, re.M)}
LEAD = float(re.search(r"LEAD_IN = ([\d.]+)", cfg).group(1))
assert len(SLOTS) == 6 and abs(sum(SLOTS.values()) - 90) < 1e-9, SLOTS
T = J("config/timings.json")

# 1. Logo: crop margins only (lossless PNG of the identical pixels; no resize, recolour or background removal)
CROP = (200, 26, 860, 664)
logo = Image.open(f"{ROOT}/assets/logo/pyladies-rivers.jpg").convert("RGB").crop(CROP)
logo.save(f"{ROOT}/public/img/logo.png")
lw, lh = re.search(r"width: (\d+), height: (\d+)", cfg).groups()
assert logo.size == (int(lw), int(lh)), f"LOGO in scenes.config.ts must be {logo.size}"

# 2. Captions: 4-8 word phrases per sentence, boundaries preferring punctuation
WEAK = {"a","an","the","of","to","and","or","for","in","with","about","our","is","are","we","just","from","by","that","where","you","your","but","at","on","as","can","into"}
def split(words):
    n = len(words); INF = 1e9
    best = [INF]*(n+1); prev = [0]*(n+1); best[0] = 0
    for j in range(1, n+1):
        for i in range(max(0, j-8), j-3):
            if best[i] >= INF: continue
            size = j-i; c = best[i] + 0.1*(size-6)**2
            if re.search(r"[,:;.!?]$", words[j-1]["text"]): c -= 3
            elif re.sub(r"\W", "", words[j-1]["text"]).lower() in WEAK: c += 4
            if c < best[j]: best[j], prev[j] = c, i
    assert best[n] < INF, f"cannot phrase {n} words"
    cuts, j = [], n
    while j: cuts.append((prev[j], j)); j = prev[j]
    return [words[a:b] for a, b in reversed(cuts)]
caps, offsets = [], {}
t0 = 0.0
for sid in sorted(SLOTS):
    base = t0 + LEAD; offsets[sid] = base
    W = J(f"public/audio/{sid}.words.json")
    phrases = []
    for s in sorted({w["sentence"] for w in W}):
        phrases += split([w for w in W if w["sentence"] == s])
    for k, ph in enumerate(phrases):
        start = base + ph[0]["start"]; last = base + ph[-1]["end"]
        nxt = base + phrases[k+1][0]["start"] if k+1 < len(phrases) else None
        end = nxt if (nxt is not None and nxt - last < 0.5) else last + 0.35
        caps.append({"scene": sid, "start": round(start, 3), "end": round(end, 3),
                     "words": [{"text": w["text"], "start": round(base+w["start"], 3), "end": round(base+w["end"], 3)} for w in ph]})
    t0 += SLOTS[sid]
json.dump(caps, open(f"{ROOT}/src/data/captions.json", "w"), indent=1)
for sid in SLOTS:  # captions must equal narration text exactly
    got = " ".join(w["text"] for c in caps if c["scene"] == sid for w in c["words"])
    assert got == T[sid]["text"], f"{sid} caption text differs from narration"

# 3. SRT (text identical to narration)
def ts(x):
    ms = round(x*1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
with open(f"{ROOT}/deliverables/PyLadies-Rivers-Intro.srt", "w") as f:
    for i, c in enumerate(caps, 1):
        f.write(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{' '.join(w['text'] for w in c['words'])}\n\n")

# 4. Voiceover: each scene wav placed at scene start + lead-in, padded/trimmed to exactly 90.0s. No music, no time-stretch.
cmd = ["ffmpeg", "-y", "-loglevel", "error"]; fl = []; t0 = 0.0
for i, sid in enumerate(sorted(SLOTS)):
    cmd += ["-i", f"{ROOT}/public/audio/{sid}.wav"]
    fl.append(f"[{i}:a]adelay={round((t0+LEAD)*1000)}:all=1[a{i}]"); t0 += SLOTS[sid]
fl.append("".join(f"[a{i}]" for i in range(6)) + "amix=inputs=6:normalize=0,apad=whole_dur=90,atrim=0:90[o]")
cmd += ["-filter_complex", ";".join(fl), "-map", "[o]", "-ar", "24000", "-ac", "1", f"{ROOT}/public/audio/voiceover.wav"]
subprocess.check_call(cmd)
subprocess.check_call(["ffmpeg","-y","-loglevel","error","-i",f"{ROOT}/public/audio/voiceover.wav","-codec:a","libmp3lame","-q:a","2",f"{ROOT}/deliverables/voiceover.mp3"])
print("prep OK:", len(caps), "caption phrases;", offsets)

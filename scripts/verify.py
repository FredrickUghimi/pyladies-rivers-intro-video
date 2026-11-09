"""Verification checklist. Usage: python3 scripts/verify.py [video.mp4] [--preview]
Prints PASS/FAIL per item and exits 1 if any item fails (this is the build gate)."""
import hashlib, json, os, re, subprocess, sys, tempfile
from PIL import Image
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith("--")]
PREVIEW = "--preview" in sys.argv
VIDEO = args[0] if args else f"{ROOT}/deliverables/{'preview-lowres.mp4' if PREVIEW else 'PyLadies-Rivers-Intro.mp4'}"
R = lambda p: open(f"{ROOT}/{p}", encoding="utf-8").read()
J = lambda p: json.loads(R(p))
cfg = R("scenes.config.ts")
SLOTS = {k: float(v) for k, v in re.findall(r"^\s*(S\d):\s*([\d.]+),", cfg, re.M)}
LEAD = float(re.search(r"LEAD_IN = ([\d.]+)", cfg).group(1)); TAIL = float(re.search(r"MIN_TAIL = ([\d.]+)", cfg).group(1))
T, N, F, CAPS = J("config/timings.json"), J("config/narration.json"), J("config/flags.json"), J("src/data/captions.json")
starts, t = {}, 0.0
for k in SLOTS: starts[k] = t; t += SLOTS[k]
results = []
def check(name):
    def deco(fn):
        try: ok, detail = fn()
        except Exception as e: ok, detail = False, f"error: {e}"
        results.append((name, ok, detail)); return fn
    return deco
def sh(*a): return subprocess.run(list(a), capture_output=True, text=True)
def frame(tsec):
    f = tempfile.mktemp(suffix=".png"); sh("ffmpeg", "-y", "-loglevel", "error", "-ss", f"{tsec:.3f}", "-i", VIDEO, "-frames:v", "1", f)
    im = Image.open(f).convert("RGB"); os.remove(f); return im
SRC = "".join(R(f"src/{p}") for p in ["Root.tsx", "Scene.tsx", "Captions.tsx", "ui.tsx"] ) + "".join(R(f"src/scenes/{f}") for f in sorted(os.listdir(f"{ROOT}/src/scenes"))) + cfg

@check("ffprobe duration = 90.0s (+/-0.05s), 16:9, 30fps, has audio")
def _():
    p = json.loads(sh("ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate,duration", "-of", "json", VIDEO).stdout)
    d = float(p["format"]["duration"]); v = next(s for s in p["streams"] if s["codec_type"] == "video"); a = [s for s in p["streams"] if s["codec_type"] == "audio"]
    w, h = (960, 540) if PREVIEW else (1920, 1080)
    ok = abs(d - 90.0) <= 0.05 and (v["width"], v["height"]) == (w, h) and v["r_frame_rate"] == "30/1" and len(a) == 1
    return ok, f"duration={d:.3f}s size={v['width']}x{v['height']} fps={v['r_frame_rate']} audio_streams={len(a)}"

@check("every narration clip ends before its scene ends (with >= 0.7s tail)")
def _():
    rows, ok = [], True
    for k in SLOTS:
        end = LEAD + T[k]["seconds"]; slack = SLOTS[k] - end
        ok &= slack >= TAIL - 1e-6; rows.append(f"{k} {slack:.2f}s")
    return ok, "tail left: " + ", ".join(rows)

@check("six scenes in order, contiguous, sum to 90.0s; all media present")
def _():
    need = [f"public/audio/{k}.{e}" for k in SLOTS for e in ("wav", "mp3", "words.json")] + ["public/img/logo.png", "public/audio/voiceover.wav", "deliverables/PyLadies-Rivers-Intro.srt", "deliverables/voiceover.mp3"]
    missing = [m for m in need if not os.path.exists(f"{ROOT}/{m}")]
    order = list(SLOTS) == [f"S{i}" for i in range(1, 7)] and re.findall(r"<(S\d) />", R("src/Root.tsx")) == list(SLOTS)
    return (not missing) and order and abs(sum(SLOTS.values()) - 90) < 1e-9, f"order_ok={order} missing={missing}"

@check("transitions smooth: no black frames, no hard cuts at any of the 5 scene boundaries")
def _():
    bad, worst = [], 0.0
    for k in list(SLOTS)[1:]:
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{starts[k]-0.4:.3f}", "-t", "1.6", "-i", VIDEO, "-vf", "fps=30,scale=96:54,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
        fr = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 54 * 96).astype(float); m = fr.mean(axis=1)
        step = float(np.abs(np.diff(m)).max()); worst = max(worst, step)
        if m.min() < 8 or step > 30: bad.append(f"{k} (min mean {m.min():.0f}, max step {step:.0f})")
    return not bad, f"largest frame-to-frame brightness step={worst:.1f} (limit 30); bad={bad}"

@check("logo proportions intact (crop only, native size) and no white-box artefacts")
def _():
    lg = Image.open(f"{ROOT}/public/img/logo.png"); orig = Image.open(f"{ROOT}/assets/logo/pyladies-rivers.jpg").convert("RGB").crop((200, 26, 860, 664))
    same_px = hashlib.md5(lg.convert("RGB").tobytes()).hexdigest() == hashlib.md5(orig.tobytes()).hexdigest()
    w, h = map(int, re.search(r"width: (\d+), height: (\d+)", cfg).groups())
    props = (w, h) == lg.size and w <= 720 and "width: LOGO.width, height: LOGO.height" in R("src/scenes/S1.tsx") + R("src/scenes/S6.tsx") and not re.search(r"objectFit.*logo|LOGO.*scale", SRC)
    bgok = re.search(r'offWhite: "#FEFEFE"', cfg) and Image.open(f"{ROOT}/assets/logo/pyladies-rivers.jpg").convert("RGB").getpixel((0, 0)) == (254, 254, 254)
    sc = 0.5 if PREVIEW else 1.0; diffs = []
    for k, left, ts_ in (("S1", 110, starts["S1"] + 8.0), ("S6", 1140, starts["S6"] + 14.0)):
        im = np.asarray(frame(ts_), dtype=float); top = 157
        def patch(x, y): return im[int(y * sc):int(y * sc) + 3, int(x * sc):int(x * sc) + 3].mean(axis=(0, 1))
        for (ix, iy), (ox, oy) in [((left + 6, top + 6), (left - 14, top - 14)), ((left + w - 9, top + h - 9), (left + w + 11, top + h + 11))]:
            diffs.append(float(np.abs(patch(ix, iy) - patch(ox, oy)).max()))
    tol = 6 if PREVIEW else 3
    return same_px and props and bgok and max(diffs) <= tol, f"pixels_identical_to_crop={same_px} size={lg.size} edge_diff_max={max(diffs):.1f} (tol {tol})"

@check("URL = https://pyladies-rivers.github.io/website/ ; dates = 12-13 February 2027 ; no WhatsApp on screen")
def _():
    site = re.search(r'site: "([^"]+)"', cfg).group(1); dates = re.search(r'WORKSHOP_DATES = "([^"]+)"', cfg).group(1)
    urls = set(re.findall(r"[\w.-]*pyladies-rivers\.github\.io[^\s\"'`<>)]*", SRC))
    other_dates = [d for d in re.findall(r"\d{1,2}\s?[-–]\s?\d{1,2}\s+February\s+\d{4}", SRC) if d != "12-13 February 2027"]
    ok = site == "https://pyladies-rivers.github.io/website/" and dates == "12-13 February 2027" and urls <= {"pyladies-rivers.github.io/website/", "pyladies-rivers.github.io/website/#workshop", "pyladies-rivers.github.io/website/"} | {site.replace("https://", "")} and other_dates == [] and not re.search(r"whatsapp|wa\.me", SRC + "".join(c["scene"] for c in CAPS), re.I)
    return ok, f"site={site} dates={dates} url_strings={sorted(urls)}"

@check("S5 text matches flag states; no venue or session times")
def _():
    s5 = R("src/scenes/S5.tsx"); psf = F["PSF_CONFIRMED"]
    narr_ok = T["S5"]["text"] == (N["S5_PSF"] if psf else N["S5"]) and ("Python Software Foundation" in T["S5"]["text"]) == psf
    cap_ok = re.search(r"FLAGS\.WORKSHOP_CAP_CONFIRMED && .*Limited to 30 beginners", s5) and s5.count("Limited to 30 beginners") == 1
    reg_ok = re.search(r"FLAGS\.WORKSHOP_REGISTRATION_OPEN && .*URLS\.workshop", s5) and "#workshop" not in s5
    no_time = not re.search(r"\b\d{1,2}:\d{2}\b|\b\d{1,2}\s?(am|pm)\b|\b(venue|hall|hotel|centre|center)\b", s5, re.I)
    upcoming = "UPCOMING" in s5 and "UPCOMING" not in R("src/scenes/S4.tsx")
    flags_default = all(v is False for v in F.values())
    return bool(narr_ok and cap_ok and reg_ok and no_time and upcoming and flags_default), f"flags={F} narr_ok={bool(narr_ok)} cap_gated={bool(cap_ok)} reg_gated={bool(reg_ok)} no_times_or_venue={no_time} upcoming_badge={upcoming}"

@check("no forbidden assets (flyers, posters, watermarked images, stock footage)")
def _():
    files = [os.path.relpath(os.path.join(d, f), f"{ROOT}/public") for d, _, fs in os.walk(f"{ROOT}/public") for f in fs]
    allowed = lambda f: f in ("img/logo.png", "img/fredrick.png") or re.fullmatch(r"audio/(S[1-6]|voiceover)\.(wav|mp3|words\.json)", f) or f.startswith("audio/parts/")
    stray = [f for f in files if not allowed(f)]
    toks = re.findall(r"_do-not-use|WA0007|flyer|poster|tiktok|code\.architect|stock footage|pexels|unsplash|shutterstock|\.mp4|assets/photos", SRC, re.I)
    return not stray and not toks, f"public files={len(files)} stray={stray} forbidden_tokens={toks}"

@check("S3 portrait: approved avatar only, crimson ring, <=480px, never upscaled, no overlap, never called a photo")
def _():
    from PIL import ImageFont
    av = Image.open(f"{ROOT}/public/img/fredrick.png"); src = Image.open(f"{ROOT}/assets/people/fredrick.jpg").convert("RGB")
    cx, cy, r = 540, 541, 503
    same = np.array_equal(np.asarray(av.convert("RGB"))[r - 50:r + 50, r - 50:r + 50], np.asarray(src.crop((cx - 50, cy - 50, cx + 50, cy + 50))))  # uniform crop: centre pixels identical
    rim = np.asarray(av)[:, :, 3]; corner_clear = rim[0, 0] == 0 and rim[-1, -1] == 0
    disp = int(re.search(r"display: (\d+)", cfg).group(1)); native = av.size[0]
    s3 = R("src/scenes/S3.tsx") + R("src/data/organizers.ts")
    ring_ok = "background: BRAND.red" in s3 and 'red: "#EC1F3D"' in cfg
    dirs_ok = sorted(os.listdir(f"{ROOT}/assets/logo")) == ["pyladies-rivers.jpg"] and sorted(os.listdir(f"{ROOT}/assets/people")) == ["fredrick.jpg"]
    no_photo_word = not re.search(r"photo", s3 + "".join(c["scene"] for c in CAPS) + "".join(w["text"] for c in CAPS for w in c["words"]), re.I)
    font = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf", 80) if os.path.exists("/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf") else ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 80)
    text_w = font.getlength("Fredrick Ughimi"); room = 1400 - 2 * 64 - 64 - disp
    ok = same and corner_clear and disp <= 480 and disp < native and ring_ok and dirs_ok and no_photo_word and text_w <= room - 8
    return bool(ok), f"crop_uniform={same} corners_transparent={corner_clear} display={disp}px native={native}px ring_crimson={ring_ok} logo_dir_only_logo={dirs_ok} no_'photo'_text={no_photo_word} name_width={text_w:.0f}px of {room}px"

@check("pronunciation: TTS says 'Pie Ladies'; captions, on-screen text and .srt keep 'PyLadies'")
def _():
    pr = N.get("pronunciation", {}); ok = pr == {"PyLadies": "Pie Ladies"}
    for k in ("S1", "S3", "S6"):
        ok &= "Pie Ladies" in T[k]["spoken"] and "PyLadies" in T[k]["text"] and "Pie" not in T[k]["text"]
    screen = R("deliverables/PyLadies-Rivers-Intro.srt") + json.dumps(CAPS) + SRC
    ok &= not re.search(r"Pie Ladies|\bPie\b", screen)
    n_cap = sum(w["text"].startswith("PyLadies") for c in CAPS for w in c["words"]); n_txt = sum(T[k]["text"].count("PyLadies") for k in SLOTS)
    ok &= n_cap == n_txt == 3
    return bool(ok), f"spoken_respelled_scenes=S1,S3,S6 caption_tokens={n_cap} narration_mentions={n_txt}; 'Pie' absent from srt/captions/source"

@check("S4 code demos are verbatim from assets/curriculum/PyLadies_Rivers_Curriculum.md")
def _():
    cur = R("assets/curriculum/PyLadies_Rivers_Curriculum.md"); sn = R("src/data/snippets.ts")
    import ast
    pyblocks = re.findall(r"```python\n(.*?)```", cur, re.S)
    ok, bad = True, []
    for blk in re.findall(r"lines: \[(.*?)\],?\s*\}", sn, re.S):
        items = [m for m in re.findall(r"""'([^']*)'|"((?:[^"\\]|\\.)*)\"""", blk)]
        snippet = "\n".join(a if a else b.replace('\\"', '"') for a, b in items)
        if not any(snippet.strip() == b.strip() or snippet in b for b in pyblocks): bad.append(snippet.splitlines()[0])
    return not bad, f"snippets not found verbatim: {bad}"

@check("captions: 4-8 words, text identical to narration, SRT matches, inside scene")
def _():
    bad = []
    for k in SLOTS:
        cs = [c for c in CAPS if c["scene"] == k]
        if " ".join(w["text"] for c in cs for w in c["words"]) != T[k]["text"]: bad.append(f"{k} text")
        for c in cs:
            if not 4 <= len(c["words"]) <= 8: bad.append(f"{k} len {len(c['words'])}")
            if c["end"] > starts[k] + SLOTS[k] - TAIL + 0.36: bad.append(f"{k} late cue")
    srt = R("deliverables/PyLadies-Rivers-Intro.srt").strip().split("\n\n")
    if len(srt) != len(CAPS): bad.append("srt count")
    for blk, c in zip(srt, CAPS):
        if blk.split("\n", 2)[2] != " ".join(w["text"] for w in c["words"]): bad.append("srt text")
    ends = [c["end"] for c in CAPS]; 
    if any(CAPS[i + 1]["start"] < ends[i] - 1e-6 for i in range(len(CAPS) - 1)): bad.append("overlapping cues")
    return not bad, f"{len(CAPS)} phrases; problems={bad}"

@check("no music anywhere; narration clearly audible")
def _():
    music = [f for d, _, fs in os.walk(ROOT) if "node_modules" not in d and ".git" not in d for f in fs if re.search(r"music|soundtrack", f, re.I)]
    code = re.search(r"music|duck", SRC, re.I) is not None or os.path.exists(f"{ROOT}/assets/music")
    r = sh("ffmpeg", "-i", VIDEO, "-af", "ebur128=peak=true", "-f", "null", "-"); m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr); pk = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r.stderr)
    lufs = float(m[-1]); peak = float(pk[-1])
    quiet = []
    for k in SLOTS:
        v = sh("ffmpeg", "-ss", f"{starts[k] + LEAD:.2f}", "-t", f"{T[k]['seconds']:.2f}", "-i", VIDEO, "-af", "volumedetect", "-f", "null", "-").stderr
        mean = float(re.search(r"mean_volume: (-?[\d.]+)", v).group(1))
        if mean < -38: quiet.append(f"{k} {mean}")
    return not music and not code and -26 <= lufs <= -14 and peak <= -0.5 and not quiet, f"music_files={music} integrated={lufs} LUFS true_peak={peak} dBFS quiet_scenes={quiet}"

w = max(len(n) for n, _, _ in results)
print(f"\nVERIFICATION  ({os.path.relpath(VIDEO, ROOT)})\n" + "-" * 100)
for n, ok, d in results: print(f"[{'PASS' if ok else 'FAIL'}] {n}\n        {d}")
bad = [n for n, ok, _ in results if not ok]
print("-" * 100 + f"\n{len(results) - len(bad)}/{len(results)} passed" + ("" if not bad else f"  FAILED: {len(bad)}"))
sys.exit(1 if bad else 0)

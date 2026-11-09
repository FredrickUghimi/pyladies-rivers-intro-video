"""Per-scene TTS pass (final audio spec).
- Voice en-NG-EzinneNeural only, rate +0%, pitch +0Hz. No time-stretching anywhere.
- WordBoundary events requested explicitly; if none arrive for a clip the script STOPS.
- Each sentence is its own clip; clips are joined with exactly 0.3s silence; word timestamps are recomputed with offsets.
Outputs: public/audio/S{n}.wav|mp3 (narration only, no lead-in/tail), public/audio/S{n}.words.json, config/timings.json"""
import asyncio, json, os, re, subprocess, sys, certifi
if os.environ.get("SSL_CERT_FILE"):  # edge-tts pins certifi; honour the proxy CA, verification stays on
    certifi.where = lambda: os.environ["SSL_CERT_FILE"]
import edge_tts
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = f"{ROOT}/public/audio"; P = f"{A}/parts"
N = json.load(open(f"{ROOT}/config/narration.json"))
F = json.load(open(f"{ROOT}/config/flags.json"))
VOICE, RATE, PITCH, PAUSE = N["voice"], "+0%", "+0Hz", 0.3
PRON = N.get("pronunciation", {})  # respelling applies to the TTS input only; captions keep the original text
def spoken_text(t):
    for k, v in PRON.items(): t = t.replace(k, v)
    return t
assert VOICE == "en-NG-EzinneNeural", "voice must not be changed"
os.makedirs(P, exist_ok=True)
def run(*a): subprocess.check_call(list(a), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
def dur(p):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).decode())
def sentences(t): return [s for s in re.split(r"(?<=[.!?])\s+", t.strip()) if s]
def align(tokens, bounds):
    """Map boundary events to text tokens 1:1. A boundary covering several tokens (e.g. 'February 2027') is split by character length."""
    norm = lambda x: re.sub(r"[^\w]", "", x).lower()
    out, ti = [], 0
    for b in bounds:
        grp = [tokens[ti]]; ti += 1
        while norm("".join(grp)) != norm(b["text"]):
            assert ti < len(tokens), f"cannot align {b['text']!r}"
            grp.append(tokens[ti]); ti += 1
        tot = sum(len(norm(g)) for g in grp); a = b["start"]
        for g in grp:
            e = a + (b["end"] - b["start"]) * len(norm(g)) / tot
            out.append({"text": g, "start": a, "end": e}); a = e
    assert ti == len(tokens), "tokens left over"
    return out
def fold(cap_tokens, spoken_aligned):
    """Caption token -> time span. A respelled token (e.g. 'PyLadies' -> 'Pie Ladies') spans several spoken words:
    start of the first spoken word to end of the last."""
    out, i = [], 0
    for tok in cap_tokens:
        k = len(spoken_text(tok).split()); grp = spoken_aligned[i:i+k]; i += k
        out.append({"text": tok, "start": grp[0]["start"], "end": grp[-1]["end"]})
    assert i == len(spoken_aligned), "spoken/caption token mismatch"
    return out
async def clip(path, text):
    c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, boundary="WordBoundary")
    words = []
    with open(path, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"text": ch["text"], "start": ch["offset"]/1e7, "end": (ch["offset"]+ch["duration"])/1e7})
    if not words:
        sys.exit(f"STOP: no WordBoundary events returned for: {text!r}")
    return words
async def scene(key, text):
    wavs, words, t = [], [], 0.0
    ss = sentences(text)
    for i, s in enumerate(ss):
        mp3 = f"{P}/{key}_{i}.mp3"; wav = f"{P}/{key}_{i}.wav"
        sp = spoken_text(s)
        w = fold(s.split(), align(sp.split(), await clip(mp3, sp)))
        run("ffmpeg","-y","-i",mp3,"-ar","24000","-ac","1",wav)   # decode only; no tempo change
        d = dur(wav)
        words += [{"text": x["text"], "start": round(t+x["start"],4), "end": round(t+x["end"],4), "sentence": i} for x in w]
        wavs.append(wav); t += d
        if i < len(ss)-1:
            sil = f"{P}/sil.wav"
            run("ffmpeg","-y","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t",str(PAUSE),sil)
            wavs.append(sil); t += PAUSE
    lst = f"{P}/{key}.txt"; open(lst,"w").write("".join(f"file '{w}'\n" for w in wavs))
    out = f"{A}/{key}.wav"
    run("ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c","copy",out)
    run("ffmpeg","-y","-i",out,"-codec:a","libmp3lame","-q:a","2",f"{A}/{key}.mp3")
    json.dump(words, open(f"{A}/{key}.words.json","w"), indent=1)
    n_tok = len(text.split())
    return {"seconds": round(dur(out),3), "sentences": len(ss), "words_timed": len(words), "words_in_text": n_tok, "text": text, "spoken": spoken_text(text)}
async def main():
    res = {}
    for i in range(1, 7):
        key = f"S{i}"
        text = N["S5_PSF"] if (i == 5 and F["PSF_CONFIRMED"]) else N[key]
        res[key] = await scene(key, text)
        r = res[key]; print(key, r["seconds"], "s", r["sentences"], "sent", r["words_timed"], "/", r["words_in_text"], "words")
    json.dump(res, open(f"{ROOT}/config/timings.json","w"), indent=1)
asyncio.run(main())

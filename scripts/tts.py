"""Per-scene TTS pass. Voice is fixed in config/narration.json (en-NG-EzinneNeural); no fallback voice.
Writes public/audio/S{n}.mp3, per-word timing public/audio/S{n}.words.json, and config/timings.json."""
import asyncio, json, os, subprocess, sys, certifi
if os.environ.get("SSL_CERT_FILE"):  # edge-tts pins certifi; honour the proxy CA, verification stays on
    certifi.where = lambda: os.environ["SSL_CERT_FILE"]
import edge_tts
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = json.load(open(f"{ROOT}/config/narration.json"))
F = json.load(open(f"{ROOT}/config/flags.json"))
VOICE = N["voice"]
assert VOICE == "en-NG-EzinneNeural", "voice must not be changed"
def dur(p):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).decode())
async def one(key, text):
    out = f"{ROOT}/public/audio/{key}.mp3"
    c = edge_tts.Communicate(text, VOICE, boundary="WordBoundary")
    words = []
    with open(out, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"text": ch["text"], "start": ch["offset"]/1e7, "end": (ch["offset"]+ch["duration"])/1e7})
    json.dump(words, open(f"{ROOT}/public/audio/{key}.words.json","w"), indent=1)
    return dur(out), len(text.split())
async def main():
    res = {}
    for i in range(1, 7):
        key = f"S{i}"
        text = N["S5_PSF"] if (i == 5 and F["PSF_CONFIRMED"]) else N[key]
        d, w = await one(key, text)
        res[key] = {"seconds": round(d, 3), "words": w, "wpm": round(w / d * 60), "text": text}
        print(key, res[key]["seconds"], "s", w, "words", res[key]["wpm"], "wpm")
    json.dump(res, open(f"{ROOT}/config/timings.json","w"), indent=1)
asyncio.run(main())

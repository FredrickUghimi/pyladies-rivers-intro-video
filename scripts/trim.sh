#!/usr/bin/env bash
# Remux to exactly 90.0s: AAC priming/padding can leave the audio stream ~0.05s long. Stream copy only; no re-encode, no time-stretch.
set -euo pipefail
ffmpeg -y -loglevel error -i "$1" -t 90 -c copy -movflags +faststart "$2"
rm -f "$1"

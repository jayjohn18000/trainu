#!/usr/bin/env bash
set -euo pipefail
grep -RIn "(sk-|gho_|ghs_|ghp_|xoxp-|xoxb-|AIzaSy|AKIA)" . && {
  echo "Forbidden token pattern detected"; exit 1; }
echo "OK"

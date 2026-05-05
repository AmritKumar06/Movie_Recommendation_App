"""
debug_poster.py - Standalone poster fetch diagnostic
Run this from the backend/ directory to test poster fetching without the full server.
"""
import os, requests
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "").strip()
TMDB_BASE_URL = "https://api.themoviedb.org/3"
POSTER_BASE = "https://image.tmdb.org/t/p/w500"

print(f"TMDB_API_KEY loaded: {'YES -> ' + TMDB_API_KEY[:6] + '...' if TMDB_API_KEY else 'NO - key is empty!'}")
print()

# Test 1: raw TMDB movie lookup for "Inception" (TMDB id = 27205)
test_id = 27205
url = f"{TMDB_BASE_URL}/movie/{test_id}"
try:
    resp = requests.get(url, params={"api_key": TMDB_API_KEY}, timeout=8)
    print(f"TMDB movie lookup status: {resp.status_code}")
    if resp.ok:
        data = resp.json()
        path = data.get("poster_path")
        full_url = f"{POSTER_BASE}{path}" if path else None
        print(f"Movie title   : {data.get('title')}")
        print(f"Poster path   : {path}")
        print(f"Full poster URL: {full_url}")
    else:
        print(f"Error: {resp.text[:300]}")
except Exception as e:
    print(f"Connection failed: {e}")
    print("=> TMDB might be blocked on your network. Try a VPN.")

"""
app.py - Flask REST API
========================
Exposes the movie recommendation system as a REST API.

Endpoints
---------
GET /health                → service health check
GET /movies                → paginated list of all movies
GET /search?q=<query>      → autocomplete search
GET /recommend/<title>     → top-5 recommendations for a movie
GET /poster/<movie_id>     → proxy TMDB poster URL
"""

import os
import requests

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from recommendation import (
    get_all_movies,
    get_recommendations,
    search_movies,
    is_ready,
)

# ─────────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────────
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow all origins (flask-cors 6.x compatible)

TVDB_API_KEY = os.getenv("TVDB_API_KEY", "").strip()
TVDB_TOKEN = None


# ─────────────────────────────────────────────────
# Helper utilities
# ─────────────────────────────────────────────────

def _get_tvdb_token():
    """Authenticate with TVDB to get a bearer token."""
    global TVDB_TOKEN
    if not TVDB_API_KEY:
        return None
    try:
        url = "https://api4.thetvdb.com/v4/login"
        resp = requests.post(url, json={"apikey": TVDB_API_KEY}, timeout=5)
        if resp.ok:
            TVDB_TOKEN = resp.json().get("data", {}).get("token")
    except requests.RequestException:
        pass
    return TVDB_TOKEN


def _fetch_poster(movie_title: str) -> str | None:
    """Fetch poster URL from TVDB API for a given movie title."""
    if not TVDB_API_KEY:
        return None
        
    global TVDB_TOKEN
    if not TVDB_TOKEN:
        _get_tvdb_token()
        
    if not TVDB_TOKEN:
        return None

    try:
        url = "https://api4.thetvdb.com/v4/search"
        headers = {"Authorization": f"Bearer {TVDB_TOKEN}"}
        params = {"query": movie_title, "type": "movie"}
        
        resp = requests.get(url, params=params, headers=headers, timeout=5)
        
        # If token expired, refresh and retry once
        if resp.status_code == 401:
            _get_tvdb_token()
            headers = {"Authorization": f"Bearer {TVDB_TOKEN}"}
            resp = requests.get(url, params=params, headers=headers, timeout=5)
            
        if resp.ok:
            data = resp.json().get("data", [])
            if data and len(data) > 0:
                return data[0].get("image_url")
    except requests.RequestException:
        pass
    return None


def _error(message: str, status: int = 400):
    return jsonify({"success": False, "error": message}), status


# ─────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "success": True,
        "status":  "healthy",
        "model_loaded": is_ready(),
        "tvdb_api": bool(TVDB_API_KEY),
    })


@app.route("/movies", methods=["GET"])
def movies():
    """
    Return all movie titles for search/autocomplete.
    Supports pagination via ?page=1&limit=50.
    """
    page  = max(int(request.args.get("page",  1)), 1)
    limit = min(int(request.args.get("limit", 100)), 500)

    all_movies = get_all_movies()
    total      = len(all_movies)
    start      = (page - 1) * limit
    end        = start + limit

    return jsonify({
        "success": True,
        "total":   total,
        "page":    page,
        "limit":   limit,
        "movies":  all_movies[start:end],
    })


@app.route("/search", methods=["GET"])
def search():
    """
    Autocomplete endpoint.
    ?q=<query>&limit=<int>
    """
    query = request.args.get("q", "").strip()
    limit = min(int(request.args.get("limit", 10)), 20)

    if not query:
        return _error("Query parameter 'q' is required.")

    results = search_movies(query, limit=limit)
    return jsonify({"success": True, "results": results})


@app.route("/recommend/<path:movie_title>", methods=["GET"])
def recommend(movie_title: str):
    """
    Return top-5 movie recommendations for a given title.
    Optionally fetches TVDB posters when TVDB_API_KEY is set.
    """
    n = min(int(request.args.get("n", 5)), 10)

    try:
        recommendations = get_recommendations(movie_title, n=n)
    except ValueError as exc:
        return _error(str(exc), 404)
    except RuntimeError as exc:
        return _error(str(exc), 503)

    # Enrich with poster URLs if TVDB key is available
    if TVDB_API_KEY:
        for movie in recommendations:
            movie["poster_url"] = _fetch_poster(movie["title"])
    else:
        for movie in recommendations:
            movie["poster_url"] = None

    return jsonify({
        "success": True,
        "query":   movie_title,
        "count":   len(recommendations),
        "recommendations": recommendations,
    })


@app.route("/poster/<path:movie_title>", methods=["GET"])
def poster(movie_title: str):
    """Fetch poster URL for a given movie title."""
    url = _fetch_poster(movie_title)
    if url:
        return jsonify({"success": True, "poster_url": url})
    return _error("Poster not available.", 404)


# ─────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
# Trigger reload


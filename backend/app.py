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

TMDB_API_KEY  = os.getenv("TMDB_API_KEY", "").strip()
TMDB_BASE_URL = "https://api.themoviedb.org/3"
POSTER_BASE   = "https://image.tmdb.org/t/p/w500"


# ─────────────────────────────────────────────────
# Helper utilities
# ─────────────────────────────────────────────────

def _fetch_poster(movie_id: int) -> str | None:
    """Fetch poster path from TMDB for a given movie_id."""
    if not TMDB_API_KEY:
        return None
    try:
        url = f"{TMDB_BASE_URL}/movie/{movie_id}"
        params = {"api_key": TMDB_API_KEY}
        resp = requests.get(url, params=params, timeout=5)
        if resp.ok:
            path = resp.json().get("poster_path")
            return f"{POSTER_BASE}{path}" if path else None
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
        "tmdb_api": bool(TMDB_API_KEY),
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
    Optionally fetches TMDB posters when TMDB_API_KEY is set.
    """
    n = min(int(request.args.get("n", 5)), 10)

    try:
        recommendations = get_recommendations(movie_title, n=n)
    except ValueError as exc:
        return _error(str(exc), 404)
    except RuntimeError as exc:
        return _error(str(exc), 503)

    # Enrich with poster URLs if TMDB key is available
    if TMDB_API_KEY:
        for movie in recommendations:
            movie["poster_url"] = _fetch_poster(movie["id"])
    else:
        for movie in recommendations:
            movie["poster_url"] = None

    return jsonify({
        "success": True,
        "query":   movie_title,
        "count":   len(recommendations),
        "recommendations": recommendations,
    })


@app.route("/poster/<int:movie_id>", methods=["GET"])
def poster(movie_id: int):
    """Fetch poster URL for a given TMDB movie_id."""
    url = _fetch_poster(movie_id)
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

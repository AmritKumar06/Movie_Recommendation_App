"""
recommendation.py - Recommendation Engine
==========================================
Provides the `get_recommendations` function used by the Flask API.
Loads pre-built pickle artifacts (model.pkl, movies.pkl, vectors.pkl)
from the backend directory and returns the top-N most similar movies.
"""

import os
import pickle

import numpy as np
import pandas as pd

# ─────────────────────────────────────────────────
# Paths to pre-built pickle artifacts
# ─────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "model.pkl")
MOVIES_PATH = os.path.join(BASE_DIR, "movies.pkl")
VECTORS_PATH = os.path.join(BASE_DIR, "vectors.pkl")


def _load_artifacts():
    """Load KNN model, movies dataframe, and vectors from disk."""
    if not all(os.path.exists(p) for p in [MODEL_PATH, MOVIES_PATH, VECTORS_PATH]):
        raise FileNotFoundError(
            "Model artifacts not found. Run the preprocessing script first:\n"
            "  python utils/preprocess.py"
        )

    with open(MODEL_PATH, "rb") as f:
        knn = pickle.load(f)
    with open(MOVIES_PATH, "rb") as f:
        movies: pd.DataFrame = pickle.load(f)
    with open(VECTORS_PATH, "rb") as f:
        vectors = pickle.load(f)

    return knn, movies, vectors


# Load once at module import time so the Flask app doesn't re-read on every request
try:
    _knn, _movies, _vectors = _load_artifacts()
    MODEL_LOADED = True
    print(f"[OK] Recommendation engine loaded - {len(_movies)} movies available")
except FileNotFoundError as _err:
    MODEL_LOADED = False
    _knn = _movies = _vectors = None
    print(f"[WARN] {_err}")


# ─────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────

def is_ready() -> bool:
    """Return True if the model artifacts were loaded successfully."""
    return MODEL_LOADED


def get_all_movies() -> list[dict]:
    """Return a lightweight list of all movies (id + title) for search/autocomplete."""
    if not MODEL_LOADED:
        return []
    return _movies[["id", "title"]].sort_values("title").to_dict(orient="records")


def get_recommendations(movie_title: str, n: int = 5) -> list[dict]:
    """
    Return the top-N movies most similar to *movie_title*.

    Parameters
    ----------
    movie_title : str
        Exact (case-insensitive) title to look up.
    n : int
        Number of recommendations to return (default 5).

    Returns
    -------
    list[dict]
        Each dict contains: id, title, genres_str, overview_str,
        vote_average, vote_count, release_date, popularity.

    Raises
    ------
    ValueError
        If the movie is not found in the dataset.
    RuntimeError
        If the ML artifacts have not been loaded.
    """
    if not MODEL_LOADED:
        raise RuntimeError("ML model is not loaded. Run preprocessing first.")

    # Case-insensitive lookup
    mask = _movies["title"].str.lower() == movie_title.strip().lower()
    if not mask.any():
        raise ValueError(f"Movie '{movie_title}' not found in the dataset.")

    idx = _movies.index[mask][0]
    query_vector = _vectors[idx].reshape(1, -1)

    # Ask for n+1 neighbours because the movie itself will be one of them
    distances, indices = _knn.kneighbors(query_vector, n_neighbors=n + 1)

    # Filter out the queried movie
    recommended_indices = [i for i in indices[0] if i != idx][:n]

    results = []
    for i in recommended_indices:
        row = _movies.iloc[i]
        # genres may be a list or a string depending on the column
        genres_val = row.get("genres_str", "")
        if genres_val is None or (isinstance(genres_val, float)):
            genres_val = ""

        overview_val = row.get("overview_str", "")
        if overview_val is None or (isinstance(overview_val, float)):
            overview_val = ""

        results.append({
            "id":           int(row["id"]),
            "title":        str(row["title"]),
            "genres":       str(genres_val),
            "overview":     str(overview_val),
            "vote_average": round(float(row["vote_average"]), 1),
            "vote_count":   int(row["vote_count"]),
            "release_date": str(row.get("release_date", "")),
            "popularity":   round(float(row.get("popularity", 0)), 2),
        })

    return results


def search_movies(query: str, limit: int = 10) -> list[dict]:
    """
    Simple substring search for autocomplete.

    Returns up to *limit* movies whose title contains *query* (case-insensitive).
    """
    if not MODEL_LOADED or not query.strip():
        return []

    mask = _movies["title"].str.lower().str.contains(query.strip().lower(), na=False)
    subset = _movies[mask][["id", "title"]].head(limit)
    return subset.to_dict(orient="records")

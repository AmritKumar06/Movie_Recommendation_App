"""
preprocess.py - ML Preprocessing Pipeline
==========================================
This module handles all data preprocessing steps for the
content-based movie recommendation system using TMDB dataset.
"""

import ast
import os
import pickle
import sys

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.neighbors import NearestNeighbors


# ─────────────────────────────────────────────────
# Helper functions to parse JSON-like string columns
# ─────────────────────────────────────────────────

def parse_list(obj):
    """Convert a JSON-like string to a list of 'name' values."""
    try:
        return [item["name"] for item in ast.literal_eval(obj)]
    except (ValueError, TypeError, KeyError):
        return []


def get_top_cast(obj, n=3):
    """Return the top-N cast members from a JSON-like string."""
    try:
        return [item["name"] for item in ast.literal_eval(obj)[:n]]
    except (ValueError, TypeError, KeyError):
        return []


def get_director(obj):
    """Extract the director's name from the crew JSON-like string."""
    try:
        for item in ast.literal_eval(obj):
            if item.get("job") == "Director":
                return [item["name"]]
        return []
    except (ValueError, TypeError):
        return []


def collapse(lst):
    """Remove spaces within each tag element to avoid token splitting."""
    return [item.replace(" ", "") for item in lst]


# ─────────────────────────────────────────────────
# Core preprocessing function
# ─────────────────────────────────────────────────

def preprocess(movies_path: str, credits_path: str, output_dir: str = ".") -> dict:
    """
    Full ML preprocessing pipeline:
      1. Load & merge datasets
      2. Select & clean columns
      3. Parse structured columns
      4. Build 'tags' feature
      5. Vectorise with CountVectorizer
      6. Fit KNN model (cosine distance)
      7. Persist artifacts with pickle

    Returns a dict with the processed dataframe and the trained model.
    """

    print("[1/9] Loading datasets ...")
    movies_df  = pd.read_csv(movies_path)
    credits_df = pd.read_csv(credits_path)

    # --- 1. Merge on movie id & title ----------------------------------------
    print("[2/9] Merging datasets ...")
    credits_df.rename(columns={"movie_id": "id"}, inplace=True)
    df = movies_df.merge(credits_df, on=["id", "title"])

    # --- 2. Select relevant columns ------------------------------------------
    cols = ["id", "title", "overview", "genres", "keywords", "cast", "crew",
            "vote_average", "vote_count", "release_date", "popularity"]
    df = df[cols].copy()

    # --- 3. Drop nulls and duplicates (pandas 3.0 CoW-safe) ------------------
    df = df.dropna()
    df = df.drop_duplicates(subset="title")
    df = df.reset_index(drop=True)

    print(f"[3/9] Dataset ready: {len(df)} movies")

    # --- 4. Parse structured columns -----------------------------------------
    print("[4/9] Parsing genres, keywords, cast, crew ...")
    df["genres"]   = df["genres"].apply(parse_list)
    df["keywords"] = df["keywords"].apply(parse_list)
    df["cast"]     = df["cast"].apply(get_top_cast)
    df["crew"]     = df["crew"].apply(get_director)
    df["overview"] = df["overview"].apply(lambda x: x.split())

    # --- 5. Remove spaces & build tag string ---------------------------------
    print("[5/9] Building tags feature ...")
    for col in ["genres", "keywords", "cast", "crew"]:
        df[col] = df[col].apply(collapse)

    df["tags"] = (
        df["overview"] +
        df["genres"]   +
        df["keywords"] +
        df["cast"]     +
        df["crew"]
    )
    df["tags"] = df["tags"].apply(lambda x: " ".join(x).lower())

    # --- 6. Build a lean movies table for the API ----------------------------
    print("[6/9] Building movies table ...")
    movies_table = df[["id", "title", "tags", "vote_average",
                        "vote_count", "release_date", "popularity"]].copy()

    # Add string versions for JSON serialisation (pandas 3.0 CoW-safe via .values)
    movies_table["genres_str"]   = df["genres"].apply(
        lambda lst: ", ".join([g.title() for g in lst])
    ).values
    movies_table["overview_str"] = df["overview"].apply(
        lambda w: " ".join(w)
    ).values
    movies_table["genres"]       = df["genres"].values

    # --- 7. Vectorise ---------------------------------------------------------
    print("[7/9] Vectorising tags (CountVectorizer, max_features=5000) ...")
    cv = CountVectorizer(max_features=5000, stop_words="english")
    vectors = cv.fit_transform(movies_table["tags"]).toarray()

    # --- 8. Fit KNN (cosine distance, brute-force) ---------------------------
    print("[8/9] Training KNN model (cosine, brute-force) ...")
    knn = NearestNeighbors(metric="cosine", algorithm="brute", n_neighbors=11)
    knn.fit(vectors)

    # --- 9. Persist artifacts -------------------------------------------------
    print("[9/9] Saving pickle artifacts ...")
    os.makedirs(output_dir, exist_ok=True)
    model_path       = os.path.join(output_dir, "model.pkl")
    movies_path_out  = os.path.join(output_dir, "movies.pkl")
    vectors_path     = os.path.join(output_dir, "vectors.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(knn, f)
    with open(movies_path_out, "wb") as f:
        pickle.dump(movies_table, f)
    with open(vectors_path, "wb") as f:
        pickle.dump(vectors, f)

    print(f"[DONE] Artifacts saved to: {output_dir}")
    print("[DONE] Preprocessing complete!")

    return {
        "movies":  movies_table,
        "knn":     knn,
        "vectors": vectors,
    }


if __name__ == "__main__":
    # Force UTF-8 output on Windows so progress prints don't fail
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    base        = os.path.dirname(__file__)
    dataset_dir = os.path.join(base, "..", "dataset")
    output_dir  = os.path.join(base, "..")

    preprocess(
        movies_path  = os.path.join(dataset_dir, "tmdb_5000_movies.csv"),
        credits_path = os.path.join(dataset_dir, "tmdb_5000_credits.csv"),
        output_dir   = output_dir,
    )

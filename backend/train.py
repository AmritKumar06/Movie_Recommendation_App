"""
train.py - Standalone training script
======================================
Run this script once to build and save the ML artifacts.

Usage (from the backend/ directory):
    python train.py

The script expects the TMDB CSV files inside:
    backend/dataset/tmdb_5000_movies.csv
    backend/dataset/tmdb_5000_credits.csv

It writes the following pickle files to backend/:
    model.pkl
    movies.pkl
    vectors.pkl
"""

import os
import sys

# Force UTF-8 console output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Allow importing utils.preprocess when running from backend/
sys.path.insert(0, os.path.dirname(__file__))

from utils.preprocess import preprocess

if __name__ == "__main__":
    base_dir    = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "dataset")
    output_dir  = base_dir   # write pkl files alongside app.py

    movies_path  = os.path.join(dataset_dir, "tmdb_5000_movies.csv")
    credits_path = os.path.join(dataset_dir, "tmdb_5000_credits.csv")

    if not os.path.exists(movies_path) or not os.path.exists(credits_path):
        print("[ERROR] Dataset files not found!")
        print(f"        Expected: {movies_path}")
        print(f"        Expected: {credits_path}")
        print()
        print("Download from: https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata")
        sys.exit(1)

    preprocess(movies_path=movies_path, credits_path=credits_path, output_dir=output_dir)

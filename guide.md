# CineMatch - Technical Architecture & Developer Guide

This guide provides a comprehensive breakdown of the CineMatch project architecture, explaining every file, folder, and major function in the codebase. It is designed to help developers understand the complete flow of data from the initial dataset to the user interface.

---

## 🏗️ High-Level Architecture

CineMatch is a full-stack web application consisting of two main independent systems:
1. **The Backend (Flask + Python ML Pipeline)**: Responsible for ingesting the raw CSV data, cleaning it, building mathematical vectors representing the movies, computing nearest neighbors, and serving the results over a REST API.
2. **The Frontend (React + Vite + Tailwind)**: Responsible for the user interface, state management, sending HTTP requests to the backend, and displaying dynamic components with animations.

---

## ⚙️ Backend Structure (`/backend`)

The backend is a Python application that uses `pandas` for data manipulation, `scikit-learn` for machine learning, and `Flask` as the web server.

### 1. `utils/preprocess.py`
**Purpose**: This is the heart of the Machine Learning pipeline. It cleans and transforms raw TMDB CSV files into a machine-understandable mathematical model.

**Key Functions**:
- `parse_list(obj)`: Extracts the `"name"` attribute from stringified JSON lists (e.g., converting `'[{"name": "Action"}, {"name": "Sci-Fi"}]'` into `['Action', 'Sci-Fi']`).
- `get_top_cast(obj, n=3)`: Similar to `parse_list`, but specifically limits the extraction to the top 3 actors in a movie to prevent minor cast members from skewing recommendations.
- `get_director(obj)`: Iterates through the movie's crew JSON to find and extract the `"Director"`.
- `collapse(lst)`: Removes spaces from names/genres (e.g., `"Science Fiction"` becomes `"ScienceFiction"`). This prevents the AI from confusing "Science Fiction" and "Science" as the same token.
- `preprocess(movies_path, credits_path, output_dir)`: 
  - **Step 1-3**: Loads and merges the `movies` and `credits` dataframes, then removes nulls/duplicates.
  - **Step 4-5**: Applies the parsing functions above to build a single string column called `"tags"` that contains all keywords, cast, genres, and overviews.
  - **Step 6**: Creates a lean `movies_table` (with stringified genres and overviews) to be returned to the frontend.
  - **Step 7**: Uses `CountVectorizer(max_features=5000, stop_words="english")` to convert the `"tags"` column into a matrix of numbers (5000-dimensional vectors).
  - **Step 8**: Fits a `NearestNeighbors` model using the `cosine` distance metric.
  - **Step 9**: Exports the `movies_table`, the `vectors`, and the `knn` model as binary `.pkl` files using the `pickle` library so they can be loaded instantly later.

### 2. `train.py`
**Purpose**: A simple execution script that developers run manually. 
**How it works**: It imports the `preprocess()` function from `utils/preprocess.py`, locates the `dataset/tmdb_5000_movies.csv` files, and runs the entire training process. Running this is the first step when setting up the project.

### 3. `recommendation.py`
**Purpose**: This module serves as the bridge between the Flask API and the pre-computed machine learning artifacts (`.pkl` files).

**Key Functions**:
- `_load_artifacts()`: Runs immediately when the file is imported. It deserializes `model.pkl`, `movies.pkl`, and `vectors.pkl` from disk into memory.
- `get_all_movies()`: Returns a lightweight dictionary containing only the IDs and Titles of all 4,800 movies. This is used by the frontend to build the search bar autocomplete.
- `get_recommendations(movie_title, n=5)`:
  - Finds the exact row index of the requested `movie_title`.
  - Retrieves the movie's 5000-dimensional vector.
  - Passes the vector into the `_knn.kneighbors()` model to find the `n` closest vectors (movies).
  - Excludes the movie itself from the results, and returns a formatted JSON array containing the titles, genres, ratings, and overviews of the recommendations.
- `search_movies(query, limit)`: A fast text-based substring search to power the frontend autocomplete dropdown.

### 4. `app.py`
**Purpose**: The Flask web server. It handles incoming HTTP requests from the frontend, routes them to the correct functions in `recommendation.py`, and returns JSON responses.

**Key Endpoints**:
- `GET /health`: Returns `{ status: "healthy" }` if the API and models are loaded properly.
- `GET /movies`: Paginated endpoint to fetch the full catalogue of movies.
- `GET /search?q=...`: Connects to `search_movies()` to provide live autocomplete data.
- `GET /recommend/<movie_title>`: Connects to `get_recommendations()`. If a `TVDB_API_KEY` is present in your `.env` file, this endpoint also reaches out to the live TVDB API to fetch the official poster image URL for each recommended movie.

---

## 💻 Frontend Structure (`/frontend`)

The frontend is a modern Single Page Application (SPA) built with React.

### 1. Root Setup
- `index.html`: The HTML shell containing the root `<div>` and SEO metadata.
- `src/main.jsx`: The React entry point. It wraps the app in `<BrowserRouter>` for routing and `<Toaster>` for global pop-up notifications.
- `src/App.jsx`: The global layout controller. It places the `<Navbar>` at the top, the `<Footer>` at the bottom, and uses `<Routes>` to conditionally render the correct page in the middle. It wraps pages in `<AnimatePresence>` to allow fade-in/fade-out animations during navigation.

### 2. Global Services & Hooks
- `src/services/api.js`: The Axios wrapper. Instead of writing `fetch()` calls in every component, this file defines reusable API functions (`fetchRecommendations()`, `searchMovies()`). It also intercepts errors and formats them cleanly.
- `src/hooks/useRecommendations.js`: A custom React Hook. It encapsulates the complex state (`loading`, `error`, `recommendations`, `searched`) and logic required to fetch recommendations. By moving this out of the UI components, the code remains extremely clean and testable.

### 3. Pages (`src/pages/`)
- `Home.jsx`: The landing page. Displays the animated `HeroSection` and a grid of reasons why the app is great, along with quick links to popular movie searches.
- `Discover.jsx`: The core interactive page. It holds the `SearchBar` and passes the resulting data to the `RecommendationGrid`. It also checks the URL parameters on mount so users can share direct links like `localhost:5173/discover?q=Avatar`.
- `About.jsx`: A static, educational page outlining the Machine Learning algorithms and tech stack used in the project.
- `NotFound.jsx`: A 404 fallback page if the user navigates to an invalid URL.

### 4. Components (`src/components/`)
- `Navbar.jsx` / `Footer.jsx`: Standard navigation elements. The Navbar includes a mobile hamburger menu and scroll-detection to add a glass-blur effect when scrolling down.
- `SearchBar.jsx`: A highly complex component. As the user types, it "debounces" their input (waits 300ms after they stop typing) and calls the backend `/search` API to fetch autocomplete suggestions. It supports keyboard navigation (Arrow Up, Arrow Down, Enter) to select dropdown items.
- `RecommendationGrid.jsx`: A layout controller. It looks at the state of the app and decides whether to render:
  - A grid of `SkeletonCard`s (if loading)
  - An error message (if the API fails)
  - An empty state message (if no movies were found)
  - A grid of `MovieCard`s (if successful)
- `MovieCard.jsx`: The beautiful individual movie display. It handles its own complex logic, such as showing a skeleton loader while the poster image is downloading, calculating star ratings, and applying a dark gradient overlay on hover.
- `SkeletonCard.jsx`: A CSS-animated placeholder shape that mimics the layout of a `MovieCard` to prevent layout shift while data is loading.

### 5. Styling & Config
- `src/index.css`: Contains the foundational CSS. It defines CSS custom properties (variables) for the dark mode color palette, custom glassmorphism utility classes (`.glass-card`), button styles, and complex CSS keyframe animations (like the shimmer effect).
- `tailwind.config.js`: Extends the default Tailwind theme to recognize the custom colors, fonts (`Inter`, `Outfit`), and animations defined in `index.css`.
- `vite.config.js`: Instructs Vite on how to build the app. Critically, it includes a `proxy` configuration: any request the frontend makes to `/api` is secretly forwarded to `http://localhost:5000` during development, bypassing complex CORS issues.

---

## 🔄 The Complete Request Lifecycle

If you type "Inception" into the Discover page and press Enter, here is exactly what happens:

1. **Frontend UI**: `SearchBar.jsx` registers the submit event. It calls `onSearch("Inception")`.
2. **Frontend State**: `Discover.jsx` receives the event and passes it to the `getRecommendations("Inception")` function inside the `useRecommendations` hook. The hook sets `loading` to `True`.
3. **Frontend API**: `api.js` fires a `GET` request to `/api/recommend/Inception?n=5`. Vite proxies this to `localhost:5000/recommend/Inception?n=5`.
4. **Backend Router**: `app.py` catches the request in the `@app.route("/recommend/<path:movie_title>")` block.
5. **Backend Engine**: `recommendation.py` intercepts "Inception". It finds Inception's vector representation in memory, asks the KNN model for the 5 closest vectors, maps those vectors back to movie dictionaries, and returns them.
6. **Backend Enhancer**: `app.py` takes those 5 movie dictionaries and makes 5 quick external API calls to the TVDB servers to grab the absolute URL of each movie's poster image. It attaches these URLs to the dictionaries and returns JSON to the frontend.
7. **Frontend State**: The `useRecommendations` hook receives the JSON. It sets `loading` to `False` and populates the `recommendations` array.
8. **Frontend UI**: `RecommendationGrid.jsx` sees `loading` is False and `recommendations` has data. It maps over the array, rendering 5 `MovieCard.jsx` components, which animate onto the screen one by one.

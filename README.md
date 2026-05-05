# CineMatch 🎬 - AI-Powered Movie Recommendation System

An advanced, production-ready full-stack web application that recommends similar movies using Content-Based Filtering with K-Nearest Neighbors (KNN) and Cosine Similarity. 

Built with a **Flask/Python** machine learning backend and a modern, responsive **React (Vite) & Tailwind CSS** frontend.

---

## 🌟 Features

- **Content-Based AI Recommendations**: Uses genres, cast, keywords, and storylines to find mathematically similar movies.
- **Lightning Fast Search**: Autocomplete search functionality optimized for speed.
- **Modern UI/UX**: Dark mode, Netflix-inspired responsive design with smooth Framer Motion animations.
- **Dynamic Posters**: Integrates with TMDB API to fetch live movie posters.
- **Comprehensive Dataset**: Powered by the Kaggle TMDB 5000 Movies Dataset.
- **Full-Stack Architecture**: Clean separation between ML REST API backend and React frontend.

---

## 📸 Screenshots

*(Add screenshots of your running application here)*
- **Home Page**: Hero section with dynamic gradient background.
- **Discover Page**: Search bar with dropdown autocomplete and recommendation grid.
- **About Page**: Explanation of the ML pipeline.

---

## 🛠️ Technologies Used

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** (Styling & Design System)
- **Framer Motion** (Animations)
- **Axios** (API Calls)
- **React Router Dom** (Navigation)

### Backend
- **Python 3.10+**
- **Flask & Flask-CORS** (RESTful API)
- **Pandas & NumPy** (Data Processing)
- **scikit-learn** (Machine Learning / KNN)
- **Pickle** (Model Serialization)

---

## 🧠 How the Recommendation System Works

1. **Data Preprocessing**: We load the TMDB 5000 Movies and Credits datasets.
2. **Feature Engineering**: Relevant features (genres, keywords, top cast, director, and overview) are extracted and combined into a single `"tags"` string for each movie.
3. **Text Vectorization**: A `CountVectorizer` converts these text tags into mathematical vectors (max 5000 features, excluding English stop-words).
4. **K-Nearest Neighbors (KNN)**: We fit a `NearestNeighbors` model using the **cosine distance** metric. Cosine similarity measures the angle between two vectors, effectively finding movies that share the most keywords and themes.
5. **Real-time API**: When a user queries a movie, the Flask API calculates the nearest neighbors from the pre-computed vectors and returns the top 5 matches instantly!

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- [TVDB API Key](https://thetvdb.com/api-information) (Free)
- TMDB 5000 Dataset CSV files (Download from [Kaggle](https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata) and place inside `backend/dataset/`)

### 1. Backend Setup (Flask & ML)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Place the dataset files `tmdb_5000_movies.csv` and `tmdb_5000_credits.csv` into `backend/dataset/`.
5. Run the Machine Learning preprocessing script to train the model and generate pickle artifacts:
   ```bash
   python train.py
   ```
   *This will create `model.pkl`, `movies.pkl`, and `vectors.pkl`.*
6. Set up your environment variables:
   - Copy `.env.example` to `.env`.
   - Add your TVDB API Key: `TVDB_API_KEY=your_key_here`
7. Start the Flask development server:
   ```bash
   python app.py
   ```

### 2. Frontend Setup (React)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Ensure your backend is running on port 5000.
   - Vite automatically proxies `/api` to `http://localhost:5000` during development (see `vite.config.js`).
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🌍 Deployment

### Deploying the Backend (Render / Railway / Heroku)
1. Ensure `gunicorn` is in `requirements.txt`.
2. Push your code to GitHub. Note: **Do not** push the `.pkl` files or the large `.csv` datasets if they exceed GitHub limits.
3. On your hosting provider, set the Build Command:
   ```bash
   pip install -r requirements.txt && python train.py
   ```
4. Set the Start Command:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:$PORT app:app
   ```
5. Add the `TVDB_API_KEY` to your host's environment variables.

### Deploying the Frontend (Vercel / Netlify)
1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Set the Root Directory to `frontend`.
4. Set the Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Add the Environment Variable `VITE_API_BASE_URL` pointing to your deployed backend URL (e.g., `https://my-flask-backend.onrender.com`).

---

## 🔮 Future Improvements

- [ ] **Collaborative Filtering**: Add user accounts and recommend movies based on user viewing history.
- [ ] **Advanced Search**: Filter by release year, genre, and minimum rating.
- [ ] **Trailers**: Integrate YouTube API to show movie trailers on click.
- [ ] **Pagination**: Load more than 5 recommendations dynamically.

---

**Built with ❤️ for movie lovers.**

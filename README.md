# FoundryMind AI

FoundryMind AI is now structured for cloud deployment with:

- A Next.js frontend in `frontend/` for Vercel
- A FastAPI backend in `backend/` for Python ML inference
- Existing ML training/inference modules in `src/`

## Architecture

- Frontend (Node.js/Next.js): UI for casting optimization, factory prediction, and LLM assistant
- Backend (Python/FastAPI): exposes API endpoints and loads trained models
- Models: `models/casting_model.pkl` and `models/factory_model.pkl`

## API Endpoints

- `GET /health`
- `POST /api/casting/optimize`
- `POST /api/factory/predict`
- `POST /api/assistant/explain`

## Local Development

### 1) Prepare Python backend

Use your preferred Python environment (you typically use conda `ml`).

Install dependencies:

```bash
pip install -r requirements.txt
```

Train models if needed:

```bash
python src/casting/train.py
python src/factory/train.py
```

Run backend:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Prepare frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` and calls backend from `NEXT_PUBLIC_API_BASE_URL`.

Use Node 22 for frontend commands:

```bash
cd frontend
nvm use 22
npm run build
```

If Node 24 is active, Next build may fail with `SIGBUS` on some Linux setups.

## Deployment

### Deploy backend (Render)

1. Push repository to GitHub.
2. Create a new Render Web Service using this repository.
3. Render will use `render.yaml` and `Dockerfile` automatically.
4. Set environment variables:
   - `GROQ_API_KEY`
   - `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
5. Ensure model files exist in your deployed environment.

### Deploy frontend (Vercel)

1. Import repository into Vercel.
2. Set root directory to `frontend`.
3. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL=https://your-render-backend.onrender.com`
4. Deploy.

Vercel project settings:
- Root directory: `frontend`
- Node.js version: `22.x`

## Notes

- Streamlit app is kept in `app/streamlit_app.py` for reference, but production UI is now Next.js.
- If you want fully self-contained cloud inference without Python hosting, the ML models would need conversion to a JS-compatible runtime.
- Frontend uses `.nvmrc` and `engines.node` to pin Node 22 behavior.

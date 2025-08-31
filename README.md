# Church Chatbot Grader

Evaluate the accuracy of pastors.ai chatbot responses against ground truth answers from church websites, powered by OpenAI and Playwright.

This project includes:

- **Backend (FastAPI + Playwright + OpenAI)**: Scrapes pastors.ai chatbots, fetches ground truth from church websites, and grades responses automatically.
- **Frontend (Next.js)**: Interactive dashboard to select churches, run evaluations, and visualize results.
- **Deployment**:
  - Backend hosted on **Render** (Dockerized)
  - Frontend hosted on **Vercel**

---

## 🚀 Features

- Query pastors.ai chatbots directly in headless Chromium.
- Extract ground truth service times from church websites via GPT as instructed.
- Grade chatbot answers (A–F) against ground truth with justification.
- UI with charts showing distribution of grades (A–F).
- Filterable evaluation results (by grade, question, or church).

---

## 🏗 Architecture

```
church-grader/
├── backend/                # FastAPI backend
│   ├── api.py             # API endpoints
│   ├── main.py            # Batch evaluation logic
│   ├── clean_data.py      # Preprocess input CSV
│   ├── requirements.txt   # Backend dependencies
│   └── Dockerfile         # Render deploy
├── frontend/              # Next.js frontend
│   ├── pages/            # UI routes
│   ├── components/       # React components
│   └── package.json
└── data/
    ├── churches.csv
    ├── churches_cleaned.csv
    └── test_churches.csv
```

---

## ⚙️ Backend Setup (local)

1. Clone the repo:

   ```bash
   git clone https://github.com/ebrivera/gloo_trial.git
   cd gloo_trial/church-grader/backend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   python -m playwright install chromium
   ```

3. Set your OpenAI key:

   ```bash
   export OPENAI_API_KEY=sk-your-key
   ```

4. Run locally:
   ```bash
   uvicorn api:app --reload
   ```

---

## 🎨 Frontend Setup (local)

1. Move into frontend:

   ```bash
   cd gloo_trial/church-grader/frontend
   npm install
   ```

2. Add `.env.local`:

   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

3. Run dev server:

   ```bash
   npm run dev
   ```

4. Visit:
   ```
   http://localhost:3000
   ```

---

## ☁️ Deployment

- **Backend**: Dockerfile uses Playwright's Python base image to include browsers. Deploy to Render with root dir set to `church-grader/backend`.
- **Frontend**: Deployed to Vercel. Set environment variable:
  ```
  NEXT_PUBLIC_BACKEND_URL=https://ernesto-trial-gloo-joe.onrender.com
  ```

---

## 📊 Output Format (from backend)

| Field           | Description                                  |
| --------------- | -------------------------------------------- |
| `chatbot_url`   | pastors.ai chatbot URL                       |
| `website_url`   | Church site URL                              |
| `bot_answer`    | Response from chatbot                        |
| `gpt_answer`    | Ground truth from website text               |
| `grade`         | A–F, N/A if no website                       |
| `soft_match`    | Boolean, semantic similarity despite wording |
| `justification` | Short explanation from grader                |

---

## 📝 Notes

- Default evaluation question: **"What time is service?"** (change in `main.py`).
- Rate-limited with 0.5s delay between requests to avoid throttling.
- Frontend auto-refreshes results from backend API.

# Deployment Guide

## Deploying to Vercel

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:

   ```bash
   git add .
   git commit -m "Add church chatbot grader dashboard"
   git push origin main
   ```

2. **Ensure your repository structure**:
   ```
   church-grader/
   ├── src/                    # Next.js frontend
   ├── backend/                # Python backend (won't deploy to Vercel)
   ├── package.json
   ├── vercel.json
   └── README.md
   ```

### Step 2: Deploy Backend (Choose One Option)

#### Option A: Deploy Backend to Railway (Recommended)

1. **Go to [Railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Create a new project** and select your repository
4. **Set the root directory** to `church-grader/backend`
5. **Add environment variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
6. **Deploy** - Railway will automatically detect it's a Python app

#### Option B: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)**
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Set build command**: `pip install -r requirements.txt`
5. **Set start command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`
6. **Add environment variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
7. **Deploy**

#### Option C: Deploy Backend to Heroku

1. **Install Heroku CLI**
2. **Create a new Heroku app**
3. **Add Python buildpack**
4. **Deploy the backend directory**

### Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Configure the project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `church-grader`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. **Add Environment Variables**:
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL (e.g., `https://your-app.railway.app`)
5. **Deploy**

### Step 4: Update Backend CORS

After deploying your backend, update the CORS settings in `backend/api.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://your-vercel-domain.vercel.app",  # Your Vercel domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 5: Test Your Deployment

1. **Visit your Vercel URL**
2. **Check that churches load** from your backend
3. **Test a small evaluation** with 1-2 churches
4. **Verify results display correctly**

## Environment Variables

### Frontend (Vercel)

- `NEXT_PUBLIC_BACKEND_URL`: Your backend API URL

### Backend (Railway/Render/Heroku)

- `OPENAI_API_KEY`: Your OpenAI API key

## Troubleshooting

### Common Issues

1. **"Failed to load churches"**

   - Check your backend URL is correct
   - Verify CORS settings in backend
   - Ensure backend is running

2. **"Evaluation failed"**

   - Check `OPENAI_API_KEY` is set in backend
   - Verify your CSV file path is correct
   - Check backend logs for errors

3. **Build errors**
   - Ensure all dependencies are in `package.json`
   - Check TypeScript errors are resolved

### Local Testing

Before deploying, test locally:

```bash
# Terminal 1: Backend
cd church-grader
source ../venv/bin/activate
python backend/api.py

# Terminal 2: Frontend
cd church-grader
npm run dev
```

Visit `http://localhost:3000` and verify everything works.

## Production Considerations

1. **Database**: For production, consider using a proper database instead of in-memory storage
2. **File Storage**: Store CSV files in cloud storage (S3, etc.)
3. **Monitoring**: Add logging and monitoring to your backend
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Security**: Add authentication if needed

## Cost Estimation

- **Vercel**: Free tier (Hobby) should be sufficient
- **Railway**: ~$5-10/month for backend
- **OpenAI API**: Depends on usage (~$0.01-0.10 per evaluation)

## Alternative: Full-Stack Deployment

If you want to deploy everything together, consider:

- **Railway**: Can deploy both frontend and backend
- **Render**: Full-stack deployment support
- **DigitalOcean App Platform**: Full-stack deployment
- **AWS Amplify**: Full-stack deployment

These platforms can handle both your Next.js frontend and Python backend in one deployment.

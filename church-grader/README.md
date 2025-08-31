# Church Chatbot Grader Dashboard

A **full-stack application** that integrates with your Python evaluation system to provide a modern web interface for evaluating pastors.ai chatbot accuracy.

## 🎯 What This Does

This is **not just a viewer** - it's a complete evaluation system that:

1. **Loads churches directly from your CSV file** (245 churches from `churches_cleaned.csv`)
2. **Runs evaluations through your Python backend** (the system we built earlier)
3. **Shows live progress** as evaluations run
4. **Displays results with filtering and analysis**
5. **Provides a professional web interface** for the entire evaluation workflow

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind + shadcn/ui
- **Backend**: FastAPI + Python (integrates with your existing evaluation system)
- **Data**: Uses your `churches_cleaned.csv` file directly
- **Evaluation**: Runs your Python evaluation script in the background

## Features

- **Direct CSV Integration**: Loads churches directly from your `churches_cleaned.csv` file
- **Live Evaluation**: Run evaluations through your Python backend in real-time
- **Church Selection**: Multi-select interface with search functionality
- **Question Management**: Add multiple questions to evaluate
- **Live Progress**: Real-time progress tracking during evaluation
- **Results Analysis**: Filter by grade (A-F) and question
- **Detailed Comparison**: Side-by-side view of bot answers vs ground truth
- **Grade Visualization**: Color-coded grade badges and summary statistics
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Validation**: Zod
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+ with virtual environment
- Your existing Python evaluation system (main.py, clean_data.py, etc.)

### Installation

1. **Clone and setup**:

```bash
git clone <repository-url>
cd church-grader
```

2. **Install frontend dependencies**:

```bash
npm install
# or
pnpm install
```

3. **Install backend dependencies**:

```bash
cd backend
pip install -r requirements.txt
cd ..
```

4. **Start both servers**:

```bash
# Option 1: Use the start script
./start.sh

# Option 2: Start manually
# Terminal 1 - Backend:
source ../venv/bin/activate
python backend/api.py

# Terminal 2 - Frontend:
npm run dev
```

5. **Open the application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)

## Usage

### Complete Evaluation Workflow

1. **Load Churches**: The dashboard automatically loads all 245 churches from your `churches_cleaned.csv` file
2. **Select Churches**: Use the search and multi-select interface to choose which churches to evaluate
3. **Add Questions**: Enter the questions you want to ask (default: "What time is service?")
4. **Start Evaluation**: Click "Start Evaluation" to begin the process
5. **Monitor Progress**: Watch real-time progress as the system:
   - Queries each selected chatbot
   - Scrapes the corresponding website for ground truth
   - Uses GPT to grade the responses
6. **View Results**: Analyze results with filtering, detailed comparisons, and grade summaries

### Key Features

- **Search Churches**: Type to filter the 245 available churches
- **Multi-Select**: Choose any combination of churches to evaluate
- **Live Progress**: See real-time updates as evaluations run
- **Grade Analysis**: View grade distribution and individual results
- **Detailed Comparison**: Side-by-side view of bot answers vs ground truth

### Data Integration

The system integrates directly with your existing Python evaluation system:

- **CSV Source**: Uses `../data/churches_cleaned.csv` (245 churches)
- **Evaluation Engine**: Runs your `main.py` evaluation script
- **Results Format**: Compatible with your existing output format
- **Real-time Processing**: Background job processing with progress tracking

## API Endpoints (for Backend Integration)

If you're building a backend, implement these endpoints:

- `GET /churches` - Returns array of Church objects
- `POST /evaluate` - Starts evaluation, returns `{ jobId: string }`
- `GET /results?jobId=...` - Returns JobStatus object

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms

The app is built with Next.js and can be deployed to any platform that supports it:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── GradeBadge.tsx      # Grade display component
│   ├── ChurchSelector.tsx  # Church selection
│   ├── QuestionInput.tsx   # Question input with tags
│   ├── SummaryHeader.tsx   # Grade summary cards
│   ├── ResultsTable.tsx    # Results table with filters
│   ├── UploadJson.tsx      # File upload component
│   └── Spinner.tsx         # Loading spinner
└── lib/
    ├── api.ts              # API client functions
    ├── types.ts            # TypeScript type definitions
    └── utils.ts            # Utility functions
```

## Customization

### Adding New Questions

The dashboard supports multiple questions. Add them through the QuestionInput component or modify the default question in `page.tsx`.

### Styling

The app uses Tailwind CSS with shadcn/ui components. Customize the theme by modifying:

- `src/app/globals.css` - CSS variables for theming
- `tailwind.config.js` - Tailwind configuration
- `components.json` - shadcn/ui configuration

### Backend Integration

To integrate with your own backend:

1. Update the API endpoints in `src/lib/api.ts`
2. Ensure your backend returns data in the expected format
3. Set the `NEXT_PUBLIC_BACKEND_URL` environment variable

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

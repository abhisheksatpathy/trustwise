# TrustWise

A text analysis tool that evaluates content for toxicity and educational value using optimized AI models.

## Project Demo

[Watch the project demo video](your_video_link_here) to see TrustWise in action and understand its features.

## Key Features & Technical Highlights

### Performance Optimizations
- **ONNX Runtime Integration**: Models converted to ONNX format for 2.5-3x faster inference
- **Efficient Model Serving**: Optimized model loading and inference pipeline
- **Concurrent Request Handling**: FastAPI's async capabilities for handling multiple analyses

### Modern Architecture
- **Modern UI Components**: Built with shadcn/ui for a polished, accessible interface
- **Multi-Stage Docker Builds**: Optimized container sizes and build times
  - Separate stages for dependencies, building, and runtime
  - Minimal final image with only production necessities
  - Proper security considerations with non-root user

### Quality & Testing
- **Comprehensive Backend Testing**: PyTest suite covering:
  - API endpoint validation
  - Model inference accuracy
  - Error handling scenarios
  - Database operations

### Core Features
- Real-time text analysis
- Toxicity scoring with RoBERTa model
- Educational value assessment
- Analysis history tracking
- AI-powered text generation assistance using GPT-2 model (open source)

## Future Roadmap

### Advanced Model Serving with Triton
- NVIDIA Triton Inference Server integration (CPU & GPU support)
- Model versioning and A/B testing capabilities
- Metrics endpoint for monitoring
- Concurrent model execution

### Further Optimizations
- Model quantization (8-bit for RoBERTa)
- Custom tokenizer optimizations
- Enhanced caching strategies
- Dynamic batching support

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git LFS

### Step 1: Clone the Repository
bash/zsh
Clone with Git LFS (As .onnx files are large)
```
git lfs install
git clone https://github.com/yourusername/trustwise.git
cd trustwise
```

### Step 2: Environment Setup

Create a `.env` file in the root directory with the following variables, I have provided a .env.example file for reference also:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Backend & DatabaseSetup

Install PostgreSQL (if not already installed)
macOS (using Homebrew):
```
brew install postgresql@15
brew services start postgresql@15
```

Ubuntu:
```
sudo apt install postgresql-15
sudo service postgresql start
```

Windows:
Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/)

Create database and user
```
psql postgres
CREATE DATABASE trustwise;
CREATE USER trustwise WITH PASSWORD 'trustwise';
GRANT ALL PRIVILEGES ON DATABASE trustwise TO trustwise;
```

bash/zsh
```
cd backend
```

Create virtual environment
```
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
```
Install dependencies
```
pip install -r requirements.txt
```

Start the backend server
```
uvicorn app.main:app --reload --port 8000
```

### Step 4: Frontend Setup
bash/zsh
```
cd frontend
```

Install dependencies
```
npm install
```

Start the frontend server
```
npm run dev
```

### Docker Setup

If you prefer using Docker:
bash/zsh
```
docker-compose up --build
```


## Stop all services    

```
docker-compose down
```




from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from sqlmodel import Session, select
from app.database import get_session
from app.models import TextAnalysis, AnalyzeRequest, AnalyzeResponse, TextGenerationResponse
from app.inference import ModelInference
from app.text_generator import TextGenerator

router = APIRouter()
model_inference = ModelInference()

text_generator = TextGenerator()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(
    request: AnalyzeRequest,
    session: Session = Depends(get_session),
):
    
    toxicity, education, inference_time = await model_inference.analyze_text(request.text)
    
    analysis = TextAnalysis(
        text=request.text,
        toxicity_score=toxicity,
        education_score=education,
        inference_time_ms=inference_time
    )
    session.add(analysis)
    session.commit()
    
    return AnalyzeResponse(
        toxicity_score=toxicity,
        education_score=education,
        inference_time_ms=inference_time
    )

@router.get("/history", response_model=List[TextAnalysis])
async def get_history(
    skip: int = 0,
    limit: int = 50,
    session: Session = Depends(get_session),
):
    query = select(TextAnalysis).offset(skip).limit(limit).order_by(TextAnalysis.created_at.desc())
    return session.exec(query).all()

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/generate-text", response_model=TextGenerationResponse)
async def generate_text():
    """Generate random text using GPT-2"""
    try:
        generated_text = await text_generator.generate_random_text()
        return {"text": generated_text}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate text: {str(e)}"
        )

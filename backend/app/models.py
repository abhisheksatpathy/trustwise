from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class TextAnalysis(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str = Field(min_length=1)
    toxicity_score: float
    education_score: float
    inference_time_ms: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnalyzeRequest(SQLModel):
    text: str = Field(min_length=1)

class AnalyzeResponse(SQLModel):
    toxicity_score: float
    education_score: float
    inference_time_ms: float

class TextGenerationResponse(SQLModel):
    text: str
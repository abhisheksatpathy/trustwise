import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.text_generator import TextGenerator

def test_health_check(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_analyze_text(client: TestClient):
    # Test successful analysis
    test_text = "This is a test sentence."
    response = client.post(
        "/api/v1/analyze",
        json={"text": test_text}
    )
    assert response.status_code == 200
    data = response.json()
    assert "toxicity_score" in data
    assert "education_score" in data
    assert "inference_time_ms" in data
    assert isinstance(data["toxicity_score"], float)
    assert isinstance(data["education_score"], float)
    assert isinstance(data["inference_time_ms"], float)

def test_analyze_text_validation(client: TestClient):
    # Test empty text
    response = client.post(
        "/api/v1/analyze",
        json={"text": ""}
    )
    assert response.status_code == 422

def test_get_history(client: TestClient, session: Session):
    # First add some test data
    response = client.post(
        "/api/v1/analyze",
        json={"text": "Test sentence 1"}
    )
    assert response.status_code == 200
    
    response = client.post(
        "/api/v1/analyze",
        json={"text": "Test sentence 2"}
    )
    assert response.status_code == 200

    # Test history endpoint
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    
    # Test pagination
    response = client.get("/api/v1/history?skip=1&limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs" in data
    assert "health" in data

@pytest.mark.asyncio
async def test_database_operations(session: Session):
    from app.models import TextAnalysis
    
    # Create test record
    analysis = TextAnalysis(
        text="Test text",
        toxicity_score=0.1,
        education_score=3.5,
        inference_time_ms=100.0
    )
    session.add(analysis)
    session.commit()
    
    # Query and verify
    stored_analysis = session.get(TextAnalysis, 1)
    assert stored_analysis is not None
    assert stored_analysis.text == "Test text"
    assert stored_analysis.toxicity_score == 0.1
    assert stored_analysis.education_score == 3.5

def test_generate_text(client: TestClient):
    # Test multiple generations to ensure randomness
    generated_texts = set()
    for _ in range(3):
        response = client.get("/api/v1/generate-text")
        assert response.status_code == 200
        data = response.json()
        
        # Basic validation
        assert "text" in data
        text = data["text"]
        assert isinstance(text, str)
        assert len(text) > 20  # Reasonable minimum length
        
        # Store for uniqueness check
        generated_texts.add(text)
    
    # Verify we got different texts (randomness check)
    assert len(generated_texts) > 1, "Generated texts should be different"

def test_generated_text_analysis(client: TestClient):
    """Test that generated text can be successfully analyzed"""
    # Get generated text
    gen_response = client.get("/api/v1/generate-text")
    assert gen_response.status_code == 200
    text = gen_response.json()["text"]
    
    # Try to analyze it
    analysis_response = client.post(
        "/api/v1/analyze",
        json={"text": text}
    )
    assert analysis_response.status_code == 200
    data = analysis_response.json()
    
    # Verify analysis results
    assert "toxicity_score" in data
    assert "education_score" in data
    assert isinstance(data["toxicity_score"], float)
    assert isinstance(data["education_score"], float)
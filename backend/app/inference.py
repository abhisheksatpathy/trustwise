import onnxruntime as ort
import numpy as np
from typing import Tuple
import time
from transformers import AutoTokenizer, RobertaTokenizer
from fastapi.concurrency import run_in_threadpool
import asyncio
import math

class ModelInference:
    def __init__(self):
        # Initialize tokenizers
        self.tox_tokenizer = RobertaTokenizer.from_pretrained('s-nlp/roberta_toxicity_classifier')
        self.edu_tokenizer = AutoTokenizer.from_pretrained("HuggingFaceTB/fineweb-edu-classifier")
        
        # Load ONNX models
        self.tox_session = ort.InferenceSession("ml_models/toxicity.onnx/model.onnx")
        self.edu_session = ort.InferenceSession("ml_models/education.onnx/model.onnx")

    async def analyze_text(self, text: str) -> Tuple[float, float, float]:
        start_time = time.time()
        
        # Run inferences in parallel thread pool
        tox_future = run_in_threadpool(self._get_toxicity_score, text)
        edu_future = run_in_threadpool(self._get_education_score, text)
        
        toxicity_score, education_score = await asyncio.gather(tox_future, edu_future)
        inference_time = (time.time() - start_time) * 1000  # ms
        
        return toxicity_score, education_score, inference_time

    def _get_toxicity_score(self, text: str) -> float:
        """Returns probability of toxicity (0-1 float)"""
        inputs = self.tox_tokenizer(
            text, 
            return_tensors="np", 
            padding=True, 
            truncation=True,
            max_length=512
        )
        logits = self.tox_session.run(None, dict(inputs))[0][0]
        
        # Convert logits to probabilities using softmax
        toxic_prob = np.exp(logits[1]) / np.sum(np.exp(logits))
        return float(toxic_prob)

    def _get_education_score(self, text: str) -> float:
        """Returns education score"""
        inputs = self.edu_tokenizer(
            text,
            return_tensors="np",
            padding="longest",
            truncation=True,
            max_length=4096
        )
        raw_score = self.edu_session.run(None, dict(inputs))[0][0]
        
        sigmoid_score = 1 / (1 + np.exp(-raw_score))
        return round(float(sigmoid_score), 3)
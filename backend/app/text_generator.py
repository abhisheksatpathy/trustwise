from transformers import AutoTokenizer, AutoModelForCausalLM
from fastapi.concurrency import run_in_threadpool
import torch, random

class TextGenerator:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained('gpt2')
        self.model = AutoModelForCausalLM.from_pretrained('gpt2')
        self.model.eval() #Disable dropout

        if torch.cuda.is_available():
            self.model = self.model.to('cuda')
        
        # Set of diverse prompts to generate different types of text
        self.prompts = [
            "In my opinion,",
            "I believe that",
            "The most important aspect is",
            "Consider this:",
            "Let me explain why",
            "An interesting observation is",
        ]

    async def generate_random_text(self) -> str:
        return await run_in_threadpool(self._sync_generate)
    
    def _sync_generate(self):
        # Select random prompt
        prompt = random.choice(self.prompts)
        
        # Generate text
        inputs = self.tokenizer.encode(prompt, return_tensors='pt').to(self.model.device)
        
        # Generate with some randomness
        outputs = self.model.generate(
            inputs,
            max_length=150,
            do_sample=True,
            temperature=0.9,
            top_k=50,
            top_p=0.95,
            repetition_penalty=1.2,
            pad_token_id=self.tokenizer.eos_token_id
        )

        return self._process_output(outputs)
    
    def _process_output(self, outputs):    
        text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Clean partial sentences
        last_punct = max(text.rfind("."), text.rfind("?"), text.rfind("!"))
        if last_punct != -1:
            text = text[:last_punct+1]
            
        return text

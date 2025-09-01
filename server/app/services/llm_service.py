import requests
import json
from ..config import settings
from .. import schemas
import time

# OpenRouter endpoint
API_URL = "https://openrouter.ai/api/v1/chat/completions"


# Mistral 7B for now
LLM_MODEL = "mistralai/mistral-7b-instruct:free"

MODELS_TO_TRY = [
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-7b-it:free",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo"
]


def generate_story_from_topic(topic: str) -> schemas.StoryCreate:
    """
    Generates a story using an LLM, parses the response,
    and returns it as a Pydantic schema.
    """
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
    You are a JSON-generating AI that strictly follows instructions.
    Your only task is to generate a single, valid, compact JSON object on a single line with no formatting.
    Do not output any text, explanations, or markdown formatting before or after the JSON object.
    
    The user wants a short story based on the topic: "{topic}".
    
    The JSON object MUST have the following structure and keys: "title", "text", "questions".
    - "title": A string for the story's title.
    - "text": A string for the story's full text.
    - "questions": An array of exactly 3 objects, each with "question" and "answer" string keys.
    
    CRITICAL: There must be no extra characters, commas, or any other text between the value of one key and the next key. The structure must be perfect.

    EXAMPLE of a PERFECT response format:
    {{"title":"Example Title","text":"This is the story text.","questions":[{{ "question":"Q1?","answer":"A1"}},{{"question":"Q2?","answer":"A2"}},{{"question":"Q3?","answer":"A3"}}]}}
    """

    data = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"} 
    }

    max_retries = 3
    retry_delay_seconds = 2
    
    last_exception = None
    
    # iterate through the fallback models
    for model_name in MODELS_TO_TRY:
        print(f"--- Attempting to use model: {model_name} ---")
        
        data = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }

        # retry the request for the current model
        for attempt in range(max_retries):
            try:
                print(f"  Attempt {attempt + 1}/{max_retries} for model {model_name}...")
                
                response = requests.post(API_URL, headers=headers, json=data, timeout=90)
                response.raise_for_status()
                
                content_str = response.json()["choices"][0]["message"]["content"]
                
                try:
                    story_data = json.loads(content_str)
                except json.JSONDecodeError:
                    # JSON object is returned as a string
                    unwrapped_str = json.loads(content_str)
                    story_data = json.loads(unwrapped_str)
                
                print(f"Successfully generated story with model: {model_name}")
                return schemas.StoryCreate(
                    title=story_data["title"],
                    text=story_data["text"],
                    questions=story_data["questions"],
                    llm_model=model_name 
                )

            except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
                print(f"  Attempt {attempt + 1} failed for {model_name}. Error: {e}")
                last_exception = e
                if attempt < max_retries - 1:
                    time.sleep(retry_delay_seconds)
                else:
                    print(f"All retries failed for model {model_name}.")
                    break
        

    # all models failed
    raise Exception(f"Failed to generate story after trying all fallback models and retries. Last error: {last_exception}")
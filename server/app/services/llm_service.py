import requests
import json
from ..config import settings
from .. import schemas

# OpenRouter endpoint
API_URL = "https://openrouter.ai/api/v1/chat/completions"


# Mistral 7B for now
LLM_MODEL = "mistralai/mistral-7b-instruct:free"

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

    try:
        response = requests.post(API_URL, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        
        response_json = response.json()
        content_str = response_json["choices"][0]["message"]["content"]
        
        print("--- RAW LLM RESPONSE --- \n", content_str)
        print("------------------------------") 

        # ensure valid JSON
        json_start_index = content_str.find('{')
        json_end_index = content_str.rfind('}')

        if json_start_index == -1 or json_end_index == -1:
            raise json.JSONDecodeError("Could not find a JSON object in the LLM response.", content_str, 0)
        
        # extract json and parse
        clean_json_str = content_str[json_start_index : json_end_index + 1]
        story_data = json.loads(clean_json_str)

        return schemas.StoryCreate(
            title=story_data["title"],
            text=story_data["text"],
            questions=story_data["questions"],
            llm_model=LLM_MODEL
        )

    except requests.exceptions.RequestException as e:
        print(f"Error occurred: {e}")
        raise Exception(f"API request failed: {e}")
    
    except (KeyError, json.JSONDecodeError) as e:
        print(f"Failed to parse LLM response: {e}")
        raise Exception(f"Failed to parse LLM response: {e}")
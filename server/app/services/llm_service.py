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
    You are an expert JSON-generating AI. Your sole task is to generate a single, valid, compact JSON object.
    Do NOT use any newlines or formatting within the JSON structure. It must be a single line.
    Do not include any text, explanations, or markdown formatting before or after the JSON object.
    
    The user wants a short story based on the topic: "{topic}".
    
    Generate a JSON object with the following exact keys: "title", "text", "questions".
    - The "text" value should be a single paragraph.
    - The "questions" value must be an array of exactly 3 objects.
    - Each object in the "questions" array MUST have two keys: "question" and "answer".
    
    CRITICAL: The entire response must be a single-line, compact JSON object with no formatting.
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

import json
import requests
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState 
from ..database import SessionLocal
from ..config import settings
from .. import crud, schemas
from ..services.llm_service import _preprocess_topic, MODELS_TO_TRY

router = APIRouter()

async def _generate_metadata_for_story(story_text: str, model_name: str) -> dict:
    """
    Makes a separate, non-streaming call to generate a title and questions
    for a given story body. Returns a dictionary.
    """
    print("Generating metadata (title and questions) for the story...")
    
    metadata_prompt = f"""
    You are a helpful AI assistant and a literary editor. Read the following story and perform two tasks:
    1.  Create a short, creative, and engaging title for the story.
    2.  Generate exactly 3 comprehension questions based on its content.

    Return your response as a single, valid JSON object with two keys: "title" and "questions".
    The "questions" key should contain an array of objects, where each object has a "question" and "answer" key.
    Do not include any other text or explanations.

    STORY:
    ---
    {story_text}
    ---
    """
    
    headers = { "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}" }
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": metadata_prompt}],
        "response_format": {"type": "json_object"}
    }
    
    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=60)
    response.raise_for_status()
    
    content_str = response.json()["choices"][0]["message"]["content"]
    print("metadata response: ")
    print(content_str)
    try:
        data = json.loads(content_str)
    except json.JSONDecodeError:
        data = json.loads(json.loads(content_str))
        
    return {
        "title": data.get("title", "Untitled Story"),
        "questions": data.get("questions", [])
    }

@router.websocket("/ws/generate-story-stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    db = SessionLocal()
    
    try:
        data = await websocket.receive_json()
        raw_topic = data.get("topic")
        if not raw_topic:
            await websocket.send_json({"type": "error", "payload": "No topic provided."})
            return

        clean_topic = _preprocess_topic(raw_topic)[0]

        full_story_text = ""
        story_stream_succeeded = False
        last_exception = None

        for model_name in MODELS_TO_TRY:
            print(f"--- Attempting to stream story body with model: {model_name} ---")
            story_prompt = f"You are a master storyteller. Write a short, engaging story based on this topic: {clean_topic}. Do not write a title. Start directly with the story's first sentence."
            
            headers = { "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}" }
            payload = { "model": model_name, "messages": [{"role": "user", "content": story_prompt}], "stream": True }

            try:
                response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, stream=True, timeout=90)
                response.raise_for_status()

                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith("data: "):
                            content = line_str[6:]
                            if content == "[DONE]": break
                            try:
                                chunk = json.loads(content)
                                token = chunk["choices"][0]["delta"].get("content", "")
                                if token:
                                    full_story_text += token
                                    await websocket.send_json({"type": "token", "payload": token})
                            except (json.JSONDecodeError, KeyError):
                                continue
                
                story_stream_succeeded = True
                break

            except (requests.exceptions.RequestException) as e:
                print(f"Model {model_name} failed. Error: {e}. Trying next model...")
                last_exception = e
                continue

        if not story_stream_succeeded:
            raise Exception(f"Failed to stream story after trying all models. Last error: {last_exception}")

        await websocket.send_json({"type": "story_done"})

        # metadata generation
        successful_model = model_name
        metadata = await _generate_metadata_for_story(full_story_text, successful_model)

        # combine & save to database
        new_story_record = crud.create_story(db, schemas.StoryCreate(
            title=metadata["title"],
            text=full_story_text,
            questions=metadata["questions"],
            llm_model=successful_model
        ))
        
        pydantic_story = schemas.Story.from_orm(new_story_record)
        final_story_object = pydantic_story.model_dump(mode='json')

        # send final message
        await websocket.send_json({"type": "complete", "payload": final_story_object})

        # wait for client to close
        await websocket.receive_text()

    except WebSocketDisconnect:
        print("Client gracefully closed the connection.")
    except Exception as e:
        error_message = f"An error occurred in WebSocket: {e}"
        print(error_message)
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.send_json({"type": "error", "payload": str(e)})
    finally:
        print("Closing DB session and WebSocket interaction.")
        db.close()
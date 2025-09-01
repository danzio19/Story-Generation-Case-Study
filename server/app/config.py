from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Loads environment variables from the .env file."""
    OPENROUTER_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
import json
from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    GEMINI_API_KEY: str = "YOUR_GEMINI_API_KEY"
    GEMINI_MODEL: str = "gemini-1.5-flash"
    JWT_SECRET: str = "pathforge-super-secret-access-token-key-32-chars-long"
    ALLOWED_ORIGINS: str = '["http://localhost:3000","http://localhost:4000"]'
    PORT: int = 8000
    
    @property
    def cors_origins(self) -> List[str]:
        try:
            return json.loads(self.ALLOWED_ORIGINS)
        except Exception:
            return ["http://localhost:3000", "http://localhost:4000"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

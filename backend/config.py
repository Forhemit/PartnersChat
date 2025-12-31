"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel

load_dotenv()

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"

# --- Model Definitions ---

STANDARD_COUNCIL = [
    "x-ai/grok-4.1-fast",
    "google/gemini-3-flash-preview",
    "deepseek/deepseek-v3.2",
    "openai/gpt-5.2-chat",
]

STANDARD_CHAIRMAN = "google/gemini-3-pro-preview"

FREE_COUNCIL = [
    "xiaomi/mimo-v2-flash:free",
    "mistralai/devstral-2512:free",
    "nex-agi/deepseek-v3.1-nex-n1:free",
    "openai/gpt-oss-120b:free",
]

FREE_CHAIRMAN = "tngtech/deepseek-r1t2-chimera:free"


# --- Dynamic Settings ---

class Settings(BaseModel):
    openrouter_api_key: str
    include_free_models: bool = False
    timezone: str = "America/Los_Angeles"
    
    # Mutable model definitions
    paid_council_models: List[str] = STANDARD_COUNCIL
    paid_chairman_model: str = STANDARD_CHAIRMAN
    free_council_models: List[str] = FREE_COUNCIL
    free_chairman_model: str = FREE_CHAIRMAN

    @property
    def council_models(self) -> List[str]:
        if self.include_free_models:
            return self.free_council_models
        return self.paid_council_models

    @property
    def chairman_model(self) -> str:
        if self.include_free_models:
            return self.free_chairman_model
        return self.paid_chairman_model


# Global settings instance
# Initialize with environment variable
_initial_key = os.getenv("OPENROUTER_API_KEY", "")
settings = Settings(openrouter_api_key=_initial_key)


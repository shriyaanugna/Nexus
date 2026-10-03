import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = "NEXUS"
    APP_SUBTITLE: str = "Autonomous Investigation System"
    TAGLINE: str = "Don\'t just search. Investigate."
    VERSION: str = "1.0.0"
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    DB_PATH: str = os.path.join(BASE_DIR, "nexus.db")
    VECTOR_CACHE_DIR: str = os.path.join(BASE_DIR, ".cache_vectors")
    
    # LLM Settings
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-pro")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "")
    
    # Investigation thresholds
    MAX_INVESTIGATION_DEPTH: int = int(os.getenv("MAX_INVESTIGATION_DEPTH", "5"))
    MIN_EVIDENCE_SCORE: float = float(os.getenv("MIN_EVIDENCE_SCORE", "0.20"))
    CONFIDENCE_THRESHOLD_HIGH: float = 0.85
    CONFIDENCE_THRESHOLD_MED: float = 0.65
    
    @property
    def is_local_mode(self) -> bool:
        return not bool(self.LLM_API_KEY and self.LLM_API_KEY.strip())

settings = Settings()

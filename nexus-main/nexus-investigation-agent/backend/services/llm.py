import json
from typing import Optional, Dict, Any
from ..config import settings

class LLMService:
    """
    LLM integration service.
    If LLM_API_KEY is missing or invalid, gracefully defaults to Local Evidence Mode.
    """
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.base_url = settings.LLM_BASE_URL

    @property
    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def generate_json(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        if not self.is_available:
            return None
            
        try:
            import httpx
            # If user configured an OpenAI or compatible endpoint:
            url = f"{self.base_url or 'https://api.openai.com/v1'}/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1
            }
            resp = httpx.post(url, headers=headers, json=payload, timeout=20.0)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception:
            pass
            
        return None

llm_service = LLMService()

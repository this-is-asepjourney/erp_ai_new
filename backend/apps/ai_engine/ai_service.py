from django.conf import settings
from openai import OpenAI


class AIService:
    """Layanan utama untuk komunikasi dengan OpenAI API."""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.AI_MODEL

    def ask(self, system_prompt: str, user_message: str) -> str:
        """Kirim pertanyaan ke AI dan dapatkan jawaban."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content

    def analyze_data(self, context: str, question: str) -> str:
        """Analisis data ERP dengan konteks tertentu."""
        system_prompt = (
            "Kamu adalah AI ERP Analyst yang ahli menganalisis data bisnis. "
            "Berikan analisis yang tajam, ringkas, dan actionable dalam Bahasa Indonesia. "
            "Selalu sertakan rekomendasi konkret."
        )
        full_message = f"Data Konteks:\n{context}\n\nPertanyaan:\n{question}"
        return self.ask(system_prompt, full_message)

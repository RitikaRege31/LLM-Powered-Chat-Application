import os
from itertools import cycle
from dotenv import load_dotenv
from chat.llm_clients import LLMClient

# Load environment variables
load_dotenv()

class LLMService:
    """Manages multiple LLM clients and distributes requests."""

    def __init__(self):
        self.clients = [
            LLMClient("Gemini", os.getenv("GEMINI_API_KEY"), "gemini-2.0-flash"),
            LLMClient("Cohere", os.getenv("COHERE_API_KEY"), "command-r"),
            LLMClient("OpenAI", os.getenv("OPENAI_API_KEY"), "gpt-3.5-turbo"),
            LLMClient("Cohere", os.getenv("COHERE_API_KEY"), "command-r"),
            LLMClient("Mistral", os.getenv("MISTRAL_API_KEY"), "mistral-7b"),
            LLMClient("HuggingFaceHub", os.getenv("HUGGINGFACE_API_KEY"), "mistralai/Mistral-7B"),
            LLMClient("HuggingFaceHub", os.getenv("HUGGINGFACE_API_KEY"), "tiiuae/falcon-7b"),
            LLMClient("Together AI", os.getenv("TOGETHER_API_KEY"), "togethercomputer/mistral-7b"),
        ]
        self.client_cycle = cycle(self.clients)

    def get_next_client(self):
        """Get the next LLM client in a round-robin fashion."""
        return next(self.client_cycle)

    def generate_response(self, prompt: str) -> str:
        """Generate a response using the next available LLM."""
        for _ in range(len(self.clients)):
            client = self.get_next_client()
            try:
                return client.generate_text(prompt)
            except Exception as e:
                print(f"Error with {client.provider}: {str(e)}")
                continue
        return "Error: All LLM providers failed."

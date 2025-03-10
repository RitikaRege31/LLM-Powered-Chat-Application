import os
from langchain.chat_models import ChatOpenAI
from langchain.llms import HuggingFaceHub
from langchain.schema.runnable import RunnableLambda
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_cohere import ChatCohere
from mistralai.client import MistralClient
from together import Together
# from groq import Groq
# from langchain_groq import ChatGroq
import random

class LLMClient:
    """Handles API interactions with different LLM providers."""

    def __init__(self, provider, api_key, model_name):
        self.provider = provider
        self.api_key = api_key
        self.model_name = model_name
        self.llm = self._initialize_llm()  # Initialize LangChain-Compatible LLM

    def _initialize_llm(self):
        """Return LangChain-compatible LLM with API rotation on failure."""
        try:
            if self.provider == "OpenAI":
                return ChatOpenAI(model_name=self.model_name, openai_api_key=self.api_key)
            elif self.provider == "Cohere":
                return ChatCohere(model=self.model_name, cohere_api_key=self.api_key)
            elif self.provider == "Mistral":
                return lambda x: self.call_mistral(x)  # Custom call for Mistral
            elif self.provider == "Gemini":
                return ChatGoogleGenerativeAI(model=self.model_name, google_api_key=self.api_key)
            elif self.provider == "Together AI":
                return lambda x: self.call_together(x)  # Custom call for Together AI
            # elif self.provider == "Groq":
            #     return ChatGroq(model=self.model_name, groq_api_key=self.api_key)
            else:
                raise ValueError(f"Unknown provider: {self.provider}")
        except Exception as e:
            print(f"⚠️ Failed to initialize {self.provider}. Error: {e}")
            return self._fallback_llm()

    def _fallback_llm(self):
        """Fallback to an alternative LLM when primary fails."""
        fallback_providers = ["Gemini", "Mistral", "Together AI", "Cohere"]
        random.shuffle(fallback_providers)  # Randomize fallback order

        for provider in fallback_providers:
            try:
                print(f"🔄 Falling back to {provider}...")
                return LLMClient(provider, os.getenv(f"{provider.upper()}_API_KEY"), self.model_name).llm
            except Exception:
                continue

        raise RuntimeError("❌ All LLM providers failed.")

    def generate_text(self, prompt):
        """Generate text using the selected LLM model with fallback on failure."""
        try:
            return self.llm.invoke(prompt) if callable(self.llm) else self.llm(prompt)
        except Exception as e:
            error_message = str(e).lower()
            if "insufficient_quota" in error_message or "429 too many requests" in error_message:
                print(f"⚠️ OpenAI quota exceeded. Switching to another provider...")
                self.llm = self._fallback_llm()
                return self.generate_text(prompt)
            print(f"⚠️ Unexpected error: {e}")
            raise e

    
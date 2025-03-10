# from typing import List

# from langchain.agents import initialize_agent, load_tools, AgentType, AgentExecutor
# from langchain.callbacks.base import BaseCallbackHandler
# from langchain.chat_models import ChatOpenAI
# from langchain.memory import ConversationBufferMemory

# from chat.messages.chat_message_repository import ChatMessageRepository
# from chat.models import MessageSender, ChatMessage
# from project import settings


# class AgentFactory:

#     def __init__(self):
#         self.chat_message_repository = ChatMessageRepository()

#     async def create_agent(
#         self,
#         tool_names: List[str],
#         chat_id: str = None,
#         streaming=False,
#         callback_handlers: List[BaseCallbackHandler] = None,
#     ) -> AgentExecutor:
#         # Instantiate the OpenAI LLM
#         llm = ChatOpenAI(
#             temperature=0,
#             openai_api_key=settings.openai_api_key,
#             streaming=streaming,
#             callbacks=callback_handlers,
#         )

#         # Load the Tools that the Agent will use
#         tools = load_tools(tool_names, llm=llm)

#         # Load the memory and populate it with any previous messages
#         memory = await self._load_agent_memory(chat_id)

#         # Initialize and return the agent
#         return initialize_agent(
#             tools=tools,
#             llm=llm,
#             agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
#             verbose=True,
#             memory=memory
#         )

#     async def _load_agent_memory(
#         self,
#         chat_id: str = None,
#     ) -> ConversationBufferMemory:
#         if not chat_id:
#             return ConversationBufferMemory(memory_key="chat_history", return_messages=True)

#         # Create the conversational memory for the agent
#         memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

#         # Load the messages for the chat_id from the DB
#         chat_messages: List[ChatMessage] = await self.chat_message_repository.get_chat_messages(chat_id)

#         # Add the messages to the memory
#         for message in chat_messages:
#             if message.sender == MessageSender.USER.value:
#                 # Add user message to the memory
#                 memory.chat_memory.add_user_message(message.content)
#             elif message.sender == MessageSender.AI.value:
#                 # Add AI message to the memory
#                 memory.chat_memory.add_ai_message(message.content)

#         return memory
# from chat.agents.callbacks import AsyncStreamingCallbackHandler
# from chat.messages.chat_message_repository import ChatMessageRepository
# from chat.models import MessageSender, ChatMessage
# from ..services.llm_service import LLMService
# from langchain.agents import initialize_agent, load_tools, AgentType, AgentExecutor
# from langchain.memory import ConversationBufferMemory
# from project import settings
# from langchain_openai import OpenAI

# class AgentFactory:
#     def __init__(self):
#         self.chat_message_repository = ChatMessageRepository()
#         self.llm_service = LLMService()

#     async def create_agent(
#         self, tool_names, chat_id=None, streaming=False, callback_handlers=None
#     ) -> AgentExecutor:
#         """Uses load balancing to choose an LLM and initializes an agent."""
        
#         llm_client = self.llm_service.get_next_client()
#         print(f"Using LLM Provider: {llm_client.provider} with model {llm_client.model}")

        
#         llm = OpenAI(model_name="gpt-3.5-turbo")
#         tools = load_tools(tool_names, llm= llm)
#         memory = await self._load_agent_memory(chat_id)

#         return initialize_agent(
#             tools=tools,
#             llm=llm_client,
#             agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
#             verbose=True,
#             memory=memory
#         )

#     async def _load_agent_memory(self, chat_id=None) -> ConversationBufferMemory:
#         """Loads chat history into memory."""
#         memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

#         if chat_id:
#             chat_messages = await self.chat_message_repository.get_chat_messages(chat_id)
#             for message in chat_messages:
#                 if message.sender == MessageSender.USER.value:
#                     memory.chat_memory.add_user_message(message.content)
#                 elif message.sender == MessageSender.AI.value:
#                     memory.chat_memory.add_ai_message(message.content)

#         return memory
import random
from langchain.agents import initialize_agent, load_tools, AgentType, AgentExecutor
from langchain.memory import ConversationBufferMemory
from chat.messages.chat_message_repository import ChatMessageRepository
from chat.services.llm_service import LLMService  # Use new service
from project import settings

class AgentFactory:
    def __init__(self):
        self.chat_message_repository = ChatMessageRepository()
        self.llm_service = LLMService()  # Use LLMService for load balancing

    async def create_agent(
        self,
        tool_names,
        chat_id=None,
        streaming=False,
        callback_handlers=None,
    ) -> AgentExecutor:
        """Rotates between different LLM APIs and initializes the agent."""
        llm_client = self.llm_service.get_next_client()
        llm = llm_client.llm  # Ensure it's a LangChain-compatible object

        print(f"Using LLM Provider: {llm_client.provider} with model {llm_client.model_name}")

        tools = load_tools(tool_names, llm=llm)
        memory = await self._load_agent_memory(chat_id)

        return initialize_agent(
            tools=tools,
            llm=llm,  # Pass a LangChain-compatible LLM
            agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
            verbose=True,
            memory=memory
        )

    async def _load_agent_memory(self, chat_id=None) -> ConversationBufferMemory:
        if not chat_id:
            return ConversationBufferMemory(memory_key="chat_history", return_messages=True)

        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        chat_messages = await self.chat_message_repository.get_chat_messages(chat_id)

        for message in chat_messages:
            if message.sender == "USER":
                memory.chat_memory.add_user_message(message.content)
            elif message.sender == "AI":
                memory.chat_memory.add_ai_message(message.content)

        return memory

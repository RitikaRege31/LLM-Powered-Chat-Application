
import json
import os
import django
from chat.models import Chat, User

from chat.agents.agent_factory import AgentFactory
from chat.messages.chat_message_repository import ChatMessageRepository

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from channels.generic.websocket import AsyncWebsocketConsumer
from langchain.agents import AgentExecutor
from chat.models import MessageSender
from asgiref.sync import sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    agent: AgentExecutor

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.agent_factory = AgentFactory()
        self.chat_message_repository = ChatMessageRepository()

    async def connect(self):
        email = self.scope['query_string'].decode().split("=")[-1]  # Extract email from query params
        self.user = await sync_to_async(User.objects.filter(email=email).first)()

        if self.user is None:
            await self.close()
            return
        chat_id = self.scope['url_route']['kwargs'].get('chat_id')
        chat = await sync_to_async(Chat.objects.filter(id=chat_id, user=self.user).first)()


        if not chat:
            await self.close()
            return
        self.agent = await self.agent_factory.create_agent(
            tool_names=["llm-math"],
            chat_id=chat_id,
            streaming=True,
            callback_handlers=[],
        )
        await self.accept()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        chat_id = text_data_json['chat_id']

        try:
            response = await self.message_agent(message, chat_id)
            await self.send(text_data=json.dumps({'message': response, 'type': 'answer'}))
        except Exception as e:
            print("Error:", str(e))
            await self.send(text_data=json.dumps({'message': 'Error processing request', 'type': 'error'}))

    async def message_agent(self, message: str, chat_id: str):
        await self.chat_message_repository.save_message(message=message, sender=MessageSender.USER.value, chat_id=chat_id)
        response = await self.agent.arun(message)
        await self.chat_message_repository.save_message(message=response, sender=MessageSender.AI.value, chat_id=chat_id)
        return response

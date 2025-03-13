# models.py
from enum import Enum
import uuid

from django.db import models


class MessageSender(Enum):
    USER = 'USER'
    AI = 'AI'

class User(models.Model):
    email = models.EmailField(unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chats", null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(default="abc@gmail.com")  # Associate chat with user email
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ChatMessage(models.Model):
    content = models.TextField()
    chat = models.ForeignKey(Chat, related_name="messages", on_delete=models.CASCADE)
    sender = models.CharField(max_length=10, choices=[(tag.value, tag.name) for tag in MessageSender])
    timestamp = models.DateTimeField(auto_now_add=True)



class Agent(models.Model):
    name = models.CharField(max_length=255)
    agent_type = models.CharField(max_length=255)
    token = models.CharField(max_length=255, default='a_' + str(uuid.uuid4()), unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

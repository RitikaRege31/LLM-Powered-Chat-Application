from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Agent
from .models import Chat, ChatMessage
from .serializers import AgentSerializer
from .serializers import ChatSerializer, ChatMessageSerializer
import json
from .models import User
from django.core.cache import cache  # Optional for storing session-based email


@csrf_exempt
@api_view(['POST'])
def email_login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        cache.set(f"user:{email}", email, timeout=86400)  # Store email for 24 hours
        user, created = User.objects.get_or_create(email=email)
        return Response({"message": "Login successful", "email": user.email}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    # def get_queryset(self):
    #     email = self.request.query_params.get("email")
    #     if email:
    #         return Chat.objects.filter(user__email=email)
    #     return Chat.objects.none()
    def get_queryset(self):
       email = self.request.query_params.get("email")
       if email:
             return Chat.objects.filter(email=email)  # ✅ Correct (matching the `email` field in the model)
       return Chat.objects.none()


    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the user exists (or has logged in)
        if not cache.get(f"user:{email}"):  # If using a database, check User.objects.filter(email=email).exists()
            return Response({"error": "User not found"}, status=404)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chat = serializer.save(user=user, email=email)
        return Response({"id": chat.id, "name": chat.name})
        # self.perform_create(serializer)
        # return Response(serializer.data)

    def perform_destroy(self, instance):
        # Also delete related chat messages
        ChatMessage.objects.filter(chat_id=instance.id).delete()
        instance.delete()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse({"chats": serializer.data})

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        messages = ChatMessage.objects.filter(chat_id=chat.id).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)


class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    lookup_field = 'token'

    def destroy(self, request, *args, **kwargs):
        agent = self.get_object()
        agent.is_active = False
        agent.save()
        return Response(status=204)

    def update(self, request, *args, **kwargs):
        agent = self.get_object()
        agent.agent_type = request.data.get('agent_type')
        agent.save()
        return Response(AgentSerializer(agent).data)

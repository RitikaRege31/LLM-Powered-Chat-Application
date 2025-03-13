import os
import django  # <-- Add this
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup() 
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.websocket_urls

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
# django.setup() 

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            chat.websocket_urls.websocket_urlpatterns
        )
    ),
})

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ChatViewSet, AgentViewSet, email_login

router = DefaultRouter()
router.register(r'chats', ChatViewSet)
router.register(r'agents', AgentViewSet)
urlpatterns = router.urls  # This registers viewset paths


urlpatterns = [
    path('', include(router.urls)),
    path('login/', email_login),  # New login endpoint
]
from django.http import JsonResponse
from django.core.cache import cache
import time

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = request.META.get('REMOTE_ADDR')
        key = f"rate_limit:{ip}"
        requests_count = cache.get(key, 0)

        if requests_count >= 10:  # Limit to 10 requests per minute
            return JsonResponse({'error': 'Rate limit exceeded'}, status=429)

        cache.set(key, requests_count + 1, timeout=60)
        return self.get_response(request)

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('typingApp.urls')),  # <-- Updated to typingApp.urls
]
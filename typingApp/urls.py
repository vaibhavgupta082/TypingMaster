from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('save-score/', views.save_score, name='save_score'), # <-- Added this API endpoint
    path('create-room/', views.create_room, name='create_room'),
    path('join-room/', views.join_room, name='join_room'),
    path('room-status/<str:code>/', views.room_lobby_status, name='room_status'),
    path('start-challenge/', views.start_challenge, name='start_challenge'),
    path('leave-room/', views.leave_room, name='leave_room'),
]
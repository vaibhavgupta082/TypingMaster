from django.db import models
import random
import string


def generate_room_code():
    # Generates a random 6-character alphanumeric string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class TypingScore(models.Model):
    paragraph_title = models.CharField(max_length=100)
    wpm = models.IntegerField()
    accuracy = models.IntegerField()
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.paragraph_title} - {self.wpm} WPM ({self.accuracy}%)"

class TypingRoom(models.Model):
    code = models.CharField(max_length=6, unique=True, default=generate_room_code)
    owner_session = models.CharField(max_length=255, blank=True, null=True)
    is_started = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room {self.code} (Started: {self.is_started})"

class RoomPlayer(models.Model):
    room = models.ForeignKey(TypingRoom, on_delete=models.CASCADE, related_name='players')
    username = models.CharField(max_length=100)
    session_key = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.username} in {self.room.code}"
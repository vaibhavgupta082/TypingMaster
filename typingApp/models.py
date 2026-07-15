from django.db import models

class TypingScore(models.Model):
    paragraph_title = models.CharField(max_length=100)
    wpm = models.IntegerField()
    accuracy = models.IntegerField()
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.paragraph_title} - {self.wpm} WPM ({self.accuracy}%)"
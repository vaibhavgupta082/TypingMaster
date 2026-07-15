import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import TypingScore

PARAGRAPHS = {
    "1": {
        "title": "Golu & Chiku (Kids Story)",
        "difficulty": "Hard 🐘",
        "text": "Golu the elephant had a big bag of mangoes. They were sweet and yellow and smelled wonderful. \"Can I have one?\" asked Chiku the monkey. He looked very hungry. Golu thought for a moment. He had many mangoes. Chiku had none. \"Yes!\" said Golu. \"Let's share!\" They sat under the mango tree and ate together. It tasted even better with a friend. That evening, it started to rain. Chiku had a dry little house in the tree. \"Come inside!\" he called to Golu. Golu smiled. Sharing had brought them both something warm."
    },
    "2": {
        "title": "Python Programming",
        "difficulty": "Medium 🐍",
        "text": "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability."
    },
    "3": {
        "title": "Django Web Framework",
        "difficulty": "Medium 🦄",
        "text": "Django is a Python-based web framework that encourages rapid development and clean, pragmatic design."
    },
    "4": {
        "title": "Hamlet (Shakespeare)",
        "difficulty": "Hard 💀",
        "text": "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune."
    },
    "5": {
        "title": "JavaScript Language",
        "difficulty": "Easy 🌐",
        "text": "JavaScript is a lightweight, interpreted, or just-in-time compiled language with first-class functions."
    }
}

# The ensure_csrf_cookie decorator sends Django's CSRF token protection to the frontend 
# so we can securely send POST data back to the database.
@ensure_csrf_cookie
def home(request):
    # Fetch top 5 highest WPM scores to display on the leaderboard
    high_scores = TypingScore.objects.order_by('-wpm')[:5]
    
    context = {
        'paragraphs': PARAGRAPHS,
        'high_scores': high_scores
    }
    return render(request, 'typingApp/index.html', context)

def save_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Create and save a new entry in the SQLite Database
            score = TypingScore.objects.create(
                paragraph_title=data.get('paragraph_title'),
                wpm=int(data.get('wpm')),
                accuracy=int(data.get('accuracy'))
            )
            return JsonResponse({'status': 'success', 'score_id': score.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import TypingScore
from .models import TypingRoom , RoomPlayer


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



def create_room(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username', 'Host').strip() or "Host"
        
        # Ensure a session key exists
        if not request.session.session_key:
            request.session.create()
        session_key = request.session.session_key

        # Create room instance mapping owner session
        room = TypingRoom.objects.create(owner_session=session_key)
        # Add host as the first player
        RoomPlayer.objects.create(room=room, username=username, session_key=session_key)

        return JsonResponse({
            'status': 'success',
            'room_code': room.code,
            'is_owner': True
        })
    return JsonResponse({'status': 'error'})

def join_room(request):
    if request.method == "POST":
        data = json.loads(request.body)
        code = data.get('code', '').upper().strip()
        username = data.get('username', 'Guest').strip() or "Guest"

        if not request.session.session_key:
            request.session.create()
        session_key = request.session.session_key

        try:
            room = TypingRoom.objects.get(code=code)
            
            if room.is_started:
                return JsonResponse({'status': 'error', 'message': 'Game already in progress.'})

            # Add player if they aren't already registered in this room instance
            if not RoomPlayer.objects.filter(room=room, session_key=session_key).exists():
                RoomPlayer.objects.create(room=room, username=username, session_key=session_key)

            is_owner = (room.owner_session == session_key)

            return JsonResponse({
                'status': 'success',
                'room_code': room.code,
                'is_owner': is_owner
            })
        except TypingRoom.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invalid room code.'})
            
    return JsonResponse({'status': 'error'})

def room_lobby_status(request, code):
    """Polled by frontend every 1.5 seconds to track user updates & game start flags."""
    try:
        room = TypingRoom.objects.get(code=code)
        players = list(room.players.values_list('username', flat=True))
        return JsonResponse({
            'status': 'success',
            'players': players,
            'is_started': room.is_started
        })
    except TypingRoom.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Room was destroyed.'})

def start_challenge(request):
    if request.method == "POST":
        data = json.loads(request.body)
        code = data.get('code')
        session_key = request.session.session_key

        try:
            room = TypingRoom.objects.get(code=code)
            # Authorization check: only the room owner session can change start states
            if room.owner_session == session_key:
                room.is_started = True
                room.save()
                return JsonResponse({'status': 'success'})
            return JsonResponse({'status': 'error', 'message': 'Unauthorized action.'})
        except TypingRoom.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Room not found.'})
            
    return JsonResponse({'status': 'error'})
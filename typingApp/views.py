from django.shortcuts import render

# Define our pool of paragraphs in Python
PARAGRAPHS = {
    "1": """Golu the elephant had a big bag of mangoes. They were sweet and yellow and smelled wonderful."Can I have one?" asked Chiku the monkey. He looked very hungry.Golu thought for a moment. He had many mangoes. Chiku had none."Yes!" said Golu. "Let's share!" They sat under the mango tree and ate together. It tasted even better with a friend. That evening, it started to rain. Chiku had a dry little house in the tree. "Come inside!" he called to Golu. Golu smiled. Sharing had brought them both something warm.""",
    "2": "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability.",
    "3": "Django is a Python-based web framework that encourages rapid development and clean, pragmatic design.",
    "4": "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
    "5": "JavaScript is a lightweight, interpreted, or just-in-time compiled language with first-class functions."
}

def home(request):
    # Pass the dictionary to our template
    return render(request, 'typingApp/index.html', {'paragraphs': PARAGRAPHS})
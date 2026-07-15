# Core Skills & Technologies Demonstrated 🛠️

This document outlines the professional development, architectural, and coding skills implemented during the engineering of the **Sleek Typing Master** project.

---

## 1. Backend Engineering (Python & Django)

* **Modular MVT Architecture:** Implemented Django's Model-View-Template (MVT) structure by separating application-level routing (`typingApp/urls.py`) from project-level configurations (`typing_master/urls.py`).
* **Dynamic Context Binding:** Designed Python dictionary-based data storage (`PARAGRAPHS`) in views to act as an in-memory data provider, cleanly injecting backend assets into the Jinja/Django template system.
* **Request Lifecycle Management:** Engineered light, non-blocking views to maximize request-response performance, leaving state rendering entirely to client-side actions.

---

## 2. Frontend Engineering (UI/UX & Interactive Logic)

* **Asynchronous Keystroke Processing:** Built real-time event listeners in modern JavaScript (`ES6+`) using the `input` event to capture typing sequences dynamically.
* **Algorithmic State Tracking:** Programmed computational algorithms to measure **Words Per Minute (WPM)** and **Accuracy %** on-the-fly:
* Standard WPM scaling based on standard 5-character word lengths divided by total time elapsed.
* Exact index-matching logic comparing input string indexes to prompt string indexes.


* **Modern CSS & Theme Engineering:** Custom-built an elegant, eye-friendly dark theme inspired by industry-standard developer typing tools. Utilized:
* **CSS Custom Properties (Variables)** for consistent, maintainable color mapping.
* **CSS Grid & Flexbox** for responsive layout structure and seamless spacing.
* **Typography optimization** using Google Fonts integrations (`Fira Code` & `Inter`).



---

## 3. DevOps & Version Control Best Practices

* **Environment Isolation:** Configured and managed isolated Python runtime environments using `venv` to prevent system-wide package pollution.
* **Dependency Locking:** Utilized standard dependency-freezing pipelines (`pip freeze`) to declare absolute dependency locks in `requirements.txt`.
* **Repository Sanitation:** Authored a standard `.gitignore` schema to prevent environment leaks (`.venv/`), local file caches (`__pycache__/`), and database instances (`.sqlite3`) from entering the shared Git history.

---

## 4. Agile Methodology & Software Lifecycle

* **Iterative Prototyping:** Scaled this project using an **Agile iteration framework**—starting from a bare-bones local host configuration (MVP) to layout structuring, backend state optimization, and final stylistic polish.
* **Refactoring & Clean Code:** Swapped architectural patterns (pivoting from server-side Django session timing to client-side JavaScript execution) in response to architectural review.
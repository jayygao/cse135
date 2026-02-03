#!/usr/bin/env python3
import os
import sys
import json
import uuid
import urllib.parse
import glob
from datetime import datetime, timedelta

SESSION_DIR = "/tmp/cse135_sessions"
os.makedirs(SESSION_DIR, exist_ok=True)

def get_cookie(name):
    cookies = os.environ.get("HTTP_COOKIE", "")
    for part in cookies.split(";"):
        part = part.strip()
        if part.startswith(name + "="):
            return part[len(name)+1:]
    return None

def load_session(sid):
    path = os.path.join(SESSION_DIR, sid + ".json")
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {}

def save_session(sid, data):
    path = os.path.join(SESSION_DIR, sid + ".json")
    with open(path, "w") as f:
        json.dump(data, f)

def delete_session(sid):
    path = os.path.join(SESSION_DIR, sid + ".json")
    if os.path.exists(path):
        os.remove(path)

# Get or create session
sid = get_cookie("cse135_session")
if not sid or not os.path.exists(os.path.join(SESSION_DIR, sid + ".json")):
    sid = uuid.uuid4().hex
    save_session(sid, {})

method = os.environ.get("REQUEST_METHOD", "GET")
query_string = os.environ.get("QUERY_STRING", "")
params = urllib.parse.parse_qs(query_string, keep_blank_values=True)
action = params.get("action", ["view"])[0]

session = load_session(sid)

# Handle POST for save
if method == "POST":
    content_length = int(os.environ.get("CONTENT_LENGTH", 0))
    body = sys.stdin.read(content_length) if content_length > 0 else ""
    post_params = urllib.parse.parse_qs(body, keep_blank_values=True)
    action = post_params.get("action", ["view"])[0]

    if action == "save":
        name = post_params.get("name", [""])[0]
        favorite_color = post_params.get("favorite_color", [""])[0]
        favorite_food = post_params.get("favorite_food", [""])[0]
        message = post_params.get("message", [""])[0]
        session["name"] = name
        session["favorite_color"] = favorite_color
        session["favorite_food"] = favorite_food
        session["message"] = message
        session["saved_at"] = datetime.now().strftime("%A, %B %d, %Y %I:%M:%S %p")
        save_session(sid, session)
    elif action == "clear":
        session = {}
        save_session(sid, session)

# Set cookie header (before Content-Type)
expires = (datetime.utcnow() + timedelta(hours=1)).strftime("%a, %d %b %Y %H:%M:%S GMT")
print(f"Set-Cookie: cse135_session={sid}; Path=/; Expires={expires}; HttpOnly")
print("Content-Type: text/html\r\n")

def esc(s):
    return str(s).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

# Determine which page to show
if action == "save" and method == "POST":
    # Redirect after save by showing success + auto-refresh
    page = "saved"
elif action == "clear" and method == "POST":
    page = "cleared"
elif action == "view":
    page = "view"
else:
    page = "save"

print(f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>State Demo - Python</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        .nav-links {{ display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }}
        .nav-links a {{ background: white; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; color: #1e40af; font-weight: 600; transition: all 0.2s; }}
        .nav-links a:hover, .nav-links a.active {{ background: #1e40af; color: white; border-color: #1e40af; }}
        .card {{ background: white; border-radius: 0.75rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 1.5rem; }}
        label {{ display: block; font-weight: 600; color: #374151; margin: 1rem 0 0.3rem; }}
        input, textarea {{ width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.95rem; box-sizing: border-box; font-family: inherit; }}
        input:focus, textarea:focus {{ outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }}
        textarea {{ min-height: 80px; resize: vertical; }}
        .btn-row {{ display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; }}
        .btn-danger {{ background: #dc2626; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 600; }}
        .btn-danger:hover {{ background: #b91c1c; }}
        .success-box {{ background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.5rem; padding: 1rem; color: #166534; margin-bottom: 1rem; }}
        .empty-box {{ background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; color: #6b7280; text-align: center; font-style: italic; }}
        .data-row {{ display: flex; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }}
        .data-label {{ font-weight: 600; color: #1e40af; width: 160px; flex-shrink: 0; }}
        .data-value {{ color: #374151; }}
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>State Demo</h1>
            <p>Python CGI - Server-Side Sessions</p>
        </div>
    </header>
    <main class="container">
        <div class="nav-links">
            <a href="state-python.py?action=save" class="{'active' if page == 'save' else ''}">📝 Save Data</a>
            <a href="state-python.py?action=view" class="{'active' if page == 'view' else ''}">👀 View Data</a>
        </div>
""")

# SAVE PAGE
if page == "save":
    print("""
        <div class="card">
            <h2>Save Your Data</h2>
            <p style="color:#6b7280;">Fill in the form below. Your data will be stored in a server-side session.</p>
            <form method="POST" action="state-python.py">
                <input type="hidden" name="action" value="save">
                <label for="name">Your Name</label>
                <input type="text" id="name" name="name" placeholder="e.g. Jay or Jesse">
                <label for="favorite_color">Favorite Color</label>
                <input type="text" id="favorite_color" name="favorite_color" placeholder="e.g. Blue">
                <label for="favorite_food">Favorite Food</label>
                <input type="text" id="favorite_food" name="favorite_food" placeholder="e.g. Pizza">
                <label for="message">A Message</label>
                <textarea id="message" name="message" placeholder="Write anything..."></textarea>
                <div class="btn-row">
                    <button type="submit" class="button">Save</button>
                </div>
            </form>
        </div>
    """)

# SAVED CONFIRMATION
elif page == "saved":
    print("""
        <div class="success-box">✅ Data saved successfully! <a href="state-python.py?action=view">View your saved data →</a></div>
        <div class="card">
            <h2>Save More Data</h2>
            <form method="POST" action="state-python.py">
                <input type="hidden" name="action" value="save">
                <label>Your Name</label>
                <input type="text" name="name" placeholder="e.g. Jay or Jesse">
                <label>Favorite Color</label>
                <input type="text" name="favorite_color" placeholder="e.g. Blue">
                <label>Favorite Food</label>
                <input type="text" name="favorite_food" placeholder="e.g. Pizza">
                <label>A Message</label>
                <textarea name="message" placeholder="Write anything..."></textarea>
                <div class="btn-row">
                    <button type="submit" class="button">Save</button>
                </div>
            </form>
        </div>
    """)

# CLEARED CONFIRMATION
elif page == "cleared":
    print("""
        <div class="success-box">🗑️ Data cleared successfully! <a href="state-python.py?action=save">Save new data →</a></div>
    """)

# VIEW PAGE
elif page == "view":
    if session:
        print(f"""
        <div class="card">
            <h2>Your Saved Data</h2>
            <div class="data-row"><div class="data-label">Name</div><div class="data-value">{esc(session.get("name",""))}</div></div>
            <div class="data-row"><div class="data-label">Favorite Color</div><div class="data-value">{esc(session.get("favorite_color",""))}</div></div>
            <div class="data-row"><div class="data-label">Favorite Food</div><div class="data-value">{esc(session.get("favorite_food",""))}</div></div>
            <div class="data-row"><div class="data-label">Message</div><div class="data-value">{esc(session.get("message",""))}</div></div>
            <div class="data-row"><div class="data-label">Saved At</div><div class="data-value">{esc(session.get("saved_at",""))}</div></div>
            <div class="btn-row">
                <form method="POST" action="state-python.py" style="margin:0;">
                    <input type="hidden" name="action" value="clear">
                    <button type="submit" class="btn-danger">🗑️ Clear Data</button>
                </form>
                <a href="state-python.py?action=save" class="button">📝 Edit</a>
            </div>
        </div>
        """)
    else:
        print("""
        <div class="empty-box">No data saved yet. <a href="state-python.py?action=save">Go save some data!</a></div>
        """)

print("""
        <div style="text-align:center; margin-top: 2rem;">
            <a href="../../index.html" class="button">Back to Home</a>
        </div>
    </main>
    <footer><p>&copy; 2026 CSE 135 Team</p></footer>
</body>
</html>
""")
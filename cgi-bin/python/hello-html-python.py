#!/usr/bin/env python3
import os
from datetime import datetime

print("Content-Type: text/html\r\n")

now = datetime.now().strftime("%A, %B %d, %Y %I:%M:%S %p")
ip = os.environ.get("REMOTE_ADDR", "unknown")

print(f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello HTML - Python</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <div class="container">
            <h1>Hello HTML World</h1>
            <p>Python CGI Demo</p>
        </div>
    </header>
    <main class="container">
        <section class="section-container">
            <div class="section-header"><h2>Greeting</h2></div>
            <div style="background:white;border-radius:0.75rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);border:1px solid #e5e7eb;">
                <p><strong>Hello World!</strong> Welcome to our Python CGI demo!</p>
                <p><strong>Team Members:</strong> Jay and Jesse</p>
                <p><strong>Language:</strong> Python 3</p>
                <p><strong>Generated At:</strong> {now}</p>
                <p><strong>Your IP Address:</strong> {ip}</p>
            </div>
        </section>
        <div style="text-align:center;">
            <a href="../../index.html" class="button">Back to Home</a>
        </div>
    </main>
    <footer><p>&copy; 2026 CSE 135 Team</p></footer>
</body>
</html>
""")
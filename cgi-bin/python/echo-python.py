#!/usr/bin/env python3
import os
import sys
import json
import urllib.parse
from datetime import datetime

print("Content-Type: text/html\r\n")

method = os.environ.get("REQUEST_METHOD", "GET")
content_type = os.environ.get("CONTENT_TYPE", "")
query_string = os.environ.get("QUERY_STRING", "")
ip = os.environ.get("REMOTE_ADDR", "unknown")
user_agent = os.environ.get("HTTP_USER_AGENT", "unknown")
now = datetime.now().strftime("%A, %B %d, %Y %I:%M:%S %p")

# Parse body for POST/PUT/DELETE
body = ""
params = {}

if method in ("POST", "PUT", "DELETE"):
    content_length = int(os.environ.get("CONTENT_LENGTH", 0))
    if content_length > 0:
        body = sys.stdin.read(content_length)

# Parse based on content type
raw_data = body if method != "GET" else query_string

if "application/json" in content_type and body:
    try:
        params = json.loads(body)
    except json.JSONDecodeError:
        params = {"error": "Invalid JSON"}
else:
    source = body if method != "GET" else query_string
    if source:
        params = urllib.parse.parse_qs(source, keep_blank_values=True)
        # Flatten single-value lists
        params = {k: v[0] if len(v) == 1 else v for k, v in params.items()}

# Build params table rows
params_rows = ""
if params:
    for key, val in sorted(params.items()):
        safe_key = str(key).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        safe_val = str(val).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        params_rows += f'<tr><td>{safe_key}</td><td>{safe_val}</td></tr>\n'
else:
    params_rows = '<tr><td colspan="2" style="color:#6b7280;font-style:italic;">No parameters received.</td></tr>'

safe_body = body.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") if body else "(empty)"
safe_qs = query_string.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") if query_string else "(empty)"
safe_ua = user_agent.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

method_color = {"GET": "#16a34a", "POST": "#2563eb", "PUT": "#d97706", "DELETE": "#dc2626"}.get(method, "#6b7280")

print(f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Echo - Python</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        .method-badge {{
            display: inline-block;
            background: {method_color};
            color: white;
            padding: 0.2rem 0.6rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: 600;
            font-family: monospace;
            margin-left: 0.5rem;
        }}
        table {{ width: 100%; border-collapse: collapse; background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }}
        th {{ background: #1e40af; color: white; text-align: left; padding: 0.75rem 1rem; font-size: 0.85rem; text-transform: uppercase; }}
        td {{ padding: 0.6rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }}
        tr:nth-child(even) {{ background: #f9fafb; }}
        td:first-child {{ color: #1e40af; font-weight: 600; width: 200px; }}
        .raw-box {{ background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: monospace; font-size: 0.85rem; word-break: break-all; margin-top: 0.5rem; }}
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Echo <span class="method-badge">{method}</span></h1>
            <p>Python CGI Demo</p>
        </div>
    </header>
    <main class="container">
        <!-- Request Info -->
        <section class="section-container">
            <div class="section-header"><h2>Request Details</h2></div>
            <table>
                <tr><td>Method</td><td>{method}</td></tr>
                <tr><td>Content-Type</td><td>{content_type if content_type else "(none)"}</td></tr>
                <tr><td>Query String</td><td><div class="raw-box">{safe_qs}</div></td></tr>
                <tr><td>Raw Body</td><td><div class="raw-box">{safe_body}</div></td></tr>
                <tr><td>Timestamp</td><td>{now}</td></tr>
                <tr><td>Your IP</td><td>{ip}</td></tr>
                <tr><td>User Agent</td><td>{safe_ua}</td></tr>
            </table>
        </section>

        <!-- Parsed Params -->
        <section class="section-container">
            <div class="section-header"><h2>Parsed Parameters</h2></div>
            <table>
                <tr><th>Name</th><th>Value</th></tr>
                {params_rows}
            </table>
        </section>

        <div style="text-align:center;">
            <a href="../../index.html" class="button">Back to Home</a>
        </div>
    </main>
    <footer><p>&copy; 2026 CSE 135 Team</p></footer>
</body>
</html>
""")
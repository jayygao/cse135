#!/usr/bin/env python3
import os
import json
from datetime import datetime

print("Content-Type: application/json\r\n")

now = datetime.now()

data = {
    "greeting": "Hello World!",
    "team": {
        "members": ["Jay", "Jesse"],
        "course": "CSE 135"
    },
    "language": "Python 3",
    "generated": {
        "datetime": now.strftime("%A, %B %d, %Y %I:%M:%S %p"),
        "iso": now.isoformat(),
        "epoch": int(now.timestamp())
    },
    "client": {
        "ip": os.environ.get("REMOTE_ADDR", "unknown"),
        "userAgent": os.environ.get("HTTP_USER_AGENT", "unknown")
    },
    "server": {
        "software": os.environ.get("SERVER_SOFTWARE", "unknown"),
        "name": os.environ.get("SERVER_NAME", "unknown")
    }
}

print(json.dumps(data, indent=4))
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Session storage (in-memory, file-backed for persistence)
const SESSION_FILE = "/tmp/cse135_node_sessions.json";
let sessions = {};

function loadSessions() {
    try {
        if (fs.existsSync(SESSION_FILE)) {
            sessions = JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
        }
    } catch (e) {
        sessions = {};
    }
}

function saveSessions() {
    try {
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions), "utf8");
    } catch (e) {
        console.error("Failed to save sessions:", e);
    }
}

loadSessions();

// Parse bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Also parse raw body for PUT/DELETE with urlencoded
app.use((req, res, next) => {
    if (["PUT", "DELETE"].includes(req.method) && !req.body) {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => {
            if (data) {
                const contentType = req.headers["content-type"] || "";
                if (contentType.includes("application/json")) {
                    try { req.body = JSON.parse(data); } catch(e) { req.body = {}; }
                } else {
                    const parsed = new URLSearchParams(data);
                    req.body = Object.fromEntries(parsed);
                }
            }
            next();
        });
    } else {
        next();
    }
});

// Shared HTML wrapper helpers
function header(title, subtitle) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="https://tidydata.online/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">`;
}

function pageHeader(title, subtitle) {
    return `
</head>
<body>
    <header>
        <div class="container">
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </div>
    </header>
    <main class="container">`;
}

function pageFooter() {
    return `
        <div style="text-align:center; margin-top: 2rem;">
            <a href="https://tidydata.online/index.html" class="button">Back to Home</a>
        </div>
    </main>
    <footer><p>&copy; 2026 CSE 135 Team</p></footer>
</body>
</html>`;
}

// ============================================================
// HELLO HTML
// ============================================================

app.get("/hello-html-nodejs", (req, res) => {
    const now = new Date().toLocaleString("en-US", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "numeric", minute: "numeric",
        second: "numeric", hour12: true
    });
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;

    res.send(`${header("Hello HTML - Node.js", "Node.js Express Demo")}

    ${pageHeader("Hello HTML World", "Node.js Express Demo")}
            <section class="section-container">
                <div class="section-header"><h2>Greeting</h2></div>
                <div style="background:white;border-radius:0.75rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);border:1px solid #e5e7eb;">
                    <p><strong>Hello World!</strong> Welcome to our Node.js Express demo!</p>
                    <p><strong>Team Members:</strong> Jay and Jesse</p>
                    <p><strong>Language:</strong> Node.js ${process.version}</p>
                    <p><strong>Generated At:</strong> ${now}</p>
                    <p><strong>Your IP Address:</strong> ${ip}</p>
                </div>
            </section>
    ${pageFooter()}`);
});

// ============================================================
// HELLO JSON
// ============================================================

app.get("/hello-json-nodejs", (req, res) => {
    const now = new Date();
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;

    res.json({
        greeting: "Hello World!",
        team: {
            members: ["Jay", "Jesse"],
            course: "CSE 135"
        },
        language: `Node.js ${process.version}`,
        generated: {
            datetime: now.toLocaleString("en-US", {
                weekday: "long", year: "numeric", month: "long",
                day: "numeric", hour: "numeric", minute: "numeric",
                second: "numeric", hour12: true
            }),
            iso: now.toISOString(),
            epoch: Math.floor(now.getTime() / 1000)
        },
        client: {
            ip: ip,
            userAgent: req.headers["user-agent"] || "unknown"
        },
        server: {
            software: `Express on Node.js ${process.version}`,
            name: req.hostname
        }
    });
});

// ============================================================
// ENVIRONMENT
// ============================================================

app.get("/environment-nodejs", (req, res) => {

    // Combine useful request info + process env
    const envVars = { ...process.env };
    // Add request-specific CGI-style vars
    envVars["REQUEST_METHOD"] = req.method;
    envVars["REQUEST_URL"] = req.originalUrl;
    envVars["REMOTE_ADDR"] = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
    envVars["HTTP_USER_AGENT"] = req.headers["user-agent"] || "";
    envVars["HTTP_HOST"] = req.headers["host"] || "";
    envVars["SERVER_NAME"] = req.hostname;
    envVars["SERVER_PORT"] = req.socket.localPort || "3000";
    envVars["NODE_VERSION"] = process.version;

    // Add all request headers
    for (const [key, val] of Object.entries(req.headers)) {
        envVars["HTTP_" + key.toUpperCase().replace(/-/g, "_")] = val;
    }

    const sorted = Object.keys(envVars).sort();

    let tableRows = "";
    for (const k of sorted) {
        const val = String(envVars[k]).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        tableRows += `
            <tr>
                <td>${k}</td>
                <td>${val}</td>
            </tr>`;
    }

    res.send(
        `${header("Environment Variables - Node.js", "Node.js Express Demo")}
        <style>
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            th { background: #1e40af; color: white; text-align: left; padding: 0.75rem 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 0.6rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
            tr:nth-child(even) { background: #f9fafb; }
            tr:hover { background: #eff6ff; }
            td:first-child { color: #1e40af; font-weight: 600; width: 260px; font-family: monospace; }
            .count { color: #6b7280; margin-top: 1rem; font-size: 0.85rem; }
        </style>
        
        ${pageHeader("Environment Variables", "Node.js Express Demo")}
                <section class="section-container">
                    <div class="section-header"><h2>CGI Environment</h2></div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Header</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <p class="count">Showing ${sorted.length} environment variables.</p>
                </section>
        ${pageFooter()}`
    );
});

// ============================================================
// ECHO - handles GET, POST, PUT, DELETE
// ============================================================

function echoHandler(req, res) {
    const method = req.method;
    const contentType = req.headers["content-type"] || "";
    const queryString = req.url.includes("?") ? req.url.split("?")[1] : "";
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;
    const userAgent = req.headers["user-agent"] || "unknown";
    const now = new Date().toLocaleString("en-US", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "numeric", minute: "numeric",
        second: "numeric", hour12: true
    });

    const params = req.body && Object.keys(req.body).length > 0
        ? req.body
        : (req.query && Object.keys(req.query).length > 0 ? req.query : {});

    const rawBody = typeof req.body === "object" && req.body !== null
        ? (contentType.includes("application/json") ? JSON.stringify(req.body, null, 2) : new URLSearchParams(req.body).toString())
        : "";

    const methodColors = { GET: "#16a34a", POST: "#2563eb", PUT: "#d97706", DELETE: "#dc2626" };
    const methodColor = methodColors[method] || "#6b7280";

    function esc(s) {
        return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    let paramRows = "";
    if (Object.keys(params).length > 0) {
        for (const [key, val] of Object.entries(params)) {
            paramRows += `<tr><td>${esc(key)}</td><td>${esc(typeof val === "object" ? JSON.stringify(val) : val)}</td></tr>`;
        }
    } else {
        paramRows = `<tr><td colspan="2" style="color:#6b7280;font-style:italic;">No parameters received.</td></tr>`;
    }

    res.send(`${header("Echo - Node.js", "Node.js Express Demo")}
    <style>
        .method-badge { display:inline-block; background:${methodColor}; color:white; padding:0.2rem 0.6rem; border-radius:1rem; font-size:0.8rem; font-weight:600; font-family:monospace; margin-left:0.5rem; }
        table { width:100%; border-collapse:collapse; background:white; border-radius:0.75rem; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); margin-bottom:1.5rem; }
        th { background:#1e40af; color:white; text-align:left; padding:0.75rem 1rem; font-size:0.85rem; text-transform:uppercase; }
        td { padding:0.6rem 1rem; border-bottom:1px solid #e5e7eb; font-size:0.9rem; }
        tr:nth-child(even) { background:#f9fafb; }
        td:first-child { color:#1e40af; font-weight:600; width:200px; }
        .raw-box { background:#f3f4f6; border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.75rem 1rem; font-family:monospace; font-size:0.85rem; word-break:break-all; margin-top:0.5rem; }
    </style>
${pageHeader(`Echo <span class="method-badge">${esc(method)}</span>`, "Node.js Express Demo")}
        <section class="section-container">
            <div class="section-header"><h2>Request Details</h2></div>
            <table>
                <tr><td>Method</td><td>${esc(method)}</td></tr>
                <tr><td>Content-Type</td><td>${contentType || "(none)"}</td></tr>
                <tr><td>Query String</td><td><div class="raw-box">${queryString ? esc(queryString) : "(empty)"}</div></td></tr>
                <tr><td>Raw Body</td><td><div class="raw-box">${rawBody ? esc(rawBody) : "(empty)"}</div></td></tr>
                <tr><td>Timestamp</td><td>${now}</td></tr>
                <tr><td>Your IP</td><td>${esc(ip)}</td></tr>
                <tr><td>User Agent</td><td>${esc(userAgent)}</td></tr>
            </table>
        </section>
        <section class="section-container">
            <div class="section-header"><h2>Parsed Parameters</h2></div>
            <table>
                <tr><th>Name</th><th>Value</th></tr>
                ${paramRows}
            </table>
        </section>
${pageFooter()}`);
}

app.get("/echo-nodejs", echoHandler);
app.post("/echo-nodejs", echoHandler);
app.put("/echo-nodejs", echoHandler);
app.delete("/echo-nodejs", echoHandler);

// ============================================================
// STATE - session management
// ============================================================

// Middleware to handle session cookie
function getSession(req, res) {
    let sid = null;
    const cookieHeader = req.headers.cookie || "";
    const cookies = cookieHeader.split(";").map(c => c.trim());
    for (const c of cookies) {
        if (c.startsWith("cse135_node_session=")) {
            sid = c.split("=")[1];
            break;
        }
    }
    if (!sid || !sessions[sid]) {
        sid = uuidv4();
        sessions[sid] = {};
        saveSessions();
    }
    // Set cookie
    res.setHeader("Set-Cookie", `cse135_node_session=${sid}; Path=/; HttpOnly`);
    return { sid, data: sessions[sid] };
}

// Save page (GET)
app.get("/state-nodejs", (req, res) => {
    const { data } = getSession(req, res);
    const action = req.query.action || "save";

    function esc(s) {
        return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    let content = "";

    if (action === "save") {
        content = `
        <div class="card">
            <h2>Save Your Data</h2>
            <p style="color:#6b7280;">Fill in the form below. Your data will be stored in a server-side session.</p>
            <form method="POST" action="/state-nodejs">
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
        </div>`;
    } else if (action === "view") {
        if (data.name) {
            content = `
        <div class="card">
            <h2>Your Saved Data</h2>
            <div class="data-row"><div class="data-label">Name</div><div class="data-value">${esc(data.name)}</div></div>
            <div class="data-row"><div class="data-label">Favorite Color</div><div class="data-value">${esc(data.favorite_color)}</div></div>
            <div class="data-row"><div class="data-label">Favorite Food</div><div class="data-value">${esc(data.favorite_food)}</div></div>
            <div class="data-row"><div class="data-label">Message</div><div class="data-value">${esc(data.message)}</div></div>
            <div class="data-row"><div class="data-label">Saved At</div><div class="data-value">${esc(data.saved_at)}</div></div>
            <div class="btn-row">
                <form method="POST" action="/state-nodejs" style="margin:0;">
                    <input type="hidden" name="action" value="clear">
                    <button type="submit" class="btn-danger">🗑️ Clear Data</button>
                </form>
                <a href="/state-nodejs?action=save" class="button">📝 Edit</a>
            </div>
        </div>`;
        } else {
            content = `<div class="empty-box">No data saved yet. <a href="/state-nodejs?action=save">Go save some data!</a></div>`;
        }
    }

    res.send(`${header("State Demo - Node.js", "Node.js Express Demo")}
    <style>
        .nav-links { display:flex; gap:0.75rem; margin-bottom:2rem; flex-wrap:wrap; }
        .nav-links a { background:white; border:1px solid #e5e7eb; padding:0.5rem 1rem; border-radius:0.5rem; text-decoration:none; color:#1e40af; font-weight:600; transition:all 0.2s; }
        .nav-links a:hover, .nav-links a.active { background:#1e40af; color:white; border-color:#1e40af; }
        .card { background:white; border-radius:0.75rem; padding:2rem; box-shadow:0 1px 3px rgba(0,0,0,0.1); border:1px solid #e5e7eb; margin-bottom:1.5rem; }
        label { display:block; font-weight:600; color:#374151; margin:1rem 0 0.3rem; }
        input, textarea { width:100%; padding:0.6rem 0.75rem; border:1px solid #d1d5db; border-radius:0.5rem; font-size:0.95rem; box-sizing:border-box; font-family:inherit; }
        input:focus, textarea:focus { outline:none; border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,0.15); }
        textarea { min-height:80px; resize:vertical; }
        .btn-row { display:flex; gap:0.75rem; margin-top:1.5rem; flex-wrap:wrap; }
        .btn-danger { background:#dc2626; color:white; padding:0.5rem 1rem; border:none; border-radius:0.5rem; cursor:pointer; font-size:0.9rem; font-weight:600; }
        .btn-danger:hover { background:#b91c1c; }
        .success-box { background:#f0fdf4; border:1px solid #86efac; border-radius:0.5rem; padding:1rem; color:#166534; margin-bottom:1rem; }
        .empty-box { background:#f9fafb; border:1px solid #e5e7eb; border-radius:0.5rem; padding:1.5rem; color:#6b7280; text-align:center; font-style:italic; }
        .data-row { display:flex; padding:0.6rem 0; border-bottom:1px solid #f3f4f6; }
        .data-label { font-weight:600; color:#1e40af; width:160px; flex-shrink:0; }
        .data-value { color:#374151; }
    </style>
${pageHeader("State Demo", "Node.js Express Demo")}
        <div class="nav-links">
            <a href="/state-nodejs?action=save" class="${action === 'save' ? 'active' : ''}">📝 Save Data</a>
            <a href="/state-nodejs?action=view" class="${action === 'view' ? 'active' : ''}">👀 View Data</a>
        </div>
        ${content}
${pageFooter()}`);
});

// State POST handler
app.post("/state-nodejs", (req, res) => {
    const { sid } = getSession(req, res);
    const action = req.body.action || "save";

    if (action === "save") {
        sessions[sid] = {
            name: req.body.name || "",
            favorite_color: req.body.favorite_color || "",
            favorite_food: req.body.favorite_food || "",
            message: req.body.message || "",
            saved_at: new Date().toLocaleString("en-US", {
                weekday: "long", year: "numeric", month: "long",
                day: "numeric", hour: "numeric", minute: "numeric",
                second: "numeric", hour12: true
            })
        };
        saveSessions();
        // Show success then redirect
        res.setHeader("Set-Cookie", `cse135_node_session=${sid}; Path=/; HttpOnly`);
        res.redirect("/state-nodejs?action=view");
    } else if (action === "clear") {
        delete sessions[sid];
        sessions[sid] = {};
        saveSessions();
        res.setHeader("Set-Cookie", `cse135_node_session=${sid}; Path=/; HttpOnly`);
        res.redirect("/state-nodejs?action=save");
    } else {
        res.redirect("/state-nodejs");
    }
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`CSE 135 Node.js app running on port ${PORT}`);
});
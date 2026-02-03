<?php
$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
$contentType = $_SERVER["CONTENT_TYPE"] ?? "";
$queryString = $_SERVER["QUERY_STRING"] ?? "";
$ip = $_SERVER["REMOTE_ADDR"] ?? "unknown";
$userAgent = $_SERVER["HTTP_USER_AGENT"] ?? "unknown";
$now = date("l, F j, Y g:i:s A");

// Read raw body
$body = "";
if (in_array($method, ["POST", "PUT", "DELETE"])) {
    $body = file_get_contents("php://input");
}

// Parse params
$params = [];
if (str_contains($contentType, "application/json") && $body !== "") {
    $decoded = json_decode($body, true);
    if (is_array($decoded)) {
        $params = $decoded;
    } else {
        $params = ["error" => "Invalid JSON"];
    }
} else {
    $source = ($method === "GET") ? $queryString : $body;
    if ($source !== "") {
        parse_str($source, $params);
    }
}

$methodColors = [
    "GET" => "#16a34a",
    "POST" => "#2563eb",
    "PUT" => "#d97706",
    "DELETE" => "#dc2626"
];
$methodColor = $methodColors[$method] ?? "#6b7280";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Echo - PHP</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        .method-badge {
            display: inline-block;
            background: <?= $methodColor ?>;
            color: white;
            padding: 0.2rem 0.6rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: 600;
            font-family: monospace;
            margin-left: 0.5rem;
        }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
        th { background: #1e40af; color: white; text-align: left; padding: 0.75rem 1rem; font-size: 0.85rem; text-transform: uppercase; }
        td { padding: 0.6rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
        tr:nth-child(even) { background: #f9fafb; }
        td:first-child { color: #1e40af; font-weight: 600; width: 200px; }
        .raw-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: monospace; font-size: 0.85rem; word-break: break-all; margin-top: 0.5rem; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Echo <span class="method-badge"><?= htmlspecialchars($method) ?></span></h1>
            <p>PHP CGI Demo</p>
        </div>
    </header>
    <main class="container">
        <!-- Request Info -->
        <section class="section-container">
            <div class="section-header"><h2>Request Details</h2></div>
            <table>
                <tr><td>Method</td><td><?= htmlspecialchars($method) ?></td></tr>
                <tr><td>Content-Type</td><td><?= $contentType !== "" ? htmlspecialchars($contentType) : "(none)" ?></td></tr>
                <tr><td>Query String</td><td><div class="raw-box"><?= $queryString !== "" ? htmlspecialchars($queryString) : "(empty)" ?></div></td></tr>
                <tr><td>Raw Body</td><td><div class="raw-box"><?= $body !== "" ? htmlspecialchars($body) : "(empty)" ?></div></td></tr>
                <tr><td>Timestamp</td><td><?= $now ?></td></tr>
                <tr><td>Your IP</td><td><?= htmlspecialchars($ip) ?></td></tr>
                <tr><td>User Agent</td><td><?= htmlspecialchars($userAgent) ?></td></tr>
            </table>
        </section>

        <!-- Parsed Params -->
        <section class="section-container">
            <div class="section-header"><h2>Parsed Parameters</h2></div>
            <table>
                <tr><th>Name</th><th>Value</th></tr>
                <?php if (count($params) > 0): ?>
                    <?php foreach ($params as $key => $val): ?>
                    <tr>
                        <td><?= htmlspecialchars((string)$key) ?></td>
                        <td><?= htmlspecialchars(is_array($val) ? json_encode($val) : (string)$val) ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr><td colspan="2" style="color:#6b7280;font-style:italic;">No parameters received.</td></tr>
                <?php endif; ?>
            </table>
        </section>

        <div style="text-align:center;">
            <a href="../index.html" class="button">Back to Home</a>
        </div>
    </main>
    <footer><p>&copy; 2026 CSE 135 Team</p></footer>
</body>
</html>
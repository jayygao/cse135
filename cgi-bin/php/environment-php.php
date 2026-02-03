<?php
$vars = $_SERVER;
ksort($vars);
$count = 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Environment Variables - PHP</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th { background: #1e40af; color: white; text-align: left; padding: 0.75rem 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 0.6rem 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #eff6ff; }
        td:first-child { color: #1e40af; font-weight: 600; width: 260px; font-family: monospace; }
        .count { color: #6b7280; margin-top: 1rem; font-size: 0.85rem; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Environment Variables</h1>
            <p>PHP CGI Demo</p>
        </div>
    </header>
    <main class="container">
        <section class="section-container">
            <div class="section-header"><h2>CGI Environment</h2></div>
            <table>
                <tr><th>Variable</th><th>Value</th></tr>
                <?php foreach ($vars as $key => $val): ?>
                    <?php if (is_string($val) && ($val !== "")): ?>
                        <?php $count++; ?>
                        <tr>
                            <td><?= htmlspecialchars($key) ?></td>
                            <td><?= htmlspecialchars($val) ?></td>
                        </tr>
                    <?php endif; ?>
                <?php endforeach; ?>
            </table>
            <p class="count">Showing <?= $count ?> environment variables.</p>
        </section>
        <div style="text-align:center;">
            <a href="../../index.html" class="button">Back to Home</a>
        </div>
    </main>
    <footer><p>&copy; 2026 CSE 135 Team</p></footer>
</body>
</html>
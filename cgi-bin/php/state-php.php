<?php
session_start();

$action = $_GET["action"] ?? "save";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $action = $_POST["action"] ?? "save";

    if ($action === "save") {
        $_SESSION["name"] = $_POST["name"] ?? "";
        $_SESSION["favorite_color"] = $_POST["favorite_color"] ?? "";
        $_SESSION["favorite_food"] = $_POST["favorite_food"] ?? "";
        $_SESSION["message"] = $_POST["message"] ?? "";
        $_SESSION["saved_at"] = date("l, F j, Y g:i:s A");
        $action = "saved";
    } elseif ($action === "clear") {
        session_destroy();
        session_start();
        $action = "cleared";
    }
}

function esc($s) {
    return htmlspecialchars((string)$s, ENT_QUOTES, "UTF-8");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>State Demo - PHP</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        .nav-links { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .nav-links a { background: white; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; color: #1e40af; font-weight: 600; transition: all 0.2s; }
        .nav-links a:hover, .nav-links a.active { background: #1e40af; color: white; border-color: #1e40af; }
        .card { background: white; border-radius: 0.75rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
        label { display: block; font-weight: 600; color: #374151; margin: 1rem 0 0.3rem; }
        input, textarea { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.95rem; box-sizing: border-box; font-family: inherit; }
        input:focus, textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        textarea { min-height: 80px; resize: vertical; }
        .btn-row { display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; }
        .btn-danger { background: #dc2626; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 600; }
        .btn-danger:hover { background: #b91c1c; }
        .success-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.5rem; padding: 1rem; color: #166534; margin-bottom: 1rem; }
        .empty-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; color: #6b7280; text-align: center; font-style: italic; }
        .data-row { display: flex; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }
        .data-label { font-weight: 600; color: #1e40af; width: 160px; flex-shrink: 0; }
        .data-value { color: #374151; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>State Demo</h1>
            <p>PHP - Native Sessions</p>
        </div>
    </header>
    <main class="container">
        <div class="nav-links">
            <a href="state-php.php?action=save" class="<?= in_array($action, ['save','saved']) ? 'active' : '' ?>">📝 Save Data</a>
            <a href="state-php.php?action=view" class="<?= $action === 'view' ? 'active' : '' ?>">👀 View Data</a>
        </div>

        <?php if ($action === "saved"): ?>
            <div class="success-box">✅ Data saved successfully! <a href="state-php.php?action=view">View your saved data →</a></div>
        <?php endif; ?>

        <?php if ($action === "cleared"): ?>
            <div class="success-box">🗑️ Data cleared successfully! <a href="state-php.php?action=save">Save new data →</a></div>
        <?php endif; ?>

        <?php if (in_array($action, ["save", "saved"])): ?>
        <!-- SAVE FORM -->
        <div class="card">
            <h2>Save Your Data</h2>
            <p style="color:#6b7280;">Fill in the form below. Your data will be stored in a server-side session.</p>
            <form method="POST" action="state-php.php">
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

        <?php elseif ($action === "view"): ?>
        <!-- VIEW PAGE -->
        <div class="card">
            <?php if (isset($_SESSION["name"])): ?>
                <h2>Your Saved Data</h2>
                <div class="data-row"><div class="data-label">Name</div><div class="data-value"><?= esc($_SESSION["name"]) ?></div></div>
                <div class="data-row"><div class="data-label">Favorite Color</div><div class="data-value"><?= esc($_SESSION["favorite_color"]) ?></div></div>
                <div class="data-row"><div class="data-label">Favorite Food</div><div class="data-value"><?= esc($_SESSION["favorite_food"]) ?></div></div>
                <div class="data-row"><div class="data-label">Message</div><div class="data-value"><?= esc($_SESSION["message"]) ?></div></div>
                <div class="data-row"><div class="data-label">Saved At</div><div class="data-value"><?= esc($_SESSION["saved_at"]) ?></div></div>
                <div class="btn-row">
                    <form method="POST" action="state-php.php" style="margin:0;">
                        <input type="hidden" name="action" value="clear">
                        <button type="submit" class="btn-danger">🗑️ Clear Data</button>
                    </form>
                    <a href="state-php.php?action=save" class="button">📝 Edit</a>
                </div>
            <?php else: ?>
                <div class="empty-box">No data saved yet. <a href="state-php.php?action=save">Go save some data!</a></div>
            <?php endif; ?>
        </div>

        <?php endif; ?>

        <div style="text-align:center; margin-top: 2rem;">
            <a href="../index.html" class="button">Back to Home</a>
        </div>
    </main>
    <footer><p>&copy; 2026 CSE 135 Team</p></footer>
</body>
</html>
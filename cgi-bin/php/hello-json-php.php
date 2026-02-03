<?php
    header("Content-Type: application/json");

    $now = new DateTime();
    $version = phpversion();

    $data = [
        "greeting" => "Hello World!",
        "team" => [
            "members" => ["Jay", "Jesse"],
            "course" => "CSE 135"
        ],
        "language" => "PHP" . " " . $version,
        "generated" => [
            "datetime" => $now->format("l, F d, Y g:i:s A"),
            "iso" => $now->format("c"),
            "epoch" => $now->getTimestamp()
        ],
        "client" => [
            "ip" => $_SERVER["REMOTE_ADDR"] ?? "unknown",
            "userAgent" => $_SERVER["HTTP_USER_AGENT"] ?? "unknown"
        ],
        "server" => [
            "software" => $_SERVER["SERVER_SOFTWARE"] ?? "unknown",
            "name" => $_SERVER["SERVER_NAME"] ?? "unknown"
        ]
    ];

    echo json_encode($data, JSON_PRETTY_PRINT);
?>

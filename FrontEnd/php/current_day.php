<?php
// =========================
// CURRENT DAY SUMMARY ENDPOINT
// =========================
// Returns today's date, number of openings, and all opening/closing times as JSON.

header('Content-Type: application/json');

$db_path = '/var/lib/database/club_room_data.db';

// Connect to SQLite database
try {
    $db = new SQLite3($db_path);
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Get today's date in d-m-Y format
$today = date('d-m-Y');

// Look up today's date ID in the database
$stmt = $db->prepare("SELECT id FROM dates WHERE date = :today");
if (!$stmt) {
    echo json_encode(['error' => 'Failed to prepare date lookup: ' . $db->lastErrorMsg()]);
    exit();
}
$stmt->bindValue(':today', $today, SQLITE3_TEXT);
$results = $stmt->execute();
$row = $results->fetchArray(SQLITE3_ASSOC);

// If no record for today, return empty summary
if ($row) {
    $date_id = $row['id'];
} else {
    echo json_encode([
        'date' => $today,
        'numOfOpenings' => 0,
        'openings' => []
    ]);
    exit();
}

// Fetch all opening/closing times for today
$stmt2 = $db->prepare('SELECT opening_time, closing_time FROM openings WHERE date_id = :date_id');
if (!$stmt2) {
    echo json_encode(['error' => 'Failed to prepare openings lookup: ' . $db->lastErrorMsg()]);
    exit();
}
$stmt2->bindValue(':date_id', $date_id, SQLITE3_INTEGER);
$results2 = $stmt2->execute();

$openings = [];
while ($row2 = $results2->fetchArray(SQLITE3_ASSOC)) {
    $openings[] = [
        'opened' => $row2['opening_time'],
        'closed' => $row2['closing_time']
    ];
}

// Output today's summary as JSON
echo json_encode([
    'date' => $today,
    'numOfOpenings' => count($openings),
    'openings' => $openings
]);
?>

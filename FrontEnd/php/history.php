<?php
// =========================
// HISTORY DATA ENDPOINT
// =========================
// Returns all dates and their opening/closing times as JSON for charting.

header('Content-Type: application/json');

$db_path = '/var/lib/database/club_room_data.db';

// Connect to SQLite database
try {
    $db = new SQLite3($db_path);
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Query all dates (ordered by ID)
$date_query = 'SELECT id, date FROM dates ORDER BY id ASC';
$date_results = $db->query($date_query);

$all_data = ['dates' => []];

// For each date, fetch all opening/closing times
while ($date_row = $date_results->fetchArray(SQLITE3_ASSOC)) {
    $date_id = $date_row['id'];
    $date_str = $date_row['date'];

    $stmt = $db->prepare('SELECT opening_time, closing_time FROM openings WHERE date_id = :date_id');
    if (!$stmt) {
        echo json_encode(['error' => 'Failed to prepare openings lookup for date ID ' . $date_id . ': ' . $db->lastErrorMsg()]);
        exit();
    }
    $stmt->bindValue(':date_id', $date_id, SQLITE3_INTEGER);
    $results = $stmt->execute();

    $openings = [];
    while ($opening_row = $results->fetchArray(SQLITE3_ASSOC)) {
        $openings[] = [
            'opened' => $opening_row['opening_time'],
            'closed' => $opening_row['closing_time']
        ];
    }

    $all_data['dates'][] = [
        'date' => $date_str,
        'openings' => $openings
    ];
}

// Output all historical data as JSON
echo json_encode($all_data);
?>

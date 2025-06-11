<?php
// =========================
// CURRENT STATUS ENDPOINT
// =========================
// Returns the latest door status as JSON, with headers to prevent caching.

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Expires: 0');
header('Pragma: no-cache');

// Output the contents of the current_status.json file
echo file_get_contents('../js/current_status.json');
?>
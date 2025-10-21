<?php
// Server-Sent Events endpoint to stream site_status changes
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', 0);

$db = getenv('DATABASE_URL') ?: null;
if (!$db) {
    http_response_code(500);
    echo json_encode(['error' => 'DATABASE_URL not configured']);
    exit;
}

$parts = parse_url($db);
$host = $parts['host'] ?? 'localhost';
$port = $parts['port'] ?? '5432';
$user = $parts['user'] ?? '';
$pass = $parts['pass'] ?? '';
$dbname = isset($parts['path']) ? ltrim($parts['path'], '/') : '';

$conn_str = sprintf("host=%s port=%s dbname=%s user=%s password=%s", $host, $port, $dbname, $user, $pass);
$conn = @pg_connect($conn_str);
if (!$conn) {
    http_response_code(500);
    echo "event: error\ndata: Could not connect to database\n\n";
    flush();
    exit;
}

// Listen on a channel 'status_changes' - you can trigger with: NOTIFY status_changes, 'payload';
pg_query($conn, "LISTEN status_changes;");

// Send heartbeat immediately
echo "event: heartbeat\ndata: ping\n\n";
flush();

while (!connection_aborted()) {
    // wait for notifications with a 10s timeout
    $result = pg_get_notify($conn, PGSQL_ASSOC);
    if ($result) {
        foreach ($result as $notify) {
            // fetch the latest status row
            $res = pg_query_params($conn, 'SELECT id, is_open, updated_by, updated_at FROM public.site_status WHERE id=$1', array(1));
            $row = $res ? pg_fetch_assoc($res) : null;
            if ($row && isset($row['is_open'])) {
                $row['is_open'] = ($row['is_open'] === 't' || $row['is_open'] === '1' || $row['is_open'] === true) ? true : false;
            }
            echo "event: status\n";
            echo 'data: ' . json_encode($row) . "\n\n";
            flush();
        }
    }
    // sleep a bit to avoid busy loop
    usleep(200000); // 200ms
}

?>

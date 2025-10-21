<?php
header('Content-Type: application/json');

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
    echo json_encode(['error' => 'Could not connect to database']);
    exit;
}

$res = pg_query_params($conn, 'SELECT id, is_open, updated_by, updated_at FROM public.site_status WHERE id=$1', array(1));
if (!$res) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed']);
    exit;
}
$row = pg_fetch_assoc($res);

if (!$row) {
    // return a sensible default
    echo json_encode(['id' => null, 'is_open' => null]);
} else {
    // normalize boolean
    if (isset($row['is_open'])) {
        $row['is_open'] = ($row['is_open'] === 't' || $row['is_open'] === '1' || $row['is_open'] === true) ? true : false;
    }
    echo json_encode($row);
}

?>

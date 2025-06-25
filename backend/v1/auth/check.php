<?php
require_once('../dbconnect.php');

$headers = getallheaders();
$token = $headers['Authorization'] ?? '';

if (!$token) {
  http_response_code(401);
  echo json_encode(['message' => 'No autoritzat']);
  exit;
}

// Utilitza la connexió establerta a dbconnect.php
global $conn;

$stmt = $conn->prepare("SELECT user_id FROM festa_users WHERE reset_token = ? AND token_expires_at > NOW()");
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
  http_response_code(401);
  echo json_encode(['message' => 'Token invàlid o expirat']);
  exit;
}

echo json_encode(['message' => 'Accés concedit']);
?>

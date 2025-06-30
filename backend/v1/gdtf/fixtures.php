<?php
// ATENCIÓ: Assegura't que la ruta a dbconnect.php és correcta
require_once('../../dbconnect.php');

// --- Punt d'Entrada de l'Script ---

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? sanitize($_GET['action']) : null;

if ($method === 'GET') {
  if (!$action) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetre 'action' requerit per a GET."]);
    exit;
  }
  switch ($action) {
    case 'getFixtures':
      getFixtures($conn);
      break;
    default:
      http_response_code(404);
      echo json_encode(["message" => "Acció GET invàlida."]);
      break;
  }
  exit;
};

function getFixtures($conn) {
  return null;
}

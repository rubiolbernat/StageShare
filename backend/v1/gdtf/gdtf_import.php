<?php
require_once('..dbconnect.php');
define('GDTF_UPLOAD_DIR', '../assets/uploads/gdtf/');
// Funció per netejar les dades
function sanitize($data)
{
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

// Funció per controlar si la petició és OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = null; // Inicialitza

// --- Gestió de Peticions GET ---
if ($method === 'GET') {
  $action = isset($_GET['action']) ? sanitize($_GET['action']) : null; // Sanitize action

  if (!$action) {
    http_response_code(400);
    echo json_encode(["message" => "Paràmetre 'action' requerit per a GET."]);
    exit;
  }

  switch ($action) {
    case 'updatedb':
      updateGdtfDB($conn); // Aquesta funció hauria de fer l'echo/exit
      break; // break és bona pràctica tot i l'exit intern
    default:
      http_response_code(404); // Not Found per acció invàlida
      echo json_encode(["message" => "Acció GET invàlida."]);
      break;
  }
  exit; // Exit general per a GET si les funcions no ho fan
}

function updateGdtfDB($conn)
{
  $needGdtf[] = [];

  // 1st check biggest lastModified
  $stmt = $conn->prepare("SELECT MAX(last_modified) AS lastModified FROM fixtures WHERE gdtf_rid IS NOT NULL");
  $stmt->execute();
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $biggestLastModified = $row['lastModified'] ?? null;

  // 2n update db
  $url = 'https://gdtf-share.com/apis/public/getList.php';

  $response = file_get_contents($url);
  $data = json_decode($response, true);
  if (isset($data['list'])) {
    $gdtfList = $data['list'];
    foreach ($gdtfList as $item) {
      $rid = $item['rid'] ?? null;
      $fixture = isset($item['fixture']) ? addslashes($item['fixture']) : null;
      $manufacturer = isset($item['manufacturer']) ? addslashes($item['manufacturer']) : null;
      $revision = isset($item['revision']) ? addslashes($item['revision']) : null;
      $creationDate = isset($item['creationDate']) ? addslashes($item['creationDate']) : null;
      $lastModified = isset($item['lastModified']) ? addslashes($item['lastModified']) : null;
      $uploader = isset($item['uploader']) ? addslashes($item['uploader']) : null;
      $rating = isset($item['rating']) ? (float) $item['rating'] : null;
      $version = isset($item['version']) ? addslashes($item['version']) : null;
      $creator = isset($item['creator']) ? addslashes($item['creator']) : null;
      $uuid = isset($item['uuid']) ? addslashes($item['uuid']) : null;
      $modes = isset($item['modes']) ? addslashes($item['modes']) : null;
      $filesize = isset($item['filesize']) ? (int) $item['filesize'] : null;

      // Guardar a una llista els que tenen un modified posterior al més gran de la bd

      if ($lastModified > $biggestLastModified) {
        $needGdtf . array_push($needGdtf, [
          'rid' => $rid
        ]);
      }

      // Inserir o actualitzar a la base de dades

    }
  }


}

?>

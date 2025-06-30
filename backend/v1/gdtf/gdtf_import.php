<?php
// ATENCIÓ: Assegura't que la ruta a dbconnect.php és correcta
require_once('../../dbconnect.php');

// --- Configuració ---
define('GDTF_UPLOAD_DIR', 'C:/xampp/htdocs/StageShare/assets/uploads/gdtf/');
define('GDTF_URL_LIST', 'https://gdtf-share.com/apis/public/getList.php');
define('GDTF_URL_DOWNLOAD', 'https://gdtf-share.com/apis/public/downloadFile.php');
define('GDTF_LOGIN_URL', 'https://gdtf-share.com/apis/public/login.php');
define('SESSION_FILE', __DIR__ . '/session.txt');

// --- Credencials ---
// És recomanable usar variables d'entorn en producció
define('GDTF_USERNAME', 'username'); // Canvia-ho pel teu nom d'usuari
define('GDTF_PASSWORD', 'password'); // Canvia-ho per la teva contrasenya

// Augmenta el límit de temps d'execució per a aquest script d'importació massiva
set_time_limit(0);


// --- Funcions Auxiliars ---

function sanitize($data)
{
  return htmlspecialchars(stripslashes(trim($data)));
}

function gdtfLogin()
{
  $data = json_encode(['user' => GDTF_USERNAME, 'password' => GDTF_PASSWORD]);
  $ch = curl_init(GDTF_LOGIN_URL);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
  curl_setopt($ch, CURLOPT_COOKIEJAR, SESSION_FILE);

  $response = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($httpCode !== 200) {
    throw new Exception("Login fallit, HTTP $httpCode. Resposta: $response");
  }
  $json = json_decode($response, true);
  if (!$json || empty($json['result'])) {
    if (file_exists(SESSION_FILE))
      unlink(SESSION_FILE);
    throw new Exception("Login incorrecte: " . ($json['error'] ?? 'Resposta desconeguda.'));
  }
}

function gdtfAuthenticatedGet($url)
{
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_COOKIEFILE, SESSION_FILE);
  $response = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($httpCode !== 200) {
    throw new Exception("Petició GET fallida a $url, HTTP $httpCode. Resposta: $response");
  }
  return $response;
}

function deleteDir($dirPath)
{
  if (!is_dir($dirPath))
    return;
  $files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($dirPath, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST
  );
  foreach ($files as $file) {
    $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
  }
  rmdir($dirPath);
}

// --- Funció Principal d'Importació ---

function updateGdtfDB($conn)
{
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  try {
    gdtfLogin();
  } catch (Exception $e) { /*...*/
  }

  $stmt = $conn->prepare("SELECT MAX(last_modified) AS maxLocalLastModified FROM gdtf_fixtures");
  $stmt->execute();
  $maxLocalLastModified = $stmt->fetch(PDO::FETCH_ASSOC)['maxLocalLastModified'] ?? 0;

  try {
    $response = gdtfAuthenticatedGet(GDTF_URL_LIST);
    $data = json_decode($response, true);
    if (!isset($data['list']) || !is_array($data['list'])) {
      throw new Exception('Resposta invàlida de l\'API GDTF.');
    }
  } catch (Exception $e) { /*...*/
  }

  $inserted = 0;
  $updated = 0;

  foreach ($data['list'] as $item) {
    $apiLastModified = $item['lastModified'] ?? 0;
    $rid = $item['rid'];

    if ($apiLastModified > $maxLocalLastModified) {
      $conn->beginTransaction();
      try {
        // --- 1. DESCARREGA I PROCESSAMENT DEL FITXER ---
        $binaryData = gdtfAuthenticatedGet(GDTF_URL_DOWNLOAD . "?rid=" . urlencode($rid));
        $zipFilePath = GDTF_UPLOAD_DIR . $rid . '.gdtf';
        file_put_contents($zipFilePath, $binaryData);
        $extractPath = GDTF_UPLOAD_DIR . $rid;
        if (is_dir($extractPath))
          deleteDir($extractPath);
        mkdir($extractPath, 0777, true);
        $zip = new ZipArchive;
        if ($zip->open($zipFilePath) === TRUE) {
          $zip->extractTo($extractPath);
          $zip->close();
          unlink($zipFilePath);
        } else {
          throw new Exception("No es pot descomprimir el ZIP del RID: $rid");
        }
        $xml = simplexml_load_file($extractPath . "/description.xml");
        if (!$xml || !isset($xml->FixtureType))
          throw new Exception("XML invàlid pel RID: $rid");

        // --- 2. GUARDAT DEL FIXTURE PRINCIPAL ---
        $thumbnailFilename = (string) $xml->FixtureType['Thumbnail'];
        $params = [
          ':rid' => $rid,
          ':name' => $item['fixture'] ?? '',
          ':manufacturer' => $item['manufacturer'] ?? '',
          ':revision' => $item['revision'] ?? null,
          ':creation_date' => $item['creationDate'] ?? null,
          ':last_modified' => $apiLastModified,
          ':uploader' => $item['uploader'] ?? null,
          ':rating' => ($item['rating'] !== 'N/A') ? (float) $item['rating'] : null,
          ':version' => $item['version'] ?? null,
          ':creator' => $item['creator'] ?? null,
          ':uuid' => $item['uuid'] ?? null,
          ':filesize' => $item['filesize'] ?? null,
          ':thumbnail' => !empty($thumbnailFilename) ? ($rid . '/' . $thumbnailFilename) : null
        ];
        $stmt = $conn->prepare("SELECT id FROM gdtf_fixtures WHERE rid = :rid");
        $stmt->execute([':rid' => $rid]);
        if ($existing = $stmt->fetch(PDO::FETCH_ASSOC)) {
          $fixture_id = $existing['id'];
          $params[':id'] = $fixture_id;
          $sql = "UPDATE gdtf_fixtures SET name=:name, manufacturer=:manufacturer, revision=:revision, creation_date=:creation_date, last_modified=:last_modified, uploader=:uploader, rating=:rating, version=:version, creator=:creator, uuid=:uuid, filesize=:filesize, thumbnail=:thumbnail WHERE id=:id";
          $conn->prepare($sql)->execute($params);
          $updated++;
        } else {
          $sql = "INSERT INTO gdtf_fixtures (rid, name, manufacturer, revision, creation_date, last_modified, uploader, rating, version, creator, uuid, filesize, thumbnail) VALUES (:rid, :name, :manufacturer, :revision, :creation_date, :last_modified, :uploader, :rating, :version, :creator, :uuid, :filesize, :thumbnail)";
          $conn->prepare($sql)->execute($params);
          $fixture_id = $conn->lastInsertId();
          $inserted++;
        }

        // --- 3. PROCESSAMENT DE MODES I CANALS ---
        if ($fixture_id && isset($xml->FixtureType->DMXModes)) {
          $conn->prepare("DELETE FROM gdtf_modes WHERE fixture_id = ?")->execute([$fixture_id]);
          foreach ($xml->FixtureType->DMXModes->DMXMode as $dmxMode) {
            $footprint = 0;
            if (isset($dmxMode->DMXChannels->DMXChannel)) {
              foreach ($dmxMode->DMXChannels->DMXChannel as $dmxChannel) {
                $offsets = explode(',', (string) $dmxChannel['Offset']);
                foreach ($offsets as $offset)
                  if ((int) $offset > $footprint)
                    $footprint = (int) $offset;
              }
            }
            $stmtInsertMode = $conn->prepare("INSERT INTO gdtf_modes (fixture_id, name, description, dmx_footprint) VALUES (?, ?, ?, ?)");
            $stmtInsertMode->execute([$fixture_id, (string) $dmxMode['Name'], (string) ($dmxMode['Description'] ?? ''), $footprint]);
            $modeId = $conn->lastInsertId();

            if ($modeId && isset($dmxMode->DMXChannels->DMXChannel)) {
              foreach ($dmxMode->DMXChannels->DMXChannel as $dmxChannel) {
                $offsets = explode(',', (string) $dmxChannel['Offset']);
                $byteSize = count($offsets);
                $attribute = isset($dmxChannel->LogicalChannel[0]) ? (string) ($dmxChannel->LogicalChannel[0]['Attribute'] ?? 'Undefined') : 'Undefined';
                $channelName = (string) ($dmxChannel['Name'] ?? $attribute);

                foreach ($offsets as $i => $channelOffset) {
                  $isFine = ($i > 0);
                  $finalAttribute = $attribute;
                  $finalName = $channelName;

                  if ($isFine) {
                    // La teva lògica de sufixos, restaurada i integrada correctament
                    $suffix = match ($byteSize) {
                      2 => ' (Fine)',
                      3 => [' (Fine)', ' (Ultra)'][$i - 1],
                      4 => [' (Fine)', ' (Ultra)', ' (Uber)'][$i - 1],
                      default => ' (Fine ' . ($i) . ')'
                    };
                    $finalAttribute .= $suffix;
                    $finalName .= $suffix;
                  }

                  $stmtInsertChannel = $conn->prepare("INSERT INTO gdtf_channels (mode_id, channel_number, name, attribute) VALUES (?, ?, ?, ?)");
                  $stmtInsertChannel->execute([$modeId, (int) $channelOffset, $finalName, $finalAttribute]);
                }
              }
            }
          }
        }
        $conn->commit();
      } catch (Exception $e) {
        $conn->rollBack();
        error_log("ERROR RID $rid: " . $e->getMessage() . " a " . $e->getFile() . ":" . $e->getLine());
      }
    }
  }
  echo json_encode(['success' => true, 'inserted' => $inserted, 'updated' => $updated, 'message' => "Procés completat."]);
}

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
    case 'updatedb':
      if (!is_dir(GDTF_UPLOAD_DIR))
        mkdir(GDTF_UPLOAD_DIR, 0777, true);
      if (!is_writable(GDTF_UPLOAD_DIR)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => "El directori " . GDTF_UPLOAD_DIR . " no té permisos d'escriptura."]);
        exit;
      }
      updateGdtfDB($conn);
      break;
    default:
      http_response_code(404);
      echo json_encode(["message" => "Acció GET invàlida."]);
      break;
  }
  exit;
}
?>

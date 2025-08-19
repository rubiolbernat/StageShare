<?php
// ATENCIÓ: Assegura't que la ruta a dbconnect.php és correcta
require_once('../../dbconnect.php');

// Si la petició és de tipus OPTIONS (preflight request), acaba aquí.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  exit(0);
}

// =================================================================
// FUNCIÓ D'AJUDA PER OBTENIR FIXTURES COMPLETS
// =================================================================
/**
 * Obté les dades completes de fixtures (amb modes i canals) a partir d'una llista de IDs de fixture.
 * @param PDO $conn L'objecte de connexió a la BD. // <-- CANVIAT (només comentari)
 * @param array $fixtureIds Un array amb els IDs dels fixtures a obtenir.
 * @return array L'array de fixtures amb la seva estructura niuada.
 */
function fetchFullFixturesByIds(PDO $conn, array $fixtureIds): array // <-- CANVIAT
{
  if (empty($fixtureIds)) {
    return [];
  }

  $placeholders = implode(',', array_fill(0, count($fixtureIds), '?'));

  $sql = "
        SELECT
            f.id AS fixture_id, f.rid, f.name AS fixture_name, f.manufacturer, f.revision, f.creation_date,
            f.last_modified, f.uploader, f.rating, f.version, f.creator, f.uuid, f.filesize, f.thumbnail,
            m.id AS mode_id, m.name AS mode_name, m.description AS mode_description, m.dmx_footprint,
            c.id AS channel_id, c.channel_number, c.geometry AS geometry, c.attribute
        FROM
            gdtf_fixtures f
        LEFT JOIN
            gdtf_modes m ON f.id = m.fixture_id
        LEFT JOIN
            gdtf_channels c ON m.id = c.mode_id
        WHERE
            f.id IN ($placeholders)
        ORDER BY
            f.id, m.id, c.channel_number
    ";

  $stmt = $conn->prepare($sql); // <-- CANVIAT
  $stmt->execute($fixtureIds);
  $rows = $stmt->fetchAll();

  // ... (la resta de la funció no canvia, ja que no utilitza la variable de connexió)
  $fixtures = [];
  foreach ($rows as $row) {
    $fixtureId = $row['fixture_id'];
    if (!isset($fixtures[$fixtureId])) {
      $fixtures[$fixtureId] = [
        'id' => (int) $fixtureId,
        'rid' => (int) $row['rid'],
        'name' => $row['fixture_name'],
        'manufacturer' => $row['manufacturer'],
        'revision' => $row['revision'],
        'creation_date' => $row['creation_date'] ? (int) $row['creation_date'] : null,
        'last_modified' => $row['last_modified'] ? (int) $row['last_modified'] : null,
        'uploader' => $row['uploader'],
        'rating' => $row['rating'] ? (float) $row['rating'] : null,
        'version' => $row['version'],
        'creator' => $row['creator'],
        'uuid' => $row['uuid'],
        'filesize' => $row['filesize'] ? (int) $row['filesize'] : null,
        'thumbnail' => $row['thumbnail'],
        'modes' => []
      ];
    }

    $modeId = $row['mode_id'];
    if ($modeId && !isset($fixtures[$fixtureId]['modes'][$modeId])) {
      $fixtures[$fixtureId]['modes'][$modeId] = [
        'id' => (int) $modeId,
        'fixture_id' => (int) $fixtureId,
        'name' => $row['mode_name'],
        'description' => $row['mode_description'],
        'dmx_footprint' => (int) $row['dmx_footprint'],
        'channels' => []
      ];
    }

    $channelId = $row['channel_id'];
    if ($channelId) {
      $fixtures[$fixtureId]['modes'][$modeId]['channels'][] = [
        'id' => (int) $channelId,
        'mode_id' => (int) $modeId,
        'channel_number' => (int) $row['channel_number'],
        'geometry' => $row['geometry'],
        'attribute' => $row['attribute']
      ];
    }
  }

  $result = array_values($fixtures);
  foreach ($result as &$fixture) {
    $fixture['modes'] = array_values($fixture['modes']);
  }

  return $result;
}

// =================================================================
// ROUTER PRINCIPAL
// =================================================================
$action = $_GET['action'] ?? '';

switch ($action) {
  case 'getFixtures':
    try {
      $sql = "SELECT id FROM gdtf_fixtures WHERE 1=1";
      $params = [];

      if (!empty($_GET['name'])) {
        $sql .= " AND name LIKE ?";
        $params[] = '%' . $_GET['name'] . '%';
      }
      if (!empty($_GET['manufacturer'])) {
        $sql .= " AND manufacturer LIKE ?";
        $params[] = '%' . $_GET['manufacturer'] . '%';
      }
      if (!empty($_GET['creator'])) {
        $sql .= " AND creator LIKE ?";
        $params[] = '%' . $_GET['creator'] . '%';
      }

      $sql .= " LIMIT 50";

      $stmt = $conn->prepare($sql); // <-- CANVIAT
      $stmt->execute($params);
      $fixtureIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

      $fixturesData = fetchFullFixturesByIds($conn, $fixtureIds); // <-- CANVIAT

      echo json_encode($fixturesData);

    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al buscar fixtures: ' . $e->getMessage()]);
    }
    break;

  case 'getFixturesByChannels':
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      http_response_code(405);
      echo json_encode(['error' => 'Aquesta acció requereix el mètode POST.']);
      break;
    }

    try {
      $input = json_decode(file_get_contents('php://input'), true);
      $channels = $input['channels'] ?? [];

      if (empty($channels)) {
        echo json_encode([]);
        break;
      }

      $conditions = [];
      $params = [];
      foreach ($channels as $channel) {
        $sub_conditions = [];
        if (!empty($channel['channel_number'])) {
          $sub_conditions[] = "channel_number = ?";
          $params[] = $channel['channel_number'];
        }
        if (!empty($channel['attribute'])) {
          $sub_conditions[] = "attribute LIKE ?";
          $params[] = '%' . $channel['attribute'] . '%';
        }
        if (!empty($channel['name'])) {
          $sub_conditions[] = "name LIKE ?";
          $params[] = '%' . $channel['name'] . '%';
        }
        if (!empty($sub_conditions)) {
          $conditions[] = "(" . implode(' AND ', $sub_conditions) . ")";
        }
      }

      if (empty($conditions)) {
        echo json_encode([]);
        break;
      }

      $sql = "
                SELECT m.fixture_id
                FROM gdtf_channels c
                JOIN gdtf_modes m ON c.mode_id = m.id
                WHERE " . implode(' OR ', $conditions) . "
                GROUP BY m.id
                HAVING COUNT(m.id) >= ?
            ";
      $params[] = count($conditions);

      $stmt = $conn->prepare($sql); // <-- CANVIAT
      $stmt->execute($params);
      $fixtureIds = array_unique($stmt->fetchAll(PDO::FETCH_COLUMN));

      $fixturesData = fetchFullFixturesByIds($conn, $fixtureIds); // <-- CANVIAT

      echo json_encode($fixturesData);

    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al buscar fixtures per canals: ' . $e->getMessage()]);
    }
    break;

  case 'getFixtureDownload':
    try {
      $rid = $_GET['rid'] ?? null;
      if (!$rid) {
        http_response_code(400);
        echo json_encode(['error' => "El paràmetre 'rid' és obligatori."]);
        break;
      }

      $stmt = $conn->prepare("SELECT name, manufacturer FROM gdtf_fixtures WHERE rid = ?"); // <-- CANVIAT
      $stmt->execute([$rid]);
      $fixture = $stmt->fetch();

      if (!$fixture) {
        http_response_code(404);
        echo json_encode(['error' => "No s'ha trobat cap fixture amb el rid '$rid'."]);
        break;
      }

      $filePath = __DIR__ . '/gdtf_files/' . $rid . '.gdtf';

      if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['error' => "El fitxer per al rid '$rid' no existeix al servidor."]);
        break;
      }

      header_remove("Content-Type");
      header_remove("Access-Control-Allow-Origin");

      $fileName = preg_replace('/[^a-zA-Z0-9-_\.]/', '', $fixture['manufacturer'] . '_' . $fixture['name']) . '.gdtf';

      header('Content-Description: File Transfer');
      header('Content-Type: application/octet-stream');
      header('Content-Disposition: attachment; filename="' . $fileName . '"');
      header('Expires: 0');
      header('Cache-Control: must-revalidate');
      header('Pragma: public');
      header('Content-Length: ' . filesize($filePath));

      flush();
      readfile($filePath);
      exit();

    } catch (Exception $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Error al descarregar el fixture: ' . $e->getMessage()]);
    }
    break;

  default:
    http_response_code(404);
    echo json_encode(['error' => 'Acció no vàlida.']);
    break;
}
?>

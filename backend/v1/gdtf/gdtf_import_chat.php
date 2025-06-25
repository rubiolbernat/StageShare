<?php
/**
 * import_gdtf.php  – v2
 *
 * Funcions principals:
 *   1.  (Opcional) Consulta una API per RID → obté metadata (lastModified) i URL de descàrrega.
 *       - Si el RID no existeix a la BD, o la data remote lastModified és més nova que la guardada,
 *         baixa el fitxer .gdtf.
 *   2.  Descomprimeix el .gdtf en una carpeta pròpia i elimina el fitxer original.
 *   3.  Extreu info (fixture, modes, canals) amb SimpleXML.
 *   4.  Insereix/actualitza a MySQL seguint l'esquema fixtures → modes → channels.
 *
 * Ús bàsic (fitxer local):
 *   php import_gdtf.php --file=RobeSpiider.gdtf \
 *        --db_host=localhost --db_user=root --db_pass=secret --db_name=lighting
 *
 * Ús via API (RID):
 *   php import_gdtf.php --rid=12345 \
 *        --api_meta="https://example.com/api/fixture/%d" \
 *        --api_download="https://example.com/api/fixture/%d/download" \
 *        --api_token=ABCDEF [...]  (opcional)  + paràmetres BD
 */

ini_set('display_errors', 'On');
error_reporting(E_ALL);

// -------------- Helpers bàsics --------------------------------------------
function cli_error(string $msg): void { fwrite(STDERR, "Error: $msg\n"); exit(1);}
function ensure_ext(string $path, string $ext): void { if (strtolower(pathinfo($path, PATHINFO_EXTENSION))!==$ext) cli_error("El fitxer ha de ser .$ext"); }

// -------------- CLI -------------------------------------------------------
$options = getopt("", [
  "file::", "rid::", "output_dir::",
  "api_meta::", "api_download::", "api_token::",
  "db_host::", "db_port::", "db_user::", "db_pass::", "db_name::"
]);

if (!isset($options['file']) && !isset($options['rid'])) {
  cli_error("Cal --file=FITXER.gdtf o bé --rid=RID");
}

$dbHost = $options['db_host'] ?? null; // BD opcional
$needDb = $dbHost !== null;

// -------------- Connexió MySQL (si cal) ----------------------------------
$pdo = null;
if ($needDb) {
  $dbDsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4",
                   $dbHost,
                   (int)($options['db_port'] ?? 3306),
                   $options['db_name'] ?? cli_error('Falta --db_name'));
  try {
    $pdo = new PDO($dbDsn, $options['db_user'] ?? cli_error('Falta --db_user'), $options['db_pass'] ?? '', [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
  } catch (PDOException $e) { cli_error("Connexió BD fallida: " . $e->getMessage()); }
}

// -------------- Si rebem RID: demana meta + descarrega si cal -------------
$localFile = null;
if (isset($options['rid'])) {
  $rid = (int)$options['rid'];
  $apiMetaTpl     = $options['api_meta']     ?? 'https://example.com/api/fixture/%d';
  $apiDownloadTpl = $options['api_download'] ?? 'https://example.com/api/fixture/%d/download';
  $apiToken       = $options['api_token']    ?? null; // header Authorization: Bearer

  $metaUrl = sprintf($apiMetaTpl, $rid);
  $ctx = stream_context_create([
    'http' => [
      'header' => $apiToken ? "Authorization: Bearer $apiToken\r\n" : ''
    ]
  ]);
  $metaJson = @file_get_contents($metaUrl, false, $ctx);
  if ($metaJson === false) cli_error("No es pot obtenir metadata de $metaUrl");
  $meta = json_decode($metaJson, true);
  if (!$meta) cli_error("Resposta JSON invàlida des de meta API");

  $remoteLastMod = isset($meta['lastModified']) ? strtotime($meta['lastModified']) : null;
  $downloadUrl   = $meta['downloadUrl']        ?? sprintf($apiDownloadTpl, $rid);

  $shouldDownload = true;
  if ($needDb) {
    $stmt = $pdo->prepare("SELECT last_modified FROM fixtures WHERE gdtf_rid=?");
    $stmt->execute([$rid]);
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $localTs = $row['last_modified'] ? strtotime($row['last_modified']) : 0;
      if ($remoteLastMod && $remoteLastMod <= $localTs) {
        echo "[INFO] No hi ha actualització: lastModified remot <= local.\n";
        $shouldDownload = false;
      }
    }
  }

  if (!$shouldDownload) exit(0);

  echo "[INFO] Descarregant .gdtf del RID $rid...\n";
  $tmpFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "fixture_$rid.gdtf";
  $ctxD = stream_context_create([
    'http' => [
      'header' => $apiToken ? "Authorization: Bearer $apiToken\r\n" : ''
    ]
  ]);
  if (!copy($downloadUrl, $tmpFile, $ctxD)) cli_error("No s'ha pogut descarregar $downloadUrl");
  $localFile = $tmpFile;
  $options['file'] = $tmpFile; // per la resta de flux
  echo "[INFO] Fitxer descarregat a $tmpFile\n";
}

// -------------- Descompressió de .gdtf -----------------------------------
if (isset($options['file'])) {
  $gdtfPath = realpath($options['file']);
  if (!$gdtfPath || !file_exists($gdtfPath)) cli_error('No trobo el fitxer .gdtf');
  ensure_ext($gdtfPath, 'gdtf');

  $outputDir = $options['output_dir'] ?? dirname($gdtfPath);
  $destDir   = rtrim($outputDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . pathinfo($gdtfPath, PATHINFO_FILENAME);
  if (!is_dir($destDir) && !mkdir($destDir, 0755, true)) cli_error('No puc crear el directori de destí');

  $zip = new ZipArchive();
  if ($zip->open($gdtfPath) !== true) cli_error('No s\'ha pogut obrir ZIP');
  $zip->extractTo($destDir);
  $zip->close();
  echo "[INFO] Descomprimit a $destDir\n";
  unlink($gdtfPath);
}

// -------------- Localitzar XML principal ----------------------------------
$xmlMain = null;
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($destDir));
foreach ($it as $f) {
  if ($f->isFile() && strtolower($f->getExtension()) === 'xml') {
    $xml = @simplexml_load_file($f->getPathname());
    if ($xml && ($xml->getName()==='FixtureType' || isset($xml->FixtureType))) { $xmlMain=$f->getPathname(); break; }
  }
}
if (!$xmlMain) cli_error('No s\'ha trobat XML principal <FixtureType>');
$xml = simplexml_load_file($xmlMain);

$fixtureName  = (string)($xml['ShortName'] ?? $xml->ShortName ?? '');
$manufacturer = (string)($xml['Manufacturer'] ?? $xml->Manufacturer ?? '');
$revision     = (string)($xml['FixtureMode'] ?? $xml->FixtureMode ?? '');

$modes = [];
foreach ($xml->xpath('.//DMXMode') as $m) {
  $mName = (string)$m['Name'];
  $chs=[]; foreach ($m->xpath('.//DMXChannel') as $ch) {
    $addr = (int)$ch['Address'];
    $attr = ($ch->LogicalChannel->Attribute['Name'] ?? 'UNKNOWN');
    $chs[]=['number'=>$addr,'attribute'=>(string)$attr];
  }
  $modes[]=['name'=>$mName,'channels'=>$chs];
}

// -------------- Inserció a BD (si cal) ------------------------------------
if ($needDb) {
  // Fixture (amb gdtf_rid si s'ha passat)
  $stmtSel = $pdo->prepare('SELECT id FROM fixtures WHERE manufacturer=? AND name=?');
  $stmtSel->execute([$manufacturer,$fixtureName]);
  $fixtureId=$stmtSel->fetchColumn();
  if(!$fixtureId){
    $stmtIns=$pdo->prepare('INSERT INTO fixtures (gdtf_rid,name,manufacturer,revision,creation_date,last_modified,gdtf_file_url) VALUES (?,?,?,?,NOW(),NOW(),?)');
    $stmtIns->execute([$options['rid']??null,$fixtureName,$manufacturer,$revision,'']);
    $fixtureId=$pdo->lastInsertId();
  }else{
    $pdo->prepare('UPDATE fixtures SET last_modified=NOW() WHERE id=?')->execute([$fixtureId]);
  }

  // Modes i canals
  $selMode=$pdo->prepare('SELECT id FROM modes WHERE fixture_id=? AND name=?');
  $insMode=$pdo->prepare('INSERT INTO modes (fixture_id,name,physical_channels) VALUES (?,?,?)');
  $insCh =$pdo->prepare('INSERT INTO channels (mode_id,channel_number,name,attribute) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE attribute=VALUES(attribute)');
  foreach($modes as $md){
    $selMode->execute([$fixtureId,$md['name']]);
    $modeId=$selMode->fetchColumn();
    if(!$modeId){
      $insMode->execute([$fixtureId,$md['name'],count($md['channels'])]);
      $modeId=$pdo->lastInsertId();
    }
    foreach($md['channels'] as $ch){
      $insCh->execute([$modeId,$ch['number'],'Ch'.$ch['number'],$ch['attribute']]);
    }
  }
  echo "[DB] Sincronització completada.\n";
}

?>

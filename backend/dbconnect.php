<?php
require_once('restrictions.php');
require_once('credentials.php');

$dbuser = defined('DB_USER') ? DB_USER : '';
$dbpassword = defined('DB_PASSWORD') ? DB_PASSWORD : '';
$dbname = defined('DB_NAME') ? DB_NAME : '';
$dbhost = defined('DB_HOST') ? DB_HOST : 'localhost';

try {
  $conn = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpassword);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(array("message" => "Error connecting to the database: " . $e->getMessage()));
  exit();
}
?>

<?php
require_once('../restrictions.php');
require_once('../dbconnect.php');
// Si és una sol·licitud OPTIONS, simplement retornem un codi 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Log al principi del script
error_log("register.php: Inici d'execució");


// Log per veure les dades rebudes (JSON input)
$postData = file_get_contents('php://input');
error_log("register.php: Dades rebudes (JSON): " . $postData);

$data = json_decode($postData);

if (!isset($data->name) || !isset($data->email) || !isset($data->password)) {
  http_response_code(400);
  error_log("register.php: Falten dades (name, email, password)");
  echo json_encode(['message' => 'Falten dades']);
  exit;
}

$name = trim($data->name);
$email = trim($data->email);
$password = $data->password;

if (empty($name) || empty($email) || empty($password)) {
  http_response_code(400);
  error_log("register.php: Els camps no poden estar buits");
  echo json_encode(['message' => 'Els camps no poden estar buits']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  error_log("register.php: Format de correu electrònic invàlid");
  echo json_encode(['message' => 'Format de correu electrònic invàlid']);
  exit;
}

// Utilitza la connexió establerta a dbconnect.php
global $conn;

if (!$conn) {
  http_response_code(500);
  error_log("register.php: No s'ha pogut connectar a la base de dades");
  echo json_encode(['message' => "No s'ha pogut connectar a la base de dades"]);
  exit;
}

// Check if the email already exists
$stmt = $conn->prepare("SELECT user_id FROM festa_users WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
  http_response_code(409);
  error_log("register.php: Aquest correu ja està registrat");
  echo json_encode(['message' => 'Aquest correu ja està registrat']);
  exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
  $conn->beginTransaction(); // Inicia la transacción

  $stmt = $conn->prepare("INSERT INTO festa_users (name, email, password) VALUES (?, ?, ?)");
  $stmt->execute([$name, $email, $hashedPassword]);
  $userId = $conn->lastInsertId();
  error_log("register.php: Usuari inserit correctament amb ID: " . $userId);

  $conn->commit(); // Commit la transacción

  http_response_code(201);
  echo json_encode(['message' => 'Usuari registrat correctament']);
  error_log("register.php: Usuari registrat correctament");

} catch (PDOException $e) {
  $conn->rollBack(); // Anula la transacción en caso de error
  http_response_code(500);
  error_log("register.php: Error al registrar l'usuari: " . $e->getMessage());
  echo json_encode(['message' => 'Error al registrar l\'usuari: ' . $e->getMessage()]);
}

?>

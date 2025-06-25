<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('../dbconnect.php');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Mètode no permès']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Falten dades']);
    exit;
}

$email = trim($data->email);
$password = $data->password;

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Els camps no poden estar buits']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Format de correu electrònic invàlid']);
    exit;
}

global $conn;

try {
    // Obtenim les dades de l'usuari
    $stmt = $conn->prepare("SELECT user_id, name, password FROM festa_users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['message' => 'Credencials invàlides']);
        exit;
    }

    // Obtenim els rols de l'usuari
    $userId = $user['user_id'];
    $stmt = $conn->prepare("SELECT r.role_name FROM roles r INNER JOIN user_roles ur ON r.role_id = ur.role_id WHERE ur.user_id = ?");
    $stmt->execute([$userId]);
    $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Generem els tokens
    $accessToken = bin2hex(random_bytes(32)); // Token de 64 caràcters
    $refreshToken = bin2hex(random_bytes(64)); // Refresh token més llarg

    // Guardem el refresh token a la base de dades
    $stmt = $conn->prepare("UPDATE festa_users SET refresh_token = ?, token_expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE user_id = ?");
    $stmt->execute([$refreshToken, $userId]);

    // Retornem la resposta amb els tokens generats
    http_response_code(200);
    echo json_encode([
        'accessToken' => $accessToken,
        'refreshToken' => $refreshToken,
        'user' => [
            'id' => $userId,
            'name' => $user['name'],
            'roles' => $roles
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Error al iniciar sessió: ' . $e->getMessage()]);
}
?>

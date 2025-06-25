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

if (!isset($data->refreshToken)) {
    http_response_code(400);
    echo json_encode(['message' => 'Falta el refresh token']);
    exit;
}

$refreshToken = $data->refreshToken;

global $conn;

try {
    // Busquem el refresh token a la base de dades
    $stmt = $conn->prepare("SELECT user_id FROM festa_users WHERE refresh_token = ? AND token_expires_at > NOW()");
    $stmt->execute([$refreshToken]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['message' => 'Refresh token invàlid o expirat']);
        exit;
    }

    $userId = $user['user_id'];

    // Obtenim els rols de l'usuari
    $stmt = $conn->prepare("SELECT r.role_name FROM roles r INNER JOIN user_roles ur ON r.role_id = ur.role_id WHERE ur.user_id = ?");
    $stmt->execute([$userId]);
    $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Generem nous tokens
    $newAccessToken = bin2hex(random_bytes(32));
    $newRefreshToken = bin2hex(random_bytes(64));

    // Actualitzem el refresh token a la base de dades
    $stmt = $conn->prepare("UPDATE festa_users SET refresh_token = ?, token_expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE user_id = ?");
    $stmt->execute([$newRefreshToken, $userId]);

    // Retornem la resposta amb els nous tokens
    http_response_code(200);
    echo json_encode([
        'accessToken' => $newAccessToken,
        'refreshToken' => $newRefreshToken,
        'user' => [
            'id' => $userId,
            'roles' => $roles
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Error al refrescar el token: ' . $e->getMessage()]);
}
?>

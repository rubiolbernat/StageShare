<?php
header("Access-Control-Allow-Origin: *"); // Permetre accés des de qualsevol origen
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Permetre els mètodes necessaris
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Permetre les capçaleres necessàries
header("Access-Control-Max-Age: 3600"); // Cache de les opcions CORS durant 1 hora
header('Content-Type: application/json'); // Definir el tipus de contingut de la resposta

/*
$production = true;  // Indica si estàs en producció o no

if ($production) {
    // Configuració per a producció: Origen específic i restriccions CORS
    $allowedOrigin = 'https://stageshare.com'; // Domini de l'app Angular en producció
} else {
    // Configuració per a desenvolupament: Permetre accés des de qualsevol origen (per comoditat)
    $allowedOrigin = '*'; // PERILLÓS: MAI facis servir * en producció
}

if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    if ($origin === $allowedOrigin || $allowedOrigin === '*') { // Permetre l'origen específic O qualsevol origen en dev
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');  // Important per cookies
    } else {
        http_response_code(403);
        echo json_encode(["message" => "Accés prohibit des d'aquest origen."]);
        exit();
    }
} else {
    // Gestionar les peticions sense Origin (per exemple, des del mateix servidor)
    // Aquí pots permetre les peticions des del mateix servidor o bloquejar-les
    http_response_code(403); // Per ser més segur, bloqueja les peticions sense Origin
    echo json_encode(["message" => "Accés prohibit: Capçalera Origin absent."]);
    exit();
}
*/
// ... la resta del teu codi de l'API
?>

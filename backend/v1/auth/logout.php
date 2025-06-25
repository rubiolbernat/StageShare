<?php
// auth/logout.php
session_start();
session_destroy();

echo json_encode(['message' => 'Has fet logout']);
?>

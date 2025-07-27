<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'login':
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
        
        if ($username === 'admin' && $password === 'cynic2025') {
            $_SESSION['authenticated'] = true;
            echo json_encode(['success' => true, 'message' => 'Login successful']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
        break;
        
    case 'test':
        if (isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
            echo json_encode(['success' => true, 'message' => 'Authenticated']);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        }
        break;
        
    case 'stats':
        if (!isset($_SESSION['authenticated']) || !$_SESSION['authenticated']) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            break;
        }
        
        // Mock server statistics
        $stats = [
            'cpu' => rand(10, 95),
            'memory' => rand(20, 90),
            'disk' => rand(15, 85),
            'network' => rand(5, 50),
            'services' => [
                'nginx' => rand(0, 10) > 1 ? 'running' : 'stopped',
                'redis' => rand(0, 10) > 1 ? 'running' : 'stopped',
                'mysql' => rand(0, 10) > 1 ? 'running' : 'stopped',
                'wings' => rand(0, 10) > 1 ? 'running' : 'stopped',
                'docker' => rand(0, 10) > 1 ? 'running' : 'stopped'
            ]
        ];
        
        echo json_encode(['success' => true, 'data' => $stats]);
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}
?>
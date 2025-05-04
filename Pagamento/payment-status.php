<?php
// Configurações iniciais
header('Content-Type: application/json; charset=utf-8');

// Carregar as variáveis de ambiente
$dotenv_path = __DIR__ . '/../.env';
if (file_exists($dotenv_path)) {
    $lines = file($dotenv_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
            putenv(sprintf('%s=%s', trim($key), trim($value)));
        }
    }
}

// Configuração do Mercado Pago
$access_token = getenv('MERCADO_PAGO_ACCESS_TOKEN') ?: 'APP_USR-5435895231544021-030913-1e50c34dcf8d44979782a3c66a834496-433958110';
$public_key = getenv('MERCADO_PAGO_PUBLIC_KEY') ?: 'APP_USR-e00cb746-fa99-43d6-9aa3-3c998fa3d5f3';

// Verificar qual operação está sendo solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Rota para fornecer a chave pública do Mercado Pago
if ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($path, '/mercadopago-config') !== false) {
    echo json_encode([
        'publicKey' => $public_key
    ]);
    exit;
}

// Rota para verificar o status de um pagamento
if ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($path, '/payment-status/') !== false) {
    // Extrair o ID do pagamento da URL
    $parts = explode('/', $path);
    $payment_id = end($parts);
    
    if (empty($payment_id)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'ID de pagamento não fornecido',
            'details' => 'É necessário fornecer um ID de pagamento válido'
        ]);
        exit;
    }
    
    // Inicializar cURL para fazer a requisição à API do Mercado Pago
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, "https://api.mercadopago.com/v1/payments/{$payment_id}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $access_token,
        'Content-Type: application/json'
    ]);
    
    // Executar a requisição
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // Verificar se houve erro na requisição
    if (curl_errno($ch)) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro na comunicação com o Mercado Pago',
            'details' => curl_error($ch)
        ]);
        curl_close($ch);
        exit;
    }
    
    curl_close($ch);
    
    // Processar a resposta
    $payment_response = json_decode($response, true);
    
    if ($http_code >= 400 || !isset($payment_response['status'])) {
        http_response_code($http_code ?: 500);
        echo json_encode([
            'error' => 'Erro ao verificar status do pagamento',
            'details' => $payment_response['message'] ?? 'Erro ao obter informações do pagamento'
        ]);
        exit;
    }
    
    // Retornar o status do pagamento
    echo json_encode([
        'payment_id' => $payment_id,
        'status' => $payment_response['status'],
        'status_detail' => $payment_response['status_detail'],
        'is_approved' => $payment_response['status'] === 'approved'
    ]);
    exit;
}

// Se chegou aqui, a rota não foi encontrada
http_response_code(404);
echo json_encode([
    'error' => 'Rota não encontrada',
    'details' => 'A rota solicitada não existe'
]);
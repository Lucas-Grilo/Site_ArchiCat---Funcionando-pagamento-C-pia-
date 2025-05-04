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

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido', 'details' => 'Apenas requisições POST são aceitas']);
    exit;
}

// Obter os dados enviados pelo cliente
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Verificar se os dados necessários estão presentes
if (!isset($data['transaction_amount']) || !isset($data['payer']) || !isset($data['payer']['identification'])) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Dados incompletos',
        'details' => 'Verifique se todos os campos obrigatórios foram enviados'
    ]);
    exit;
}

// Criar objeto de pagamento com os parâmetros corretos
$payment_data = [
    'transaction_amount' => (float) $data['transaction_amount'],
    'description' => $data['description'] ?? 'Produtos ArchiCat',
    'payment_method_id' => 'pix',
    'payer' => [
        'email' => $data['payer']['email'],
        'first_name' => $data['payer']['first_name'],
        'last_name' => $data['payer']['last_name'],
        'identification' => [
            'type' => $data['payer']['identification']['type'],
            'number' => $data['payer']['identification']['number']
        ]
    ]
];

// Inicializar cURL para fazer a requisição à API do Mercado Pago
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://api.mercadopago.com/v1/payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payment_data));
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

if ($http_code >= 400 || !isset($payment_response['point_of_interaction'])) {
    http_response_code($http_code ?: 500);
    echo json_encode([
        'error' => 'Erro ao processar o pagamento',
        'details' => $payment_response['message'] ?? 'Erro ao gerar o PIX'
    ]);
    exit;
}

// Retornar os dados do pagamento
echo json_encode([
    'payment_id' => $payment_response['id'],
    'status' => $payment_response['status'],
    'qrCodeBase64' => $payment_response['point_of_interaction']['transaction_data']['qr_code_base64'],
    'pixCode' => $payment_response['point_of_interaction']['transaction_data']['qr_code'],
    'transactionAmount' => $payment_response['transaction_amount'],
    'dateOfExpiration' => $payment_response['date_of_expiration']
]);
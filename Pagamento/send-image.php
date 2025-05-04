<?php
// Configurações iniciais
header('Content-Type: application/json; charset=utf-8');

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido', 'details' => 'Apenas requisições POST são aceitas']);
    exit;
}

// Obter os dados enviados pelo cliente
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Verificar se há dados na requisição
if (empty($data)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Dados incompletos',
        'details' => 'Nenhum dado recebido'
    ]);
    exit;
}

// Registrar que recebeu a solicitação
// Em um ambiente de produção, você pode querer salvar a imagem em um diretório
// ou processá-la de alguma forma

// Responder com sucesso - o processamento real da imagem acontece na rota send-email.php
echo json_encode([
    'success' => true,
    'message' => 'Imagem processada com sucesso'
]);
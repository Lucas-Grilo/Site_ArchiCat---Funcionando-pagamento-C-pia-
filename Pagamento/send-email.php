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

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido', 'details' => 'Apenas requisições POST são aceitas']);
    exit;
}

// Obter os dados enviados pelo cliente
$json_data = file_get_contents('php://input');
$userData = json_decode($json_data, true);

// Verificar se os dados necessários estão presentes
if (!isset($userData['nome']) || !isset($userData['email'])) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Dados incompletos',
        'details' => 'Verifique se todos os campos obrigatórios foram enviados'
    ]);
    exit;
}

// Configuração do email
$email_password = getenv('EMAIL_PASSWORD');
if (!$email_password) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Configuração incompleta',
        'details' => 'A senha do email não está configurada no arquivo .env'
    ]);
    exit;
}

// Preparar os dados do email
$to = $userData['email'];
$subject = 'Confirmação de Compra - ArchiCat';

// Construir o corpo do email em HTML
$message = '<html><body>';
$message .= '<h1>Obrigado por sua compra!</h1>';
$message .= '<p>Olá ' . htmlspecialchars($userData['nome']) . ',</p>';
$message .= '<p>Recebemos seu pedido e estamos processando seu pagamento.</p>';

// Adicionar detalhes do pedido se disponíveis
if (isset($userData['valor'])) {
    $message .= '<h2>Detalhes do Pedido:</h2>';
    $message .= '<p>Valor: R$ ' . htmlspecialchars($userData['valor']) . '</p>';
}

// Adicionar a imagem do projeto se disponível
if (isset($userData['imageData']) && !empty($userData['imageData'])) {
    // Converter a imagem base64 para um arquivo temporário
    $image_data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $userData['imageData']));
    $temp_file = tempnam(sys_get_temp_dir(), 'archicat_');
    file_put_contents($temp_file, $image_data);
    
    $message .= '<h2>Seu Projeto:</h2>';
    $message .= '<p>Segue anexo a imagem do seu projeto personalizado.</p>';
}

$message .= '<p>Se você tiver alguma dúvida, entre em contato conosco respondendo a este email.</p>';
$message .= '<p>Atenciosamente,<br>Equipe ArchiCat</p>';
$message .= '</body></html>';

// Cabeçalhos do email
$headers = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
$headers .= 'From: ArchiCat <contato.archicat@gmail.com>' . "\r\n";
$headers .= 'Reply-To: contato.archicat@gmail.com' . "\r\n";

// Configuração para usar o PHPMailer (recomendado para produção)
// Para este exemplo, usaremos a função mail() nativa do PHP
// Em produção, é recomendado usar o PHPMailer ou outra biblioteca

// Tentar enviar o email
$mail_sent = mail($to, $subject, $message, $headers);

// Verificar se o email foi enviado com sucesso
if ($mail_sent) {
    // Se houver uma imagem anexada, enviar um segundo email com o anexo
    if (isset($userData['imageData']) && !empty($userData['imageData'])) {
        // Em produção, use PHPMailer para anexar a imagem corretamente
        // Este é apenas um exemplo simplificado
        $boundary = md5(time());
        
        $headers_attachment = 'MIME-Version: 1.0' . "\r\n";
        $headers_attachment .= 'From: ArchiCat <contato.archicat@gmail.com>' . "\r\n";
        $headers_attachment .= 'Reply-To: contato.archicat@gmail.com' . "\r\n";
        $headers_attachment .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
        
        $message_attachment = "--$boundary\r\n";
        $message_attachment .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message_attachment .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $message_attachment .= chunk_split(base64_encode($message)) . "\r\n";
        
        // Anexar a imagem
        $message_attachment .= "--$boundary\r\n";
        $message_attachment .= "Content-Type: image/png; name=\"seu_projeto.png\"\r\n";
        $message_attachment .= "Content-Transfer-Encoding: base64\r\n";
        $message_attachment .= "Content-Disposition: attachment; filename=\"seu_projeto.png\"\r\n\r\n";
        $message_attachment .= chunk_split(base64_encode($image_data)) . "\r\n";
        $message_attachment .= "--$boundary--";
        
        // Enviar o email com anexo
        mail($to, $subject . ' (com anexo)', $message_attachment, $headers_attachment);
        
        // Remover o arquivo temporário
        if (file_exists($temp_file)) {
            unlink($temp_file);
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Email enviado com sucesso'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Falha ao enviar email',
        'details' => 'Não foi possível enviar o email. Verifique as configurações do servidor.'
    ]);
}
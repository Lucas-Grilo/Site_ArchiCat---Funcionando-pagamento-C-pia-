<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento Concluído</title>
  <link rel="shortcut icon" href="img/icon2.ico">
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background-color: #e8d674;
    }
    .success-container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .success-message {
      color: #28a745;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    .back-button {
      background-color: #242659;
      color: white;
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      font-size: 1rem;
    }
    .back-button:hover {
      background-color: #1a1b40;
    }
  </style>
</head>
<body>
  <div class="success-container">
    <h1 class="success-message">Pagamento Concluído com Sucesso!</h1>
    <p>Obrigado por sua compra. Em breve você receberá um e-mail com os detalhes do pedido.</p>
    <a href="../index.html" class="back-button">Voltar para a Página Inicial</a>
  </div>
  
  <?php
  // Registrar o sucesso do pagamento em um log (opcional)
  $log_file = __DIR__ . '/../logs/payments.log';
  $log_dir = dirname($log_file);
  
  // Criar diretório de logs se não existir
  if (!file_exists($log_dir)) {
    mkdir($log_dir, 0755, true);
  }
  
  // Registrar o sucesso
  $log_message = date('Y-m-d H:i:s') . ' - Pagamento concluído com sucesso. IP: ' . $_SERVER['REMOTE_ADDR'] . "\n";
  file_put_contents($log_file, $log_message, FILE_APPEND);
  ?>
</body>
</html>
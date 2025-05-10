<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página de Pagamento</title>
  <link rel="shortcut icon" href="img/icon2.ico">
  <link rel="stylesheet" href="pagamento.css"> <!-- Arquivo CSS externo -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://sdk.mercadopago.com/js/v2"></script>
  <script src="process-pix.js"></script>
</head>

<body>
  <div class="top-rectangle">
    <img src="img/logo1.png" alt="Logo" class="logo-left">
    <h1 class="top-text">Projete o espaço para seu gato</h1>
  </div>
  <div class="menu">
    <a href="../Menu/Quem somos/quemSomos.html"> Quem somos </a>
    <a href="../Menu/Tutoriais/tutoriais.html"> Tutoriais </a>
    <a href="../Menu/Contato/contato.html"> Contato </a>
    <a href="../pagina2/pagina2.html"> Voltar </a>
    <a href="../index.html"> Início </a>
  </div>

  <div class="payment-container">
    <h1>Finalize seu Pagamento</h1>
    
    <!-- Container para a imagem do usuário -->
    <div id="user-image-preview" class="user-image-preview"></div>
    
    <!-- Container para exibir as miniaturas adicionadas -->
    <div id="miniaturas-adicionadas" class="miniaturas-adicionadas">
      <!-- O conteúdo do bottomRectangle será carregado aqui -->
    </div>
    
    <form id="payment-form">
      <div class="price-info">
        <h3>Valor Total:</h3>
        <p>R$ <span id="total-geral">100.00</span></p>
      </div>

      <label for="payment-method">Método de Pagamento:</label>
      <select id="payment-method" name="payment-method" required>
        <option value="pix">PIX</option>
        <option value="credit-card">Cartão de Crédito</option>
      </select>

      <!-- Campos para PIX -->
      <div id="pix-fields" class="payment-fields">
        <label for="pix-name">Nome Completo:</label>
        <input type="text" id="pix-name" name="pix-name" placeholder="Seu nome completo" required>

        <label for="pix-cpf">CPF:</label>
        <input type="text" id="pix-cpf" name="pix-cpf" placeholder="123.456.789-00" required>

        <label for="pix-email">E-mail:</label>
        <input type="email" id="pix-email" name="pix-email" placeholder="seu@email.com" required>

        <label for="pix-telefone">Telefone:</label>
        <input type="tel" id="pix-telefone" name="pix-telefone" placeholder="(11) 98765-4321" required>
        
        <!-- Campos de endereço -->
        <div class="endereco-fields">
          <h3>Endereço de Entrega</h3>
          
          <label for="cep">CEP:</label>
          <input type="text" id="cep" name="cep" placeholder="00000-000" maxlength="9">
          
          <label for="rua">Rua:</label>
          <input type="text" id="rua" name="rua" placeholder="Nome da rua">
          
          <label for="numero">Número:</label>
          <input type="text" id="numero" name="numero" placeholder="123">
          
          <label for="complemento">Complemento:</label>
          <input type="text" id="complemento" name="complemento" placeholder="Apto, bloco, etc.">
          
          <label for="bairro">Bairro:</label>
          <input type="text" id="bairro" name="bairro" placeholder="Nome do bairro">
          
          <label for="cidade">Cidade:</label>
          <input type="text" id="cidade" name="cidade" placeholder="Nome da cidade">
          
          <label for="estado">Estado:</label>
          <input type="text" id="estado" name="estado" placeholder="UF" maxlength="2">
        </div>

        <button type="button" id="pix-button" class="pix-button">Gerar QR Code PIX</button>

        <!-- Container para exibir o QR Code e informações do PIX -->
        <div id="qr-code-container" class="pix-container"></div>
      </div>

      <!-- Campos para Cartão de Crédito (serão preenchidos via JavaScript) -->
      <div id="credit-card-fields" class="payment-fields hidden"></div>

      <!-- Botão para processar pagamento com cartão de crédito -->
      <button type="button" id="credit-card-button" class="credit-card-button hidden">Pagar com Cartão</button>

      <!-- Container para mensagens -->
      <div id="message" class="message-container"></div>
    </form>
  </div>

  <script src="pagamento-php.js"></script>
</body>

</html>
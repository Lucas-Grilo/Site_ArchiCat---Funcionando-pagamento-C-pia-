// Seleciona os elementos do DOM
const paymentMethod = document.getElementById("payment-method");
const creditCardFields = document.getElementById("credit-card-fields");
const pixFields = document.getElementById("pix-fields");
const paymentForm = document.getElementById("payment-form");
const messageDiv = document.getElementById("message");

// Função para carregar a imagem do usuário na página de pagamento
function loadUserImage() {
  const userImagePreview = document.getElementById('user-image-preview');
  if (!userImagePreview) return;
  
  // Tentar carregar a imagem do sessionStorage
  const screenCapture = sessionStorage.getItem('screenCapture');
  
  if (screenCapture) {
    // Limpar o conteúdo anterior antes de adicionar a nova imagem
    userImagePreview.innerHTML = '';
    
    // Criar elemento de imagem e definir a fonte
    const img = document.createElement('img');
    
    // Definir atributos da imagem primeiro
    img.src = screenCapture;
    img.alt = 'Sua imagem personalizada';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '300px';
    
    // Adicionar a imagem ao DOM imediatamente
    userImagePreview.appendChild(img);
    
    // Adicionar evento para verificar se a imagem carregou com sucesso
    img.onload = function() {
      console.log('Imagem carregada do sessionStorage com sucesso!');
      
      // Verificar se existem dados de miniaturas no sessionStorage
      const thumbnailsData = sessionStorage.getItem('thumbnailsData');
      if (thumbnailsData) {
        try {
          // Adicionar informações sobre as miniaturas utilizadas, se necessário
          const thumbnails = JSON.parse(thumbnailsData);
          if (thumbnails && thumbnails.length > 0) {
            const thumbnailInfo = document.createElement('div');
            thumbnailInfo.className = 'thumbnail-info';
            thumbnailInfo.innerHTML = `<p>Seu projeto contém ${thumbnails.length} item(ns) personalizado(s)</p>`;
            userImagePreview.appendChild(thumbnailInfo);
          }
        } catch (e) {
          console.error('Erro ao processar dados das miniaturas:', e);
        }
      }
    };
    
    // Adicionar evento para tratar erros de carregamento
    img.onerror = function() {
      console.error('Erro ao carregar a imagem - evento onerror acionado');
      userImagePreview.innerHTML = '<p>Não foi possível carregar a imagem.</p>';
    };
  } else {
    // Se não houver imagem no sessionStorage, exibir mensagem
    userImagePreview.innerHTML = '<p>Não foi possível carregar a imagem.</p>';
    console.error('Não foi possível carregar a imagem do sessionStorage.');
  }
}

// Função para carregar as informações das miniaturas adicionadas
function loadMiniaturasAdicionadas() {
  const miniaturasContainer = document.getElementById('miniaturas-adicionadas');
  if (!miniaturasContainer) return;
  
  // Tentar carregar o conteúdo do bottomRectangle do sessionStorage
  const bottomRectangleContent = sessionStorage.getItem('bottomRectangleContent');
  
  if (bottomRectangleContent) {
    // Adicionar o conteúdo ao container
    miniaturasContainer.innerHTML = bottomRectangleContent;
    console.log('Informações das miniaturas carregadas com sucesso!');
  } else {
    miniaturasContainer.innerHTML = '<p>Nenhuma informação sobre miniaturas disponível.</p>';
    console.log('Nenhuma informação sobre miniaturas encontrada no sessionStorage.');
  }
}

// Inicializa o Mercado Pago com a chave pública obtida do backend
let mp;

// Função para obter a chave pública do Mercado Pago do backend
async function initMercadoPago() {
  try {
    // Determinar a URL base do servidor automaticamente
    const baseUrl = getServerBaseUrl();
    const response = await fetch(`${baseUrl}/payment-status.php?action=mercadopago-config`);
    if (response.ok) {
      const config = await response.json();
      mp = new MercadoPago(config.publicKey);
      console.log('Mercado Pago inicializado com chave do backend');
    } else {
      console.error('Erro ao obter configuração do Mercado Pago');
    }
  } catch (error) {
    console.error('Erro ao inicializar Mercado Pago:', error);
  }
}

// Função para determinar a URL base do servidor
function getServerBaseUrl() {
  // Em produção, o servidor estará no mesmo domínio que o frontend
  return window.location.origin;
}

// Carregar a imagem do usuário e as informações das miniaturas quando a página for carregada
document.addEventListener('DOMContentLoaded', async function() {
  // Inicializar o Mercado Pago
  await initMercadoPago();
  
  // Carregar a imagem do usuário
  loadUserImage();
  
  // Carregar as informações das miniaturas adicionadas
  loadMiniaturasAdicionadas();
  
  // Carregar o valor total do sessionStorage
  const totalFromSession = sessionStorage.getItem('totalGeral');
  if (totalFromSession) {
    const totalElement = document.getElementById('total-geral');
    if (totalElement) {
      totalElement.textContent = totalFromSession;
    }
  }
});

// Função para criar os campos de cartão de crédito
function createCreditCardFields() {
  creditCardFields.innerHTML = `
    <label for="card-number">Número do Cartão:</label>
    <input type="text" id="card-number" name="card-number" placeholder="1234 5678 9012 3456" required>

    <label for="expiry-date">Data de Validade:</label>
    <input type="text" id="expiry-date" name="expiry-date" placeholder="MM/AA" required>

    <label for="cvv">CVV:</label>
    <input type="text" id="cvv" name="cvv" placeholder="123" required>

    <label for="cardholder-name">Nome do Titular:</label>
    <input type="text" id="cardholder-name" name="cardholder-name" placeholder="Nome como no cartão" required>

    <label for="cpf">CPF:</label>
    <input type="text" id="cpf" name="cpf" placeholder="123.456.789-00" required>
  `;
}

// Função para remover os campos de cartão de crédito
function removeCreditCardFields() {
  creditCardFields.innerHTML = ""; // Remove todos os campos
}

// Função para atualizar a exibição dos campos
function updatePaymentFields() {
  const selectedMethod = paymentMethod.value;
  const creditCardButton = document.getElementById("credit-card-button");

  if (selectedMethod === "credit-card") {
    // Mostra campos de cartão e esconde campos PIX
    creditCardFields.classList.remove("hidden");
    pixFields.classList.add("hidden");
    creditCardButton.classList.remove("hidden"); // Mostra o botão de cartão de crédito
    createCreditCardFields(); // Cria os campos de cartão
    
    // Remove o atributo required dos campos PIX quando estão ocultos
    document.getElementById('pix-name').removeAttribute('required');
    document.getElementById('pix-cpf').removeAttribute('required');
    document.getElementById('pix-email').removeAttribute('required');
    document.getElementById('pix-telefone').removeAttribute('required');
  } else if (selectedMethod === "pix") {
    // Mostra campos PIX e esconde campos de cartão
    creditCardFields.classList.add("hidden");
    pixFields.classList.remove("hidden");
    creditCardButton.classList.add("hidden"); // Esconde o botão de cartão de crédito
    removeCreditCardFields(); // Remove os campos de cartão
    
    // Adiciona o atributo required aos campos PIX quando estão visíveis
    document.getElementById('pix-name').setAttribute('required', '');
    document.getElementById('pix-cpf').setAttribute('required', '');
    document.getElementById('pix-email').setAttribute('required', '');
    document.getElementById('pix-telefone').setAttribute('required', '');
  }
}

// Função para processar o pagamento PIX
async function processPixPayment(event) {
  event.preventDefault();
  
  // Obter os valores dos campos
  const nome = document.getElementById('pix-name').value;
  const cpf = document.getElementById('pix-cpf').value;
  const email = document.getElementById('pix-email').value;
  const telefone = document.getElementById('pix-telefone').value;
  const totalElement = document.getElementById('total-geral');
  const total = totalElement ? parseFloat(totalElement.textContent) : 100.00;
  
  // Validar os campos
  if (!nome || !cpf || !email || !telefone) {
    messageDiv.textContent = "Por favor, preencha todos os campos.";
    return;
  }
  
  // Mostrar mensagem de carregamento
  messageDiv.textContent = "Processando pagamento...";
  
  try {
    // Preparar os dados para enviar ao backend
    const paymentData = {
      transaction_amount: total,
      description: "Produtos ArchiCat",
      payment_method_id: "pix",
      payer: {
        email: email,
        first_name: nome.split(' ')[0],
        last_name: nome.split(' ').slice(1).join(' ') || nome.split(' ')[0],
        identification: {
          type: "CPF",
          number: cpf.replace(/[^0-9]/g, '')
        }
      }
    };
    
    // Enviar os dados para o backend PHP
    const baseUrl = getServerBaseUrl();
    const response = await fetch(`${baseUrl}/process-pix.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Exibir o QR Code e as instruções
      const pixContainer = document.getElementById('pix-container');
      pixContainer.innerHTML = `
        <h3>Pagamento PIX Gerado</h3>
        <p>Escaneie o QR Code abaixo com o aplicativo do seu banco:</p>
        <img src="data:image/png;base64,${data.qrCodeBase64}" alt="QR Code PIX" style="max-width: 250px;">
        <p>Ou copie o código PIX:</p>
        <textarea readonly style="width: 100%; height: 80px;">${data.pixCode}</textarea>
        <button id="copy-pix-code" class="copy-button">Copiar Código</button>
        <p>Valor: R$ ${data.transactionAmount.toFixed(2)}</p>
        <p>ID do Pagamento: ${data.payment_id}</p>
        <p>Status: ${data.status}</p>
        <button id="check-payment-status" class="check-status-button">Verificar Status do Pagamento</button>
      `;
      
      // Adicionar evento para copiar o código PIX
      document.getElementById('copy-pix-code').addEventListener('click', function() {
        const textarea = document.querySelector('textarea');
        textarea.select();
        document.execCommand('copy');
        this.textContent = 'Código Copiado!';
        setTimeout(() => {
          this.textContent = 'Copiar Código';
        }, 2000);
      });
      
      // Adicionar evento para verificar o status do pagamento
      document.getElementById('check-payment-status').addEventListener('click', async function() {
        this.textContent = 'Verificando...';
        try {
          const statusResponse = await fetch(`${baseUrl}/payment-status.php?action=payment-status&id=${data.payment_id}`);
          const statusData = await statusResponse.json();
          
          if (statusData.is_approved) {
            // Redirecionar para a página de sucesso
            window.location.href = 'success.html';
          } else {
            // Atualizar o status na página
            const statusElement = document.querySelector('p:nth-last-child(2)');
            if (statusElement) {
              statusElement.textContent = `Status: ${statusData.status} (${statusData.status_detail})`;
            }
            this.textContent = 'Verificar Novamente';
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
          this.textContent = 'Erro ao Verificar';
          setTimeout(() => {
            this.textContent = 'Verificar Status do Pagamento';
          }, 2000);
        }
      });
      
      // Limpar a mensagem
      messageDiv.textContent = "";
      
      // Enviar email com os dados do pagamento e a imagem
      sendEmailWithPaymentInfo(nome, email, total);
    } else {
      // Exibir mensagem de erro
      messageDiv.textContent = `Erro: ${data.error || 'Falha ao processar o pagamento'}`;
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    messageDiv.textContent = "Erro ao processar o pagamento. Por favor, tente novamente.";
  }
}

// Função para enviar email com os dados do pagamento e a imagem
async function sendEmailWithPaymentInfo(nome, email, valor) {
  try {
    // Obter a imagem do sessionStorage
    const imageData = sessionStorage.getItem('screenCapture');
    
    // Preparar os dados para enviar ao backend
    const emailData = {
      nome: nome,
      email: email,
      valor: valor.toFixed(2),
      imageData: imageData
    };
    
    // Enviar os dados para o backend PHP
    const baseUrl = getServerBaseUrl();
    const response = await fetch(`${baseUrl}/send-email.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Email enviado com sucesso:', data.message);
    } else {
      console.error('Erro ao enviar email:', data.error);
    }
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
}

// Adicionar evento para atualizar os campos quando o método de pagamento for alterado
paymentMethod.addEventListener('change', updatePaymentFields);

// Adicionar evento para processar o pagamento PIX quando o formulário for enviado
paymentForm.addEventListener('submit', function(event) {
  const selectedMethod = paymentMethod.value;
  
  if (selectedMethod === "pix") {
    processPixPayment(event);
  } else {
    // Para cartão de crédito, permitir o envio normal do formulário
    // Ou implementar a lógica de processamento de cartão de crédito
    event.preventDefault();
    messageDiv.textContent = "Processamento de cartão de crédito não implementado nesta versão.";
  }
});

// Inicializar a exibição dos campos com base no método de pagamento selecionado
updatePaymentFields();
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
  let screenCapture = sessionStorage.getItem('screenCapture');
  
  if (screenCapture) {
    console.log('Imagem encontrada no sessionStorage, verificando formato...');
    
    // Verificar se a imagem já tem o prefixo data:image
    if (!screenCapture.startsWith('data:image')) {
      console.log('Adicionando prefixo data:image/png;base64 à imagem');
      screenCapture = 'data:image/png;base64,' + screenCapture;
    } else {
      console.log('Imagem já possui o prefixo data:image');
    }
    
    // Limpar o conteúdo anterior antes de adicionar a nova imagem
    userImagePreview.innerHTML = '';
    
    try {
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
    } catch (error) {
      console.error('Erro ao processar a imagem:', error);
      userImagePreview.innerHTML = '<p>Erro ao processar a imagem.</p>';
    }
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
    // Usar o caminho absoluto para o arquivo payment-status.php
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/Pagamento/payment-status.php?action=mercadopago-config`);
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
  
  // Adicionar evento ao botão de PIX
  const pixButton = document.getElementById('pix-button');
  if (pixButton) {
    pixButton.addEventListener('click', function() {
      processPixPayment();
    });
  } else {
    console.error('Botão de PIX não encontrado no DOM');
  }
  
  // Configurar eventos relacionados ao CEP
  const cepInput = document.getElementById('cep');
  const buscarCepButton = document.getElementById('buscar-cep');
  
  if (cepInput) {
    // Evento de perda de foco para buscar CEP automaticamente
    cepInput.addEventListener('blur', function() {
      const cep = this.value;
      if (cep && cep.replace(/\D/g, '').length === 8) {
        buscarCep(cep);
      }
    });
    
    // Adicionar máscara para o campo de CEP
    cepInput.addEventListener('input', function() {
      let cep = this.value.replace(/\D/g, '');
      if (cep.length > 5) {
        this.value = cep.substring(0, 5) + '-' + cep.substring(5, 8);
      } else {
        this.value = cep;
      }
    });
  } else {
    console.error('Elemento de CEP não encontrado no DOM');
  }
  
  // Adicionar evento ao botão de buscar CEP
  if (buscarCepButton) {
    buscarCepButton.addEventListener('click', function() {
      const cep = cepInput ? cepInput.value : '';
      if (cep) {
        buscarCep(cep);
      } else {
        messageDiv.textContent = "Por favor, digite um CEP válido.";
      }
    });
  } else {
    console.error('Botão de buscar CEP não encontrado no DOM');
  }
  
  // Inicializar a exibição dos campos com base no método de pagamento selecionado
  updatePaymentFields();
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
async function processPixPayment() {
  // Não é necessário event.preventDefault() aqui pois a função é chamada por um botão do tipo button
  
  // Obter os valores dos campos
  const nome = document.getElementById('pix-name').value;
  const cpf = document.getElementById('pix-cpf').value;
  const email = document.getElementById('pix-email').value;
  const telefone = document.getElementById('pix-telefone').value;
  const totalElement = document.getElementById('total-geral');
  const total = totalElement ? parseFloat(totalElement.textContent) : 100.00;
  
  // Obter os dados de endereço
  const cep = document.getElementById('cep').value;
  const rua = document.getElementById('rua').value;
  const numero = document.getElementById('numero').value;
  const complemento = document.getElementById('complemento').value;
  const bairro = document.getElementById('bairro').value;
  const cidade = document.getElementById('cidade').value;
  const estado = document.getElementById('estado').value;
  
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
        },
        phone: {
          area_code: telefone.substring(0, 2),
          number: telefone.replace(/\D/g, '').substring(2)
        },
        address: {
          zip_code: cep.replace(/\D/g, ''),
          street_name: rua,
          street_number: numero,
          neighborhood: bairro,
          city: cidade,
          federal_unit: estado
        }
      }
    };
    
    // Enviar os dados para o backend PHP
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/Pagamento/process-pix.php`, {
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
          const statusResponse = await fetch(`payment-status.php?action=payment-status&id=${data.payment_id}`);
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
    let imageData = sessionStorage.getItem('screenCapture');
    
    // Verificar se a imagem existe e adicionar o prefixo data:image se necessário
    if (imageData) {
      console.log('Imagem encontrada para envio por email, verificando formato...');
      if (!imageData.startsWith('data:image')) {
        console.log('Adicionando prefixo data:image/png;base64 à imagem para email');
        imageData = 'data:image/png;base64,' + imageData;
      } else {
        console.log('Imagem para email já possui o prefixo data:image');
      }
    } else {
      console.log('Nenhuma imagem encontrada no sessionStorage para envio por email');
    }
    
    // Obter os dados de endereço
    const cep = document.getElementById('cep').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;
    const complemento = document.getElementById('complemento').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    
    // Preparar os dados para enviar ao backend
    const emailData = {
      nome: nome,
      email: email,
      valor: valor.toFixed(2),
      imageData: imageData,
      endereco: {
        cep: cep,
        rua: rua,
        numero: numero,
        complemento: complemento,
        bairro: bairro,
        cidade: cidade,
        estado: estado
      }
    };
    
    // Enviar os dados para o backend PHP
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/Pagamento/send-email.php`, {
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
  event.preventDefault(); // Prevenir o envio do formulário em todos os casos
  const selectedMethod = paymentMethod.value;
  
  if (selectedMethod === "pix") {
    processPixPayment();
  } else {
    // Para cartão de crédito, implementar a lógica de processamento de cartão de crédito
    messageDiv.textContent = "Processamento de cartão de crédito não implementado nesta versão.";
  }
});

// Função para buscar endereço pelo CEP usando a API ViaCEP
async function buscarCep(cep) {
  console.log('Função buscarCep chamada com:', cep);
  
  // Limpar o CEP, mantendo apenas números
  cep = cep.replace(/\D/g, '');
  console.log('CEP após limpeza:', cep);
  
  if (cep.length !== 8) {
    console.log('CEP inválido, comprimento:', cep.length);
    messageDiv.textContent = "CEP inválido. Digite um CEP com 8 dígitos.";
    messageDiv.style.color = "#cc0000";
    return false;
  }
  
  // Mostrar mensagem de carregamento
  messageDiv.textContent = "Buscando CEP...";
  messageDiv.style.color = "#0066cc";
  
  try {
    console.log(`Iniciando requisição para CEP: ${cep}`);
    
    // Usar URL com protocolo HTTPS para evitar problemas de segurança
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    console.log('URL da requisição:', url);
    
    // Fazer requisição para a API ViaCEP com opções adicionais para evitar problemas de CORS
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('Resposta da API ViaCEP:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dados recebidos da API:', data);
    
    // Verificar se a API retornou erro
    if (data.erro) {
      console.log('API retornou erro para o CEP');
      messageDiv.textContent = "CEP não encontrado.";
      messageDiv.style.color = "#cc0000";
      return false;
    }
    
    // Preencher os campos de endereço
    const ruaElement = document.getElementById('rua');
    const bairroElement = document.getElementById('bairro');
    const cidadeElement = document.getElementById('cidade');
    const estadoElement = document.getElementById('estado');
    const numeroElement = document.getElementById('numero');
    
    console.log('Elementos do DOM encontrados:', {
      rua: !!ruaElement,
      bairro: !!bairroElement,
      cidade: !!cidadeElement,
      estado: !!estadoElement,
      numero: !!numeroElement
    });
    
    if (ruaElement) ruaElement.value = data.logradouro || '';
    if (bairroElement) bairroElement.value = data.bairro || '';
    if (cidadeElement) cidadeElement.value = data.localidade || '';
    if (estadoElement) estadoElement.value = data.uf || '';
    
    // Remover o atributo readonly para permitir edição se necessário
    if (ruaElement) ruaElement.removeAttribute('readonly');
    if (bairroElement) bairroElement.removeAttribute('readonly');
    if (cidadeElement) cidadeElement.removeAttribute('readonly');
    if (estadoElement) estadoElement.removeAttribute('readonly');
    
    // Focar no campo número após preencher o endereço
    if (numeroElement) numeroElement.focus();
    
    // Limpar mensagem de erro se houver
    messageDiv.textContent = "CEP encontrado com sucesso!";
    messageDiv.style.color = "#008800";
    
    // Após 3 segundos, limpar a mensagem de sucesso
    setTimeout(() => {
      messageDiv.textContent = "";
    }, 3000);
    
    console.log('Busca de CEP concluída com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    messageDiv.textContent = "Erro ao buscar CEP. Tente novamente.";
    messageDiv.style.color = "#cc0000";
    return false;
  }
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
  
  // Adicionar evento ao botão de PIX
  const pixButton = document.getElementById('pix-button');
  if (pixButton) {
    pixButton.addEventListener('click', function() {
      processPixPayment();
    });
  } else {
    console.error('Botão de PIX não encontrado no DOM');
  }
  
  // Configurar eventos relacionados ao CEP
  const cepInput = document.getElementById('cep');
  const buscarCepButton = document.getElementById('buscar-cep');
  
  if (cepInput) {
    // Evento de perda de foco para buscar CEP automaticamente
    cepInput.addEventListener('blur', function() {
      const cep = this.value;
      if (cep && cep.replace(/\D/g, '').length === 8) {
        buscarCep(cep);
      }
    });
    
    // Adicionar máscara para o campo de CEP
    cepInput.addEventListener('input', function() {
      let cep = this.value.replace(/\D/g, '');
      if (cep.length > 5) {
        this.value = cep.substring(0, 5) + '-' + cep.substring(5, 8);
      } else {
        this.value = cep;
      }
    });
  } else {
    console.error('Elemento de CEP não encontrado no DOM');
  }
  
  // Adicionar evento ao botão de buscar CEP
  if (buscarCepButton) {
    buscarCepButton.addEventListener('click', function() {
      const cep = cepInput ? cepInput.value : '';
      if (cep) {
        buscarCep(cep);
      } else {
        messageDiv.textContent = "Por favor, digite um CEP válido.";
      }
    });
  } else {
    console.error('Botão de buscar CEP não encontrado no DOM');
  }
  
  // Inicializar a exibição dos campos com base no método de pagamento selecionado
  updatePaymentFields();
});


// Inicializar a exibição dos campos com base no método de pagamento selecionado
updatePaymentFields();
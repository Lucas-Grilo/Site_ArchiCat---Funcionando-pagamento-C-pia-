// Seleciona os elementos do DOM
const paymentMethod = document.getElementById("payment-method");
const creditCardFields = document.getElementById("credit-card-fields");
const pixFields = document.getElementById("pix-fields");
const paymentForm = document.getElementById("payment-form");
const messageDiv = document.getElementById("message");

// Função para carregar a imagem do usuário na página de pagamento
function loadUserImage() {
  console.log('Tentando carregar imagem do usuário...');
  const userImagePreview = document.getElementById('user-image-preview');
  if (!userImagePreview) {
    console.error('Elemento user-image-preview não encontrado no DOM');
    return;
  }
  
  // Tentar carregar a imagem de diferentes fontes e formatos
  let screenCapture = null;
  
  // Tentar obter do sessionStorage com diferentes chaves
  const possibleKeys = ['screenCapture', 'userImage', 'capturedImage', 'projectImage', 'imageData', 'designImage', 'canvasImage'];
  
  for (const key of possibleKeys) {
    screenCapture = sessionStorage.getItem(key);
    if (screenCapture) {
      console.log(`Imagem encontrada no sessionStorage com a chave: ${key}`);
      break;
    }
  }
  
  // Se não encontrou no sessionStorage, tentar no localStorage
  if (!screenCapture) {
    for (const key of possibleKeys) {
      screenCapture = localStorage.getItem(key);
      if (screenCapture) {
        console.log(`Imagem encontrada no localStorage com a chave: ${key}`);
        break;
      }
    }
  }
  
  // Se ainda não encontrou, verificar se há uma URL de imagem armazenada
  if (!screenCapture) {
    screenCapture = sessionStorage.getItem('imageUrl') || localStorage.getItem('imageUrl');
    if (screenCapture) {
      console.log('URL de imagem encontrada');
    }
  }
  
  // Verificar também no localStorage.projectData se existir
  if (!screenCapture) {
    try {
      const projectData = localStorage.getItem('projectData');
      if (projectData) {
        const parsedData = JSON.parse(projectData);
        if (parsedData && parsedData.image) {
          screenCapture = parsedData.image;
          console.log('Imagem encontrada em localStorage.projectData');
        }
      }
    } catch (e) {
      console.error('Erro ao processar projectData:', e);
    }
  }
  
  if (screenCapture) {
    console.log('Imagem encontrada, verificando formato...');
    
    // Verificar se a imagem já tem o prefixo data:image
    if (!screenCapture.startsWith('data:image') && !screenCapture.startsWith('http')) {
      console.log('Adicionando prefixo data:image/png;base64 à imagem');
      screenCapture = 'data:image/png;base64,' + screenCapture;
    } else {
      console.log('Imagem já possui o prefixo data:image ou é uma URL');
    }
    
    // Limpar o conteúdo anterior antes de adicionar a nova imagem
    userImagePreview.innerHTML = '';
    
    try {
      // Criar elemento de imagem
      const img = document.createElement('img');
      
      // Definir atributos da imagem
      img.alt = 'Sua imagem personalizada';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '300px';
      
      // Configurar eventos antes de definir o src
      // Adicionar evento para verificar se a imagem carregou com sucesso
      img.onload = function() {
        console.log('Imagem carregada com sucesso!');
        console.log('Fonte da imagem:', img.src.substring(0, 30) + '...');
        
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
        console.error('Tentativa de carregar:', img.src.substring(0, 30) + '...');
        userImagePreview.innerHTML = '<p>Não foi possível carregar a imagem do usuário.</p>';
        console.log('Exibindo mensagem de erro em vez de carregar imagem padrão');
      
      };
      
      // Definir a fonte da imagem após configurar os eventos
      img.src = screenCapture;
      
      // Adicionar a imagem ao DOM após configurar tudo
      userImagePreview.appendChild(img);
      console.log('Imagem adicionada ao DOM, aguardando carregamento...');
    } catch (error) {
      console.error('Erro ao processar a imagem:', error);
      userImagePreview.innerHTML = '<p>Erro ao processar a imagem.</p>';
    }
  } else {
    // Se não houver imagem no sessionStorage ou localStorage, exibir mensagem
    console.error('Não foi possível carregar a imagem do sessionStorage ou localStorage.');
    userImagePreview.innerHTML = '<p>Não foi possível carregar a imagem do usuário.</p>';
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

// Função para atualizar os campos de pagamento com base no método selecionado
function updatePaymentFields() {
  console.log('Atualizando campos de pagamento...');
  
  if (!paymentMethod) {
    console.error('Elemento payment-method não encontrado');
    return;
  }
  
  const selectedMethod = paymentMethod.value;
  console.log('Método de pagamento selecionado:', selectedMethod);
  
  // Ocultar todos os campos e botões primeiro
  if (creditCardFields) creditCardFields.classList.add('hidden');
  if (pixFields) pixFields.classList.add('hidden');
  
  const creditCardButton = document.getElementById('credit-card-button');
  if (creditCardButton) creditCardButton.classList.add('hidden');
  
  const pixButton = document.getElementById('pix-button');
  if (pixButton) pixButton.style.display = 'none';
  
  // Mostrar os campos e botões relevantes com base no método selecionado
  if (selectedMethod === 'credit-card') {
    console.log('Exibindo campos de cartão de crédito');
    if (creditCardFields) {
      creditCardFields.classList.remove('hidden');
      // Criar os campos de cartão de crédito se ainda não existirem
      if (creditCardFields.children.length === 0) {
        createCreditCardFields();
      }
    }
    if (creditCardButton) creditCardButton.classList.remove('hidden');
  } else if (selectedMethod === 'pix') {
    console.log('Exibindo campos de PIX');
    if (pixFields) pixFields.classList.remove('hidden');
    if (pixButton) pixButton.style.display = 'block';
  }
}

// Inicializar a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado, inicializando página de pagamento...');
  
  // Carregar a imagem do usuário
  loadUserImage();
  
  // Carregar informações das miniaturas
  loadMiniaturasAdicionadas();
  
  // Inicializar o Mercado Pago
  initMercadoPago();
  
  // Configurar o botão de buscar CEP
  setupCepButton();
  
  // Configurar o evento de mudança do método de pagamento
  if (paymentMethod) {
    paymentMethod.addEventListener('change', updatePaymentFields);
    // Inicializar os campos com base no método selecionado inicialmente
    updatePaymentFields();
  } else {
    console.error('Elemento payment-method não encontrado no DOM');
  }
  
  // Configurar o botão PIX - implementação direta e simples
  console.log('Configurando botão PIX...');
  const pixButton = document.getElementById('pix-button');
  
  if (pixButton) {
    console.log('Botão PIX encontrado no DOM');
    
    // Adicionar evento de clique diretamente sem usar métodos complexos
    pixButton.addEventListener('click', function() {
      console.log('Botão PIX clicado!');
      
      // Adicionar feedback visual
      this.textContent = 'Processando...';
      this.disabled = true;
      
      // Chamar a função processPixPayment diretamente
      processPixPayment();
    });
    
    console.log('Evento de clique adicionado ao botão PIX com sucesso');
  } else {
    console.error('Botão PIX não encontrado no DOM');
  }
});

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

// Função para buscar CEP via API ViaCEP
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

// Função para processar pagamento PIX
async function processPixPayment() {
  console.log('Função processPixPayment chamada');
  console.log('Iniciando processamento de pagamento PIX');
  
  // Verificar se o elemento messageDiv existe
  if (!messageDiv) {
    console.error('Elemento messageDiv não encontrado no DOM');
    alert('Erro ao processar pagamento: Elemento de mensagem não encontrado.');
    return;
  }
  
  // Mostrar mensagem de processamento
  messageDiv.textContent = "Processando pagamento PIX, aguarde...";
  messageDiv.style.color = "#0066cc";
  
  try {
    // Obter os valores dos campos
    const pixNameElement = document.getElementById('pix-name');
    const pixCpfElement = document.getElementById('pix-cpf');
    const pixEmailElement = document.getElementById('pix-email');
    const pixTelefoneElement = document.getElementById('pix-telefone');
    
    // Verificar se os elementos existem
    if (!pixNameElement || !pixCpfElement || !pixEmailElement || !pixTelefoneElement) {
      console.error('Elementos de formulário PIX não encontrados:', {
        nome: !!pixNameElement,
        cpf: !!pixCpfElement,
        email: !!pixEmailElement,
        telefone: !!pixTelefoneElement
      });
      messageDiv.textContent = "Erro ao processar pagamento: Elementos do formulário não encontrados.";
      messageDiv.style.color = "#cc0000";
      return;
    }
    
    const nome = pixNameElement.value;
    const cpf = pixCpfElement.value;
    const email = pixEmailElement.value;
    const telefone = pixTelefoneElement.value;
    
    // Validar campos obrigatórios
    if (!nome || !cpf || !email || !telefone) {
      messageDiv.textContent = "Por favor, preencha todos os campos obrigatórios.";
      messageDiv.style.color = "#cc0000";
      return;
    }
    
    // Validação básica de CPF (apenas verifica se tem 11 dígitos após remover caracteres especiais)
    const cpfNumerico = cpf.replace(/[^0-9]/g, '');
    if (cpfNumerico.length !== 11) {
      messageDiv.textContent = "CPF inválido. Por favor, digite um CPF válido.";
      messageDiv.style.color = "#cc0000";
      return;
    }
    
    // Obter o valor total
    const totalElement = document.getElementById('total-geral');
    let total = 100.00; // Valor padrão
    
    if (totalElement) {
      // Remover caracteres não numéricos e converter para float
      const totalText = totalElement.textContent.replace(/[^0-9.,]/g, '').replace(',', '.');
      const parsedTotal = parseFloat(totalText);
      if (!isNaN(parsedTotal)) {
        total = parsedTotal;
      }
    }
    
    // Obter os dados de endereço
    const cep = document.getElementById('cep')?.value || '';
    const rua = document.getElementById('rua')?.value || '';
    const numero = document.getElementById('numero')?.value || '';
    const complemento = document.getElementById('complemento')?.value || '';
    const bairro = document.getElementById('bairro')?.value || '';
    const cidade = document.getElementById('cidade')?.value || '';
    const estado = document.getElementById('estado')?.value || '';
    
    // Dividir o nome completo em nome e sobrenome
    const nomeCompleto = nome.trim().split(' ');
    const firstName = nomeCompleto[0] || 'Cliente';
    const lastName = nomeCompleto.length > 1 ? nomeCompleto.slice(1).join(' ') : 'ArchiCat';
    
    // Preparar os dados para enviar ao backend
    const paymentData = {
      transaction_amount: total,
      description: "Produtos ArchiCat",
      payment_method_id: "pix",
      payer: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: "CPF",
          number: cpfNumerico
        }
      }
    };
    
    // Adicionar dados de telefone e endereço se disponíveis
    if (telefone) {
      paymentData.payer.phone = {
        area_code: telefone.substring(0, 2),
        number: telefone.replace(/\D/g, '').substring(2)
      };
    }
    
    if (cep && rua && numero && bairro && cidade && estado) {
      paymentData.payer.address = {
        zip_code: cep.replace(/\D/g, ''),
        street_name: rua,
        street_number: numero,
        neighborhood: bairro,
        city: cidade,
        federal_unit: estado
      };
    }
    
    console.log('Dados de pagamento preparados:', paymentData);
    
    // Fazer requisição para o backend
    const baseUrl = getServerBaseUrl();
    
    // Gerar um UUID para o cabeçalho X-Idempotency-Key
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : 
      ([1e7]+'-'+1e3+'-'+4e3+'-'+8e3+'-'+1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4)).toString(16)
      );
    
    console.log('X-Idempotency-Key gerado:', idempotencyKey);
    
    const response = await fetch(`${baseUrl}/process-pix.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(paymentData)
    });
    
    // Registrar o cabeçalho enviado para depuração
    console.log('Requisição enviada com X-Idempotency-Key:', idempotencyKey);
    
    console.log('Resposta do servidor:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta:', errorText);
      
      // Tentar analisar o erro como JSON para exibir mensagens mais específicas
      try {
        const errorData = JSON.parse(errorText);
        console.error('Detalhes do erro:', errorData);
        
        // Verificar se é um erro relacionado ao X-Idempotency-Key
        if (errorData.response && errorData.response.cause) {
          const causes = errorData.response.cause;
          for (const cause of causes) {
            if (cause.description && cause.description.includes('X-Idempotency-Key')) {
              messageDiv.textContent = "Erro de validação: Chave de idempotência inválida. Tente novamente.";
              messageDiv.style.color = "#cc0000";
              return; // Interrompe a execução para não lançar o erro genérico
            }
          }
        }
        
        // Exibir mensagem de erro mais específica se disponível
        if (errorData.error || errorData.message) {
          messageDiv.textContent = `Erro ao processar pagamento: ${errorData.error || errorData.message}`;
          messageDiv.style.color = "#cc0000";
          return; // Interrompe a execução para não lançar o erro genérico
        }
      } catch (jsonError) {
        // Se não conseguir analisar como JSON, continua com o tratamento padrão
        console.error('Erro ao analisar resposta de erro como JSON:', jsonError);
      }
      
      throw new Error(`Erro no servidor: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dados recebidos do servidor:', data);
    
    // Exibir QR Code
    const qrCodeContainer = document.getElementById('qr-code-container');
    if (qrCodeContainer && data.qrCodeBase64) {
      // Limpar o conteúdo anterior do container
      qrCodeContainer.innerHTML = '';
      
      // Criar elementos para exibir o QR Code
      const qrImg = document.createElement('img');
      qrImg.src = `data:image/png;base64,${data.qrCodeBase64}`;
      qrImg.alt = 'QR Code PIX';
      qrCodeContainer.appendChild(qrImg);
      
      // Adicionar texto explicativo
      const scanText = document.createElement('p');
      scanText.textContent = 'Escaneie o QR Code acima com o aplicativo do seu banco para pagar';
      qrCodeContainer.appendChild(scanText);
      
      // Adicionar área para código PIX copiável
      const copyText = document.createElement('p');
      copyText.textContent = 'Ou copie o código PIX abaixo:';
      qrCodeContainer.appendChild(copyText);
      
      // Criar textarea para o código PIX
      const pixCodeArea = document.createElement('textarea');
      pixCodeArea.readOnly = true;
      pixCodeArea.className = 'pix-code';
      pixCodeArea.id = 'pix-code-text';
      pixCodeArea.value = data.pixCode || '';
      pixCodeArea.style.width = '100%';
      pixCodeArea.style.height = '60px';
      pixCodeArea.style.marginBottom = '10px';
      qrCodeContainer.appendChild(pixCodeArea);
      
      // Criar botão para copiar o código PIX
      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copiar código PIX';
      copyButton.className = 'copy-button';
      copyButton.style.marginBottom = '15px';
      qrCodeContainer.appendChild(copyButton);
      
      // Adicionar evento de clique para copiar o código
      copyButton.addEventListener('click', function() {
        const pixCodeText = document.getElementById('pix-code-text');
        pixCodeText.select();
        navigator.clipboard.writeText(pixCodeText.value)
          .then(() => {
            // Feedback visual temporário
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Código copiado!';
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 2000);
          })
          .catch(err => {
            console.error('Erro ao copiar texto: ', err);
            if (messageDiv) {
              messageDiv.textContent = 'Erro ao copiar o código PIX. Tente selecionar e copiar manualmente.';
              messageDiv.style.color = "#cc0000";
            }
          });
      });
      
      // Mostrar mensagem de sucesso
      if (messageDiv) {
        messageDiv.textContent = 'QR Code PIX gerado com sucesso! Escaneie para pagar.';
        messageDiv.style.color = "#008800";
      }
      
      // Ocultar o botão de gerar QR Code PIX
      const pixButton = document.getElementById('pix-button');
      if (pixButton) {
        pixButton.style.display = 'none';
      }
      
      // Criar container para status do pagamento
      const statusContainer = document.createElement('div');
      statusContainer.id = 'payment-status-container';
      statusContainer.style.padding = '10px';
      statusContainer.style.backgroundColor = '#f0f0f0';
      statusContainer.style.borderRadius = '5px';
      statusContainer.style.marginTop = '10px';
      statusContainer.innerHTML = `
        <p><strong>Status do pagamento:</strong> Aguardando pagamento</p>
        <p>Por favor, escaneie o QR Code acima com o aplicativo do seu banco para pagar.</p>
        <p>A página de confirmação será exibida automaticamente após a confirmação do pagamento.</p>
        <div id="payment-status-message"></div>
      `;
      qrCodeContainer.appendChild(statusContainer);
        
      // Iniciar verificação periódica do status do pagamento
      if (data.payment_id) {
        startPaymentStatusCheck(data.payment_id);
      }
    } else {
      throw new Error('Não foi possível gerar o QR Code PIX');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao processar pagamento PIX:', error);
    
    // Reativar o botão PIX
    const pixButton = document.getElementById('pix-button');
    if (pixButton) {
      pixButton.textContent = 'Gerar QR Code PIX';
      pixButton.disabled = false;
      pixButton.style.display = 'block';
    }
    
    // Exibir mensagem de erro
    if (messageDiv) {
      if (error.message && error.message.includes('Failed to fetch')) {
        messageDiv.innerHTML = 'Erro de conexão com o servidor. <br><br><strong>Possíveis soluções:</strong><br>1. Verifique sua conexão com a internet<br>2. Atualize a página e tente novamente<br>3. Se o problema persistir, entre em contato com o suporte';
      } else {
        messageDiv.textContent = `Erro ao processar o pagamento: ${error.message || 'Tente novamente'}`;
      }
      messageDiv.style.color = "#cc0000";
    }
    
    return false;
  }
}

// Função para verificar o status do pagamento periodicamente
function startPaymentStatusCheck(paymentId) {
  console.log('Iniciando verificação periódica do status do pagamento:', paymentId);
  
  if (!paymentId) {
    console.error('ID do pagamento não fornecido para verificação de status');
    return;
  }
  
  // Salvar o ID do pagamento no sessionStorage para recuperação posterior
  sessionStorage.setItem('pixPaymentId', paymentId);
  
  // Iniciar a verificação periódica
  runPeriodicCheck(paymentId);
}

// Função para verificar o status do pagamento
async function checkPaymentStatus(paymentId) {
  try {
    // Verificar se o paymentId foi fornecido como parâmetro
    if (!paymentId) {
      // Tentar obter do sessionStorage como fallback
      paymentId = sessionStorage.getItem('pixPaymentId');
      if (!paymentId) {
        console.error('ID do pagamento não encontrado');
        return true; // Interromper a verificação
      }
    }
    
    console.log(`Verificando status do pagamento: ${paymentId}`);
    
    // Elemento para exibir mensagens de status
    const statusMessageElement = document.getElementById('payment-status-message');
    
    // Fazer requisição para o backend para verificar o status
    const baseUrl = getServerBaseUrl();
    const response = await fetch(`${baseUrl}/Pagamento/payment-status.php?action=payment-status&id=${paymentId}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${response.status}`);
    }
    
    const statusData = await response.json();
    console.log('Status do pagamento:', statusData);
      
    // Atualizar a mensagem de status
    if (statusMessageElement) {
      statusMessageElement.innerHTML = `<strong>Status:</strong> ${statusData.status_text || statusData.status}`;
        }
        
        // Se o pagamento foi aprovado, redirecionar para a página de sucesso
        if (data.status === 'approved' || data.status === 'Aprovado') {
          console.log('Pagamento aprovado! Redirecionando para página de sucesso...');
          window.location.href = `${baseUrl}/Pagamento/success.php?payment_id=${paymentId}`;
          return; // Interromper as verificações
        }
      }
      
      // Continue checking if max attempts not reached
      if (attempts < maxAttempts) {
        setTimeout(checkPaymentStatus, checkInterval);
      } else {
        console.log('Número máximo de tentativas atingido. Parando verificação automática.');
        const statusMessage = document.getElementById('payment-status-message');
        if (statusMessage) {
          statusMessage.innerHTML = 'Verificação automática encerrada. <a href="javascript:void(0)" onclick="manualCheckStatus(\'' + paymentId + '\');">Verificar manualmente</a>';
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      // Continuar verificando mesmo com erro
      if (attempts < maxAttempts) {
        setTimeout(() => checkPaymentStatus(paymentId), checkInterval);
      }
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return false;
  }
    console.error('Error checking payment status:', error);
    return false;
  }
try {
  // Add try block here
} catch (error) {
  console.error('Error checking payment status:', error);
  return false;
}

// Função para iniciar a verificação periódica do status do pagamento
function startPaymentStatusCheck(paymentId) {
  if (!paymentId) {
    console.error('ID do pagamento não fornecido para verificação de status');
    return;
  }
  
  console.log('Iniciando verificação periódica do status do pagamento:', paymentId);
  
  // Salvar o ID do pagamento no sessionStorage para recuperação posterior
  sessionStorage.setItem('pixPaymentId', paymentId);
  
  // Iniciar a verificação periódica
  runPeriodicCheck(paymentId);
}

// Função para executar a verificação periódica
async function runPeriodicCheck(paymentId) {
  console.log('Executando verificação periódica para o pagamento:', paymentId);
  
  if (!paymentId) {
    console.error('ID do pagamento não fornecido para verificação periódica');
    // Tentar obter do sessionStorage como fallback
    paymentId = sessionStorage.getItem('pixPaymentId');
    if (!paymentId) {
      console.error('ID do pagamento não encontrado no sessionStorage');
      return;
    }
    console.log('ID do pagamento recuperado do sessionStorage:', paymentId);
  }
  
  // Verificar o status do pagamento
  const shouldStop = await checkPaymentStatus(paymentId);
  
  // Se a verificação indicar que devemos parar, não agendar a próxima verificação
  if (shouldStop) {
    console.log('Verificação periódica interrompida');
    return;
  }
  
  // Agendar a próxima verificação após 5 segundos
  setTimeout(() => runPeriodicCheck(paymentId), 5000);
}

// Função para verificar o status do pagamento
async function checkPaymentStatus(paymentId) {
  // Definir variáveis para controle de tentativas
  const maxAttempts = 12; // 1 minuto (12 tentativas a cada 5 segundos)
  
  // Usar uma variável estática através de uma propriedade da função
  if (typeof checkPaymentStatus.attempts === 'undefined') {
    checkPaymentStatus.attempts = 0;
  }
  checkPaymentStatus.attempts++;
  
  try {
    // Verificar se o paymentId foi fornecido como parâmetro
    if (!paymentId) {
      // Tentar obter do sessionStorage como fallback
      paymentId = sessionStorage.getItem('pixPaymentId');
      if (!paymentId) {
        console.error('ID do pagamento não encontrado');
        return true; // Interromper a verificação
      }
    }
    
    console.log(`Verificando status do pagamento (tentativa ${checkPaymentStatus.attempts}/${maxAttempts})`);
    
    // Elemento para exibir mensagens de status
    const statusMessageElement = document.getElementById('payment-status-message');
    
    // Fazer requisição para o backend para verificar o status
    const baseUrl = getServerBaseUrl();
    const response = await fetch(`${baseUrl}/Pagamento/payment-status.php?action=payment-status&id=${paymentId}`);
    
    console.log(`Verificando status em: ${baseUrl}/Pagamento/payment-status.php?action=payment-status&id=${paymentId}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${response.status}`);
    }
    
    const statusData = await response.json();
    console.log('Status do pagamento:', statusData);
      
    // Atualizar a mensagem de status
    if (statusMessageElement) {
      statusMessageElement.innerHTML = `<strong>Status:</strong> ${statusData.status_text || statusData.status}`;
    }
      
    // Verificar se o pagamento foi aprovado
    if (statusData.status === 'approved' || statusData.status === 'Aprovado') {
      console.log('Pagamento aprovado!');
      
      if (statusMessageElement) {
        statusMessageElement.innerHTML = `<strong>Pagamento aprovado!</strong> Redirecionando para a página de sucesso...`;
        statusMessageElement.style.color = '#008800';
      }
      
      // Redirecionar para a página de sucesso após 3 segundos
      setTimeout(() => {
        const baseUrl = window.location.origin;
        window.location.href = `${baseUrl}/Pagamento/success.php?payment_id=${paymentId}`;
      }, 3000);
      
      // Interromper a verificação periódica
      return true;
    }
    
    // Verificar se o pagamento foi rejeitado ou cancelado
    if (statusData.status === 'rejected' || statusData.status === 'cancelled' || 
        statusData.status === 'Rejeitado' || statusData.status === 'Cancelado') {
      console.log('Pagamento rejeitado ou cancelado');
      
      if (statusMessageElement) {
        statusMessageElement.innerHTML = `<strong>Pagamento ${statusData.status}.</strong> Por favor, tente novamente.`;
        statusMessageElement.style.color = '#cc0000';
      }
      
      // Reativar o botão PIX
      const pixButton = document.getElementById('pix-button');
      if (pixButton) {
        pixButton.textContent = 'Tentar novamente';
        pixButton.disabled = false;
        pixButton.style.display = 'block';
      }
      
      // Interromper a verificação periódica
      return true;
    }
    
    // Se atingiu o número máximo de tentativas
    if (checkPaymentStatus.attempts >= maxAttempts) {
      console.log('Número máximo de tentativas atingido');
      
      if (statusMessageElement) {
        statusMessageElement.innerHTML = `Tempo limite excedido. O pagamento ainda pode ser processado, mas a verificação automática foi interrompida.`;
      }
      
      return true;
    }
    
    // Continuar verificando
    return false;
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    
    const statusMessageElement = document.getElementById('payment-status-message');
    if (statusMessageElement) {
      statusMessageElement.textContent = `Erro ao verificar status. Tentando novamente...`;
    }
    
    // Se atingiu o número máximo de tentativas
    if (checkPaymentStatus.attempts >= maxAttempts) {
      if (statusMessageElement) {
        statusMessageElement.innerHTML = `Tempo limite excedido. O pagamento ainda pode ser processado, mas a verificação automática foi interrompida.`;
      }
      return true;
    }
    
    return false;
  }
}

// Função para verificar o status do pagamento
async function checkPaymentStatus(paymentId) {
  try {
    // Verificar se o paymentId existe
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }
    
    // Obter a URL base do servidor
    const baseUrl = getServerBaseUrl();

    // Fazer requisição para verificar o status do pagamento
    const response = await fetch(`${baseUrl}/Pagamento/payment-status.php?payment_id=${paymentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return the data from the function
  
  } catch (error) {
    // Tratar erros durante a verificação do status do pagamento
    console.error('Error checking payment status:', error);
  
    // Atualizar mensagem de status se o elemento existir
    const statusMessage = document.getElementById('payment-status-message');
    if (statusMessage) {
      statusMessage.textContent = 'Erro ao verificar status do pagamento. Tentando novamente...';
    }
    
    return false; // Continuar verificando
  }
}

// Function to manually check payment status
function manualCheckStatus(paymentId) {
  checkPaymentStatus(paymentId);
  // Não use return aqui, pois não é necessário
}
// Function to check payment status periodically
function startPaymentStatusCheck(paymentId) {
  console.log('Starting periodic payment status check:', paymentId);
  
  // Settings for periodic check
  const checkInterval = 5000; // 5 seconds between checks
  const maxAttempts = 60; // Check for up to 5 minutes (60 * 5s = 300s = 5min)
  let attempts = 0;
  
  // Salvar o ID do pagamento no sessionStorage para uso posterior
  sessionStorage.setItem('pixPaymentId', paymentId);
  
  // Função para executar a verificação periodicamente
  async function runPeriodicCheck() {
    const shouldStop = await checkPaymentStatus(paymentId);
    attempts++;
    
    if (!shouldStop && attempts < maxAttempts) {
      // Agendar próxima verificação
      setTimeout(runPeriodicCheck, checkInterval);
    }
  }
  
  // Iniciar a verificação periódica
  runPeriodicCheck();
}

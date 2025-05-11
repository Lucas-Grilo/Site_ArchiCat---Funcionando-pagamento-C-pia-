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
  const possibleKeys = ['screenCapture', 'userImage', 'capturedImage'];
  
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
      // Criar elemento de imagem e definir a fonte
      const img = document.createElement('img');
      
      // Definir atributos da imagem primeiro
      img.alt = 'Sua imagem personalizada';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '300px';
      
      // Adicionar a imagem ao DOM imediatamente
      userImagePreview.appendChild(img);
      
      // Adicionar evento para verificar se a imagem carregou com sucesso
      img.onload = function() {
        console.log('Imagem carregada com sucesso!');
        
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
        
        // Tentar carregar uma imagem padrão como fallback
        try {
          const fallbackImg = document.createElement('img');
          fallbackImg.src = 'img/logo1.png';
          fallbackImg.alt = 'Imagem padrão';
          fallbackImg.style.maxWidth = '100%';
          fallbackImg.style.maxHeight = '300px';
          userImagePreview.innerHTML = '';
          userImagePreview.appendChild(fallbackImg);
          console.log('Carregando imagem padrão como fallback');
        } catch (fallbackError) {
          console.error('Erro ao carregar imagem padrão:', fallbackError);
        }
      };
      
      // Definir a fonte da imagem após configurar os eventos
      img.src = screenCapture;
    } catch (error) {
      console.error('Erro ao processar a imagem:', error);
      userImagePreview.innerHTML = '<p>Erro ao processar a imagem.</p>';
    }
  } else {
    // Se não houver imagem no sessionStorage ou localStorage, exibir mensagem e tentar carregar imagem padrão
    console.error('Não foi possível carregar a imagem do sessionStorage ou localStorage.');
    
    try {
      const fallbackImg = document.createElement('img');
      fallbackImg.src = 'img/logo1.png';
      fallbackImg.alt = 'Imagem padrão';
      fallbackImg.style.maxWidth = '100%';
      fallbackImg.style.maxHeight = '300px';
      userImagePreview.innerHTML = '';
      userImagePreview.appendChild(fallbackImg);
      console.log('Carregando imagem padrão como fallback');
    } catch (fallbackError) {
      console.error('Erro ao carregar imagem padrão:', fallbackError);
      userImagePreview.innerHTML = '<p>Não foi possível carregar a imagem.</p>';
    }
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
  
  // Configurar o botão PIX
  const pixButton = document.getElementById('pix-button');
  if (pixButton) {
    // Remover eventos anteriores para evitar duplicação
    const newPixButton = pixButton.cloneNode(true);
    
    // Adicionar evento de clique ao novo botão
    newPixButton.addEventListener('click', function() {
      console.log('Botão PIX clicado, chamando processPixPayment');
      processPixPayment();
    });
    
    // Substituir o botão original pelo novo com o evento
    pixButton.parentNode.replaceChild(newPixButton, pixButton);
    console.log('Evento de clique adicionado ao botão PIX');
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

// Função para configurar o botão de buscar CEP
function setupCepButton() {
  console.log('Configurando botão de buscar CEP...');
  
  // Obter o elemento de input do CEP
  const cepInput = document.getElementById('cep');
  
  if (!cepInput) {
    console.error('Elemento de input CEP não encontrado no DOM');
    return;
  }
  
  // Verificar se o botão já existe
  let buscarCepButton = document.getElementById('buscar-cep');
  
  if (!buscarCepButton) {
    console.log('Botão de buscar CEP não encontrado, criando dinamicamente...');
    
    // Verificar se existe o container cep-input-group no HTML
    const cepInputGroup = document.querySelector('.cep-input-group');
    
    if (cepInputGroup) {
      // Criar um botão e adicioná-lo ao container existente
      buscarCepButton = document.createElement('button');
      buscarCepButton.type = 'button';
      buscarCepButton.id = 'buscar-cep';
      buscarCepButton.className = 'buscar-cep-button';
      buscarCepButton.textContent = 'Buscar';
      
      // Inserir o botão no container
      cepInputGroup.appendChild(buscarCepButton);
      console.log('Botão de buscar CEP criado dinamicamente dentro do grupo existente');
    } else {
      // Se não encontrar o container, criar um novo container
      const cepContainer = cepInput.parentElement;
      
      if (cepContainer) {
        // Criar um novo container para agrupar o input e o botão
        const newCepInputGroup = document.createElement('div');
        newCepInputGroup.className = 'cep-input-group';
        newCepInputGroup.style.display = 'flex';
        newCepInputGroup.style.gap = '10px';
        
        // Criar o botão
        buscarCepButton = document.createElement('button');
        buscarCepButton.type = 'button';
        buscarCepButton.id = 'buscar-cep';
        buscarCepButton.className = 'buscar-cep-button';
        buscarCepButton.textContent = 'Buscar';
        buscarCepButton.style.padding = '8px 15px';
        buscarCepButton.style.cursor = 'pointer';
        
        // Substituir o input original pelo novo container
        cepContainer.insertBefore(newCepInputGroup, cepInput);
        cepContainer.removeChild(cepInput);
        
        // Adicionar o input e o botão ao novo container
        newCepInputGroup.appendChild(cepInput);
        newCepInputGroup.appendChild(buscarCepButton);
        
        console.log('Criado novo container cep-input-group com botão de buscar CEP');
      } else {
        // Fallback: inserir o botão após o input se não encontrar nenhum container
        buscarCepButton = document.createElement('button');
        buscarCepButton.type = 'button';
        buscarCepButton.id = 'buscar-cep';
        buscarCepButton.className = 'buscar-cep-button';
        buscarCepButton.textContent = 'Buscar';
        buscarCepButton.style.marginLeft = '10px';
        buscarCepButton.style.padding = '8px 15px';
        buscarCepButton.style.cursor = 'pointer';
        
        // Inserir o botão após o input de CEP
        cepInput.insertAdjacentElement('afterend', buscarCepButton);
        console.log('Botão de buscar CEP criado dinamicamente (fallback)');
      }
    }
  } else {
    console.log('Botão de buscar CEP já existe no DOM');
  }
  
  // Adicionar evento ao botão de buscar CEP (original ou criado dinamicamente)
  buscarCepButton = document.getElementById('buscar-cep'); // Obter novamente para garantir
  if (buscarCepButton) {
    // Remover eventos anteriores para evitar duplicação
    const newButton = buscarCepButton.cloneNode(true);
    buscarCepButton.parentNode.replaceChild(newButton, buscarCepButton);
    buscarCepButton = newButton;
    
    buscarCepButton.addEventListener('click', function() {
      const cep = cepInput.value;
      if (cep) {
        buscarCep(cep);
      } else {
        messageDiv.textContent = "Por favor, digite um CEP válido.";
        messageDiv.style.color = "#cc0000";
      }
    });
    
    // Adicionar evento de tecla Enter no campo de CEP
    cepInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault(); // Evitar envio do formulário
        const cep = cepInput.value;
        if (cep) {
          buscarCep(cep);
        } else {
          messageDiv.textContent = "Por favor, digite um CEP válido.";
          messageDiv.style.color = "#cc0000";
        }
      }
    });
    
    console.log('Eventos adicionados ao botão de buscar CEP e campo de CEP');
  } else {
    console.error('Botão de buscar CEP não encontrado após tentativa de criação');
  }
}

// Função para processar pagamento PIX
async function processPixPayment() {
  console.log('Função processPixPayment chamada');
  // Adicionar log para depuração
  console.log('Iniciando processamento de pagamento PIX');
  
  // Verificar se o elemento messageDiv existe
  if (!messageDiv) {
    console.error('Elemento messageDiv não encontrado no DOM');
    alert('Erro ao processar pagamento: Elemento de mensagem não encontrado.');
    return;
  }
  
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
    
    // Obter o valor total
    const totalElement = document.getElementById('total-geral');
    let total = 100.00; // Valor padrão
    
    if (totalElement) {
      // Remover caracteres não numéricos e converter para float
      const totalText = totalElement.textContent.replace(/[^0-9.,]/g, '').replace(',', '.');
      const parsedTotal = parseFloat(totalText);
      if (!isNaN(parsedTotal)) {
        total = parsedTotal;
      } else {
        console.warn('Não foi possível converter o valor total:', totalElement.textContent);
      }
    } else {
      console.warn('Elemento total-geral não encontrado, usando valor padrão');
    }
    
    console.log('Valores dos campos:', { nome, cpf, email, telefone, total });
    
    // Obter os dados de endereço
    const cepElement = document.getElementById('cep');
    const ruaElement = document.getElementById('rua');
    const numeroElement = document.getElementById('numero');
    const complementoElement = document.getElementById('complemento');
    const bairroElement = document.getElementById('bairro');
    const cidadeElement = document.getElementById('cidade');
    const estadoElement = document.getElementById('estado');
    
    const cep = cepElement ? cepElement.value : '';
    const rua = ruaElement ? ruaElement.value : '';
    const numero = numeroElement ? numeroElement.value : '';
    const complemento = complementoElement ? complementoElement.value : '';
    const bairro = bairroElement ? bairroElement.value : '';
    const cidade = cidadeElement ? cidadeElement.value : '';
    const estado = estadoElement ? estadoElement.value : '';
    
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
    
    // Mostrar mensagem de carregamento
    messageDiv.textContent = "Processando pagamento PIX, aguarde...";
    messageDiv.style.color = "#0066cc";
    
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
          number: cpfNumerico
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
    const endpoint = `${baseUrl}/Pagamento/process-pix.php`;
    console.log('Enviando dados para:', endpoint);
    console.log('Dados enviados:', JSON.stringify(paymentData));
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      console.log('Resposta recebida do servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Erro no servidor: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Detalhes do erro:', errorData);
          if (errorData.error) {
            errorMessage += ` - ${errorData.error}`;
          }
          if (errorData.details) {
            errorMessage += ` (${errorData.details})`;
          }
        } catch (jsonError) {
          const errorText = await response.text();
          console.error('Erro na resposta do servidor (texto):', errorText);
        }
        
        messageDiv.textContent = errorMessage;
        messageDiv.style.color = "#cc0000";
        return;
      }
      
      const data = await response.json();
      console.log('Dados recebidos do servidor:', data);
      
      // Exibir o QR Code e as instruções
      const pixContainer = document.getElementById('qr-code-container');
      if (!pixContainer) {
        console.error('Elemento qr-code-container não encontrado no DOM');
        messageDiv.textContent = "Erro ao exibir QR Code. Elemento container não encontrado.";
        messageDiv.style.color = "#cc0000";
        return;
      }
      
      // Verificar se os dados do QR code estão presentes
      if (!data.qrCodeBase64) {
        console.error('QR Code Base64 não encontrado na resposta:', data);
        messageDiv.textContent = "Erro ao gerar QR Code. Dados incompletos na resposta.";
        messageDiv.style.color = "#cc0000";
        return;
      }
      
      // Limpar o container antes de adicionar o novo conteúdo
      pixContainer.innerHTML = '';
      
      // Criar elementos individualmente para melhor controle
      const title = document.createElement('h3');
      title.textContent = 'Pagamento PIX Gerado';
      pixContainer.appendChild(title);
      
      const scanText = document.createElement('p');
      scanText.textContent = 'Escaneie o QR Code abaixo com o aplicativo do seu banco:';
      pixContainer.appendChild(scanText);
      
      const qrImg = document.createElement('img');
      qrImg.src = `data:image/png;base64,${data.qrCodeBase64}`;
      qrImg.alt = 'QR Code PIX';
      qrImg.style.maxWidth = '250px';
      pixContainer.appendChild(qrImg);
      
      const copyText = document.createElement('p');
      copyText.textContent = 'Ou copie o código PIX:';
      pixContainer.appendChild(copyText);
      
      const pixCodeArea = document.createElement('textarea');
      pixCodeArea.readOnly = true;
      pixCodeArea.style.width = '100%';
      pixCodeArea.style.height = '80px';
      pixCodeArea.value = data.pixCode;
      pixCodeArea.id = 'pix-code-text';
      pixContainer.appendChild(pixCodeArea);
      
      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copiar Código';
      copyButton.className = 'copy-button';
      copyButton.id = 'copy-pix-code';
      pixContainer.appendChild(copyButton);
      
      const valueText = document.createElement('p');
      valueText.textContent = `Valor: R$ ${data.transactionAmount.toFixed(2)}`;
      pixContainer.appendChild(valueText);
      
      const idText = document.createElement('p');
      idText.textContent = `ID do Pagamento: ${data.payment_id}`;
      pixContainer.appendChild(idText);
      
      const statusText = document.createElement('p');
      statusText.textContent = `Status: ${data.status}`;
      statusText.id = 'payment-status-text';
      pixContainer.appendChild(statusText);
      
      const checkButton = document.createElement('button');
      checkButton.textContent = 'Verificar Status do Pagamento';
      checkButton.className = 'check-status-button';
      checkButton.id = 'check-payment-status';
      pixContainer.appendChild(checkButton);
      
      // Adicionar evento para copiar o código PIX
      copyButton.addEventListener('click', function() {
        const pixCodeText = document.getElementById('pix-code-text');
        if (pixCodeText) {
          pixCodeText.select();
          try {
            // Tentar usar a API moderna de clipboard
            if (navigator.clipboard) {
              navigator.clipboard.writeText(pixCodeText.value)
                .then(() => {
                  this.textContent = 'Código Copiado!';
                  setTimeout(() => {
                    this.textContent = 'Copiar Código';
                  }, 2000);
                })
                .catch(err => {
                  console.error('Erro ao copiar texto com clipboard API:', err);
                  // Fallback para o método antigo
                  document.execCommand('copy');
                  this.textContent = 'Código Copiado!';
                  setTimeout(() => {
                    this.textContent = 'Copiar Código';
                  }, 2000);
                });
            } else {
              // Fallback para navegadores que não suportam clipboard API
              document.execCommand('copy');
              this.textContent = 'Código Copiado!';
              setTimeout(() => {
                this.textContent = 'Copiar Código';
              }, 2000);
            }
          } catch (err) {
            console.error('Erro ao copiar texto:', err);
            alert('Não foi possível copiar o código automaticamente. Por favor, selecione o texto e copie manualmente.');
          }
        }
      });
      
      // Adicionar evento para verificar o status do pagamento
      checkButton.addEventListener('click', async function() {
        this.textContent = 'Verificando...';
        this.disabled = true;
        
        try {
          const statusResponse = await fetch(`${baseUrl}/Pagamento/payment-status.php?action=payment-status&id=${data.payment_id}`);
          
          if (!statusResponse.ok) {
            throw new Error(`Erro ao verificar status: ${statusResponse.status} ${statusResponse.statusText}`);
          }
          
          const statusData = await statusResponse.json();
          console.log('Status do pagamento:', statusData);
          
          const statusElement = document.getElementById('payment-status-text');
          if (statusElement) {
            statusElement.textContent = `Status: ${statusData.status || 'Pendente'} ${statusData.status_detail ? `(${statusData.status_detail})` : ''}`;
          }
          
          if (statusData.is_approved) {
            // Redirecionar para a página de sucesso
            messageDiv.textContent = "Pagamento aprovado! Redirecionando...";
            messageDiv.style.color = "#008800";
            setTimeout(() => {
              window.location.href = 'success.html';
            }, 1500);
          } else {
            this.textContent = 'Verificar Novamente';
            this.disabled = false;
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
          this.textContent = 'Erro ao Verificar';
          setTimeout(() => {
            this.textContent = 'Verificar Status do Pagamento';
            this.disabled = false;
          }, 2000);
        }
      });
      
      // Ocultar o botão PIX original para evitar múltiplos pagamentos
      const pixButton = document.getElementById('pix-button');
      if (pixButton) {
        pixButton.style.display = 'none';
      }
      
      // Limpar a mensagem de carregamento
      messageDiv.textContent = "QR Code PIX gerado com sucesso!";
      messageDiv.style.color = "#008800";
      
      // Salvar o ID do pagamento para verificação posterior
      sessionStorage.setItem('pixPaymentId', data.payment_id);
      console.log('ID do pagamento PIX salvo:', data.payment_id);
      
      // Iniciar verificação automática do status a cada 30 segundos
      const checkInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${baseUrl}/Pagamento/payment-status.php?action=payment-status&id=${data.payment_id}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('Verificação automática de status:', statusData);
            
            const statusElement = document.getElementById('payment-status-text');
            if (statusElement) {
              statusElement.textContent = `Status: ${statusData.status || 'Pendente'} ${statusData.status_detail ? `(${statusData.status_detail})` : ''}`;
            }
            
            if (statusData.is_approved) {
              clearInterval(checkInterval);
              messageDiv.textContent = "Pagamento aprovado! Redirecionando...";
              messageDiv.style.color = "#008800";
              setTimeout(() => {
                window.location.href = 'success.html';
              }, 1500);
            }
          }
        } catch (error) {
          console.error('Erro na verificação automática de status:', error);
        }
      }, 30000); // Verificar a cada 30 segundos
    } catch (fetchError) {
      console.error('Erro ao fazer requisição para o servidor:', fetchError);
      messageDiv.textContent = 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
      messageDiv.style.color = "#cc0000";
    }
  } catch (error) {
    console.error('Erro geral ao processar pagamento PIX:', error);
    messageDiv.textContent = 'Erro ao processar o pagamento. Tente novamente mais tarde.';
    messageDiv.style.color = "#cc0000";
  }
}
      sendEmailWithPaymentInfo(nome, email, total);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      messageDiv
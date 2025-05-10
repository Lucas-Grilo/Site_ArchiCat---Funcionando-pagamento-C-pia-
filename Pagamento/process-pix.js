// Arquivo para processar pagamentos PIX no frontend
// Como o PHP não está disponível no ambiente, vamos usar o backend Node.js

/**
 * Função para determinar a URL base do servidor
 */
function getServerBaseUrl() {
    // Em produção, o servidor estará no mesmo domínio que o frontend
    // Em desenvolvimento, usamos localhost:3000
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
        // Em produção, usamos a mesma origem da página atual
        return window.location.origin;
    } else {
        // Em desenvolvimento, usamos localhost:3000
        return 'http://localhost:3000';
    }
}

/**
 * Função para processar pagamento PIX
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} - Resposta do processamento
 */
async function processPixPayment(paymentData) {
    try {
        // Usar sempre a rota do Express para processar o pagamento
        const baseUrl = getServerBaseUrl();
        const apiUrl = `${baseUrl}/process-pix`;
        
        console.log('Enviando requisição para:', apiUrl);
        console.log('Dados enviados:', JSON.stringify(paymentData));
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        console.log('Resposta recebida, status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro no servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos do servidor:', data);
        return data;
    } catch (error) {
        console.error('Erro ao processar pagamento PIX:', error);
        throw error;
    }
}

// Exportar a função para uso em outros arquivos
window.processPixPaymentAPI = processPixPayment;
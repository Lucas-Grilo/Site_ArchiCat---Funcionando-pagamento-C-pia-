/// Script para iniciar o servidor automaticamente e garantir que as miniaturas sejam carregadas corretamente

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
 * Função para iniciar o servidor backend
 */
async function iniciarServidor() {
    try {
        console.log('Tentando iniciar o servidor...');
        
        // Em produção, esta função não faz nada, pois o servidor já deve estar rodando
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.log('Ambiente de produção detectado. O servidor já deve estar em execução.');
            return;
        }
        
        // Usando a API Fetch para fazer uma requisição ao endpoint que inicia o servidor
        const baseUrl = getServerBaseUrl();
        const response = await fetch(`${baseUrl}/api/iniciar-servidor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Resposta do servidor:', data);
        
        if (data.success) {
            console.log('Servidor iniciado com sucesso!');
        } else {
            console.error('Falha ao iniciar o servidor:', data.message);
        }
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
    }
}

/**
 * Função para reiniciar o servidor e limpar o cache
 */
async function reiniciarServidorCompleto() {
    try {
        console.log('Tentando reiniciar o servidor e limpar cache...');
        
        // Em produção, esta função não faz nada, pois o servidor já deve estar rodando
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.log('Ambiente de produção detectado. O servidor não pode ser reiniciado pelo cliente.');
            return;
        }
        
        // Usando a API Fetch para fazer uma requisição ao endpoint que reinicia o servidor
        const baseUrl = getServerBaseUrl();
        const response = await fetch(`${baseUrl}/api/reiniciar-servidor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Resposta do servidor:', data);
        
        if (data.success) {
            console.log('Servidor reiniciado com sucesso!');
            // Verificar se as miniaturas foram carregadas corretamente após um breve intervalo
            setTimeout(verificarMiniaturas, 3000);
        } else {
            console.error('Falha ao reiniciar o servidor:', data.message);
        }
    } catch (error) {
        console.error('Erro ao reiniciar o servidor:', error);
    }
}

/**
 * Função para verificar se as miniaturas foram carregadas corretamente
 */
async function verificarMiniaturas() {
    try {
        console.log('Verificando se as miniaturas foram carregadas...');
        
        // Tentar buscar as miniaturas do servidor com o endereço completo
        const baseUrl = getServerBaseUrl();
        const response = await fetch(`${baseUrl}/api/miniaturas`);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar miniaturas: ${response.status} ${response.statusText}`);
        }
        
        const miniaturas = await response.json();
        
        if (miniaturas && miniaturas.length > 0) {
            console.log(`Miniaturas carregadas com sucesso! Total: ${miniaturas.length}`);
        } else {
            console.warn('Nenhuma miniatura encontrada. Tentando reiniciar o servidor novamente...');
            // Se não houver miniaturas, tentar reiniciar o servidor novamente
            setTimeout(reiniciarServidorCompleto, 1000);
        }
    } catch (error) {
        console.error('Erro ao verificar miniaturas:', error);
        // Em caso de erro, tentar reiniciar o servidor novamente
        setTimeout(reiniciarServidorCompleto, 1000);
    }
}

// Remover o código que usa document, pois estamos em ambiente Node.js
// document.addEventListener('DOMContentLoaded', () => {
//   console.log('Página carregada, verificando servidor...');
//   setTimeout(verificarServidor, 2000);
// });

// Em vez disso, chamar a verificação diretamente
console.log('Iniciando verificação do servidor...');
// Remover a chamada para verificarServidor que não existe
// setTimeout(verificarServidor, 2000);
// Chamar diretamente a função que existe
reiniciarServidorCompleto();
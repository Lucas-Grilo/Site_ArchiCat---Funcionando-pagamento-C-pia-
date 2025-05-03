# Como Resolver o Erro de Conexão no Sistema de Pagamento

## Problema

Se você está vendo o erro `Failed to fetch` ou `ERR_CONNECTION_REFUSED` ao tentar gerar um QR Code PIX, isso significa que o servidor backend não está em execução.

## Solução Rápida

1. Localize o arquivo `iniciar-servidor.bat` na pasta principal do projeto
2. Dê um duplo clique neste arquivo para executá-lo
3. Uma janela de comando será aberta
   - Se o Node.js não estiver instalado, o script abrirá automaticamente a página de download
   - Se o Node.js estiver instalado, o servidor será iniciado automaticamente
4. Mantenha esta janela aberta enquanto estiver usando o sistema de pagamento
5. Agora você pode voltar à página de pagamento e tentar gerar o QR Code PIX novamente

## Solução Detalhada

### 1. Instalação do Node.js

Se o script indicar que o Node.js não está instalado:

1. Na página de download que foi aberta, clique no botão "Windows Installer" para baixar o instalador
2. Execute o instalador baixado e siga as instruções na tela
3. Após a instalação, feche todas as janelas de comando abertas
4. Execute novamente o arquivo `iniciar-servidor.bat`

### 2. Verificação do Servidor

Quando o servidor estiver funcionando corretamente, você verá uma mensagem como:

```
Servidor rodando na porta 3000
Ambiente: desenvolvimento
```

### 3. Observações Importantes

- O servidor backend deve estar sempre em execução quando você estiver utilizando a funcionalidade de pagamento PIX
- Se você fechar a janela de comando onde o servidor está rodando, a conexão será interrompida e o erro voltará a ocorrer
- Certifique-se de ter uma conexão com a internet ativa para que as requisições ao Mercado Pago funcionem corretamente

## Suporte

Se você continuar enfrentando problemas após seguir estas instruções, entre em contato com o suporte técnico.
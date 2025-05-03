# Como Resolver o Erro de Conexão no Sistema de Pagamento

## Problema

Se você está vendo o erro `Failed to fetch` ou `ERR_CONNECTION_REFUSED` ao tentar gerar um QR Code PIX, isso significa que o servidor backend não está em execução.

## Solução

### Opção 1: Usando o Script PowerShell (Recomendado)

1. Localize o arquivo `iniciar-servidor.ps1` na pasta principal do projeto
2. Clique com o botão direito neste arquivo e selecione "Executar com PowerShell"
3. Uma janela do PowerShell será aberta e o servidor será iniciado
4. **IMPORTANTE:** Mantenha esta janela aberta enquanto estiver usando o sistema de pagamento
5. Volte para a página de pagamento e tente gerar o QR Code PIX novamente

### Opção 2: Usando o Prompt de Comando

Se a opção acima não funcionar, você pode iniciar o servidor manualmente:

1. Abra o Prompt de Comando (cmd) como administrador
2. Navegue até a pasta do projeto usando o comando:
   ```
   cd "caminho\para\a\pasta\Site_ArchiCat - Copia\backend"
   ```
3. Execute o comando:
   ```
   node server.js
   ```
4. **IMPORTANTE:** Mantenha esta janela aberta enquanto estiver usando o sistema de pagamento
5. Volte para a página de pagamento e tente gerar o QR Code PIX novamente

## Observações Importantes

- O servidor backend deve estar sempre em execução quando você estiver utilizando a funcionalidade de pagamento PIX
- Se você fechar o terminal onde o servidor está rodando, a conexão será interrompida e o erro "Failed to fetch" voltará a ocorrer
- Certifique-se de ter uma conexão com a internet ativa para que as requisições ao Mercado Pago funcionem corretamente
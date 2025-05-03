# Como Resolver o Problema de Preços Não Atualizados

## Problema

Você modificou os valores dos preços no DB Browser for SQLite, mas essas alterações não estão sendo refletidas no site. Isso acontece devido a três fatores principais:

1. **Cache do navegador** - O navegador armazena dados antigos para carregamento mais rápido
2. **Cache do servidor** - O Node.js mantém dados em memória durante sua execução
3. **Cache do sessionStorage** - O site armazena dados no sessionStorage do navegador

## Solução Completa

### 1. Feche o DB Browser for SQLite

Certifique-se de que o DB Browser for SQLite esteja fechado para liberar o arquivo do banco de dados.

### 2. Use o novo script de limpeza de cache

Foi criado um novo script chamado `limpar-cache-e-reiniciar.bat` que realiza uma limpeza mais completa:

1. Para o servidor atual
2. Limpa o cache do banco de dados
3. Solicita que você feche todas as janelas do navegador
4. Limpa o cache DNS do sistema
5. Reinicia o servidor

### 3. Limpe o cache do navegador

Após executar o script, você deve:

- **Opção 1:** Abrir o navegador em modo anônimo/privativo (Ctrl+Shift+N no Chrome)
- **Opção 2:** Limpar o cache do navegador manualmente:
  - Chrome/Edge: Pressione Ctrl+Shift+Del
  - Selecione "Imagens e arquivos em cache"
  - Clique em "Limpar dados"

### 4. Acesse o site novamente

Ao acessar o site, os novos preços devem ser carregados diretamente do banco de dados.

### 5. Se ainda não funcionar

Se ainda não visualizar as alterações:

1. Pressione Ctrl+F5 para forçar uma atualização completa
2. Verifique se o sessionStorage está sendo limpo corretamente:
   - Abra as Ferramentas de Desenvolvedor (F12)
   - Vá para a aba "Application" ou "Aplicativo"
   - No painel esquerdo, expanda "Storage" e selecione "Session Storage"
   - Clique com o botão direito e selecione "Clear" ou "Limpar"

## Explicação Técnica

O problema ocorre porque:

1. O servidor Node.js carrega os dados do banco de dados na memória quando é iniciado
2. O frontend armazena dados no sessionStorage do navegador
3. O navegador mantém arquivos em cache

O novo script `limpar-cache-e-reiniciar.bat` resolve esses problemas ao:

1. Parar o servidor atual (liberando a memória)
2. Executar o script de limpeza de cache do banco de dados
3. Solicitar o fechamento do navegador (para limpar o sessionStorage)
4. Limpar o cache DNS do sistema
5. Reiniciar o servidor com dados atualizados

Isso garante que todas as camadas de cache sejam limpas e que os novos preços sejam carregados corretamente.
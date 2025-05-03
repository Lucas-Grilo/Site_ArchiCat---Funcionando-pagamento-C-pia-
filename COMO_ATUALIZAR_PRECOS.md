# Como Atualizar Preços no ArchiCat

Este guia explica como atualizar os preços das miniaturas no sistema ArchiCat e garantir que as alterações sejam exibidas corretamente no site.

## Problema

Quando você altera os preços pelo DB Browser for SQLite, as alterações podem não aparecer imediatamente no site devido a:

1. **Cache do navegador** - O navegador armazena dados antigos
2. **Cache do servidor** - O servidor Node.js mantém dados em memória
3. **Falta de reinicialização** - O servidor precisa ser reiniciado para carregar os novos dados

## Solução

Siga estas etapas para garantir que as alterações nos preços sejam exibidas corretamente:

### 1. Atualize os preços no banco de dados

- Abra o DB Browser for SQLite
- Carregue o arquivo `backend/database/archicat.db`
- Faça as alterações necessárias na tabela `miniaturas`
- Salve as alterações (Arquivo > Salvar)

### 2. Reinicie o servidor e limpe o cache

- Feche o DB Browser for SQLite
- Execute o arquivo `reiniciar-servidor-completo.bat` na pasta principal do projeto
- Este script irá:
  - Parar o servidor atual
  - Limpar o cache do banco de dados
  - Reiniciar o servidor

### 3. Limpe o cache do navegador

- Feche todas as janelas do navegador
- Abra o navegador em modo anônimo/privado OU
- Limpe o cache do navegador:
  - Chrome/Edge: Pressione `Ctrl+Shift+Del`, selecione "Imagens e arquivos em cache" e clique em "Limpar dados"
  - Firefox: Pressione `Ctrl+Shift+Del`, selecione "Cache" e clique em "Limpar agora"

### 4. Acesse o site novamente

- Abra o site
- Se ainda não visualizar as alterações, pressione `Ctrl+F5` para forçar uma atualização completa

## Solução de problemas

Se as alterações ainda não aparecerem após seguir os passos acima:

1. Verifique se o servidor está rodando corretamente (deve haver uma janela de comando aberta mostrando "Servidor rodando na porta 3000")
2. Verifique se as alterações foram salvas corretamente no banco de dados
3. Tente usar outro navegador
4. Reinicie o computador e repita os passos acima

## Observações importantes

- O sistema ArchiCat utiliza cache tanto no navegador quanto no servidor para melhorar o desempenho
- Sempre que fizer alterações no banco de dados, é necessário reiniciar o servidor e limpar o cache do navegador
- O arquivo `reiniciar-servidor-completo.bat` foi criado especificamente para facilitar este processo
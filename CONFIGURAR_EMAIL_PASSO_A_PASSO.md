# Configuração do E-mail do ArchiCat - Passo a Passo

## Problema Atual

O sistema não está conseguindo enviar e-mails porque a senha de aplicativo do Gmail não está configurada no arquivo `.env`. Esta senha é necessária para que o sistema possa enviar e-mails de confirmação de pagamento.

## Como Resolver

### Passo 1: Ativar a Verificação em Duas Etapas

1. Acesse sua conta Google em [myaccount.google.com](https://myaccount.google.com)
2. Clique em "Segurança" no menu lateral
3. Em "Como você faz login no Google", clique em "Verificação em duas etapas"
4. Siga as instruções para ativar a verificação em duas etapas (se ainda não estiver ativada)

### Passo 2: Criar uma Senha de Aplicativo

1. Após ativar a verificação em duas etapas, volte para a página de Segurança
2. Em "Como você faz login no Google", clique em "Senhas de app"
3. No campo "Selecionar app", escolha "Outro (Nome personalizado)"
4. Digite "ArchiCat" como nome do aplicativo
5. Clique em "Gerar"
6. O Google irá gerar uma senha de 16 caracteres. **COPIE ESTA SENHA IMEDIATAMENTE**
   - Esta senha só será mostrada uma vez!
   - A senha terá exatamente 16 caracteres sem espaços

### Passo 3: Configurar o Arquivo .env

1. Abra o arquivo `backend/.env` no editor de texto
2. Localize a linha `EMAIL_PASSWORD=`
3. Cole a senha de aplicativo que você copiou logo após o sinal de igual
4. Salve o arquivo

Exemplo de como deve ficar:
```
EMAIL_PASSWORD=abcdefghijklmnop
```

### Passo 4: Verificar a Configuração

1. Execute o arquivo `verificar-email.bat` na pasta raiz do projeto
2. Se tudo estiver configurado corretamente, você verá uma mensagem de sucesso
3. Para testar o envio de e-mail, execute o comando:
   ```
   node backend\scripts\verificar-email.js --test
   ```

## Observações Importantes

- A senha de aplicativo é uma sequência de 16 caracteres sem espaços
- Não use a senha normal da conta de e-mail, use APENAS a senha de aplicativo
- Cada senha de aplicativo só pode ser visualizada uma vez durante a criação
- Se você perder a senha, precisará gerar uma nova
- As senhas de aplicativo não expiram, mas você pode revogá-las a qualquer momento nas configurações da sua conta Google

## Problemas Comuns

### Erro "Invalid login: 535-5.7.8 Username and Password not accepted"

Este erro indica que a senha fornecida não é válida. Verifique se:

1. Você está usando uma senha de aplicativo (não a senha normal da conta)
2. A senha foi copiada corretamente (16 caracteres sem espaços)
3. A verificação em duas etapas está ativada na conta

### Erro "Error: self signed certificate in certificate chain"

Este erro está relacionado à configuração de segurança. O sistema já está configurado para lidar com isso, mas se persistir, verifique sua conexão com a internet.

## Precisa de Ajuda?

Se você continuar tendo problemas para configurar o e-mail, verifique a documentação completa no arquivo `INSTRUCOES_EMAIL_GMAIL.md` ou entre em contato com o suporte técnico.
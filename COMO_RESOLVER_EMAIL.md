# Como Resolver o Problema de Envio de E-mail

## Problema Identificado

O sistema de pagamento está funcionando corretamente, mas os e-mails com as informações do comprador (nome, CPF, e-mail, telefone e endereço) não estão sendo enviados após a conclusão do pagamento.

## Causa do Problema

A senha do e-mail no arquivo de configuração `.env` não está definida corretamente. Atualmente, está configurada como um valor placeholder (`sua_senha_aqui`) em vez da senha real da conta de e-mail.

## Como Resolver

1. Abra o arquivo `.env` localizado na pasta `backend`
2. Localize a linha `EMAIL_PASSWORD=sua_senha_aqui`
3. Substitua `sua_senha_aqui` pela senha real da conta de e-mail `contato.archicat@gmail.com`

### Observações Importantes

- Se você não souber a senha da conta de e-mail, entre em contato com o administrador do sistema
- Para maior segurança, recomenda-se usar uma "senha de aplicativo" do Google em vez da senha principal da conta
  - Para criar uma senha de aplicativo:
    1. Acesse a conta do Gmail em [myaccount.google.com](https://myaccount.google.com)
    2. Vá para "Segurança" > "Como você faz login no Google" > "Senhas de app"
    3. Crie uma nova senha de aplicativo para "Outro (Nome personalizado)"
    4. Use essa senha gerada no arquivo `.env`

## Após a Configuração

1. Salve o arquivo `.env` após fazer as alterações
2. Reinicie o servidor executando o arquivo `iniciar-servidor.bat` na pasta principal do projeto
3. Teste novamente o processo de pagamento para verificar se os e-mails estão sendo enviados corretamente

## Verificação

Para confirmar que o e-mail está sendo enviado corretamente, você pode:

1. Realizar um pagamento de teste
2. Verificar a caixa de entrada do e-mail `contato.archicat@gmail.com`
3. Verificar o console do servidor para mensagens de sucesso ou erro relacionadas ao envio de e-mail
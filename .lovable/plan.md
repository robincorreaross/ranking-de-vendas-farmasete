Os erros reportados indicam:
1. **422 (Unprocessable Content)** no `/signup`: Provavelmente a senha é muito fraca ou o e-mail já existe.
2. **400 (Bad Request)** no `/token`: Credenciais incorretas (e-mail ou senha não conferem).

### Plano de Ação
1. **Verificação de Senha**: Vou adicionar uma validação visual no formulário para garantir que a senha tenha pelo menos 6 caracteres (padrão do Supabase).
2. **Tratamento de Erros Específicos**: Vou atualizar o componente de Auth para tratar o erro 422 e avisar se a senha for muito curta ou se o e-mail já estiver em uso.
3. **Reset de Senha (Opcional)**: Posso adicionar um link para "Esqueci minha senha" se você precisar recuperar o acesso a uma conta existente.

### Por que isso acontece?
O erro 422 geralmente ocorre quando o Supabase rejeita os dados enviados. A causa mais comum é a senha não atingir o mínimo de caracteres ou conter padrões proibidos (como senhas muito óbvias que o filtro HIBP bloqueia).

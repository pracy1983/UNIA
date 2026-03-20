---
description: deploy da aplicação UNIA após qualquer alteração de código
---

# Workflow: Deploy UNIA (Easypanel via GitHub)

## Como funciona
O Easypanel monitora o branch `main` do repositório GitHub.
**Toda vez que há push na `main`, o Easypanel automaticamente:**
1. Detecta a mudança
2. Clona o repositório atualizado
3. Executa o `Dockerfile` (build frontend + backend)
4. Substitui o container em produção pelo novo

## Passos obrigatórios após QUALQUER alteração

// turbo-all

1. Adicionar todas as alterações ao staging
```bash
git add -A
```

2. Commitar com mensagem descritiva
```bash
git commit -m "feat/fix/style: <descrição clara da mudança>"
```

3. Enviar para o repositório remoto (dispara deploy automático)
```bash
git push origin main
```

4. Verificar o healthcheck em produção (aguardar ~2-3 min para o build)
```
https://unia.vrdncy.easypanel.host/health
```

## Regras
- Nunca faça apenas commit sem push — o deploy não será triggado
- Mensagens de commit devem descrever o que mudou (feat, fix, style, refactor, docs)
- JAMAIS fazer merge sem autorização explícita do usuário
- Em caso de erro no deploy, checar logs no painel do Easypanel

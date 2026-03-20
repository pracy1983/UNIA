# Project Workflow - UNIA

## 🔄 Fluxo de Desenvolvimento
1. **RESEARCH**: Ler arquivos e entender contexto.
2. **INNOVATE**: Propor soluções/ideias.
3. **PLAN**: Gerar `implementation_plan.md` e atualizar `PLAN.md`.
4. **EXECUTE**: Implementar conforme o plano aprovado.
5. **REVIEW**: Validar cada linha e funcionalidade.

## 🚀 Fluxo de Deploy (OBRIGATÓRIO após toda alteração)
O Easypanel monitora a branch `main` no GitHub e implanta automaticamente a cada push.

**Sequência SEMPRE executada ao fim de qualquer tarefa:**
```
git add -A
git commit -m "tipo: descrição clara"
git push origin main
```
Aguardar ~2-3 min e verificar: https://unia.vrdncy.easypanel.host/health

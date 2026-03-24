# Planejamento Geral - UNIA (MVP)

## 🎯 Objetivo
Criar o "Copiloto Definitivo de Relacionamentos" com foco em organização, memória e mediação via IA.

## 🏗️ Arquitetura Proposta
- **Nodes & Relations**: Usuários são nós. Relações são conexões entre nós com metadados/permissões.
- **IA Ephemeral**: Camada de processamento para conflitos que não persiste textos brutos.
- **Sync Engine**: Sincronização de calendários e ciclos biológicos.

## 🚀 Roadmap MVP
1. Ontoarding + Perfil (Dossiê).
2. Criação de Relações (Solo/Conectado).
3. Linha do Tempo de Memórias.
4. Botão SOS (Mediação Básica).
5. **UI Revamp**: Implementar layout Dashboard Premium conforme design (glassmorphism, background espacial).

## 🎨 Design & UI (Fase Atual)
- **Background**: Uso de `bg-desktop.png` e `bg-mobile.jpg`.
- **Glassmorphism**: Backdrop blur de 32px, bordas translúcidas (8% opacidade).
- **Layout**: Sidebar de 230px, grid de relacionamentos horizontal, widgets organizados.

## 🚀 Deployment & Automação
- **Easypanel**: Deploy automático via branch `main` no GitHub.
- **Workflow**: `git push origin main` -> Auto build & deploy.
- **Healthcheck**: Monitorado em `https://unia.vrdncy.easypanel.host/health`.
- **AI Engine**: Kit Antigravity integrado (.agent + GEMINI.md).

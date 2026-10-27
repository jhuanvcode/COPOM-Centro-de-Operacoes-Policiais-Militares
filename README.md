# 🚓 Sistema de Priorização de Ocorrências Policiais (COPOM / 190)

Projeto desenvolvido em **Java 25** e **TypeScript** para demonstrar na prática a importância de **algoritmos e estruturas de dados de alta performance** no tratamento e triagem de grandes volumes de chamados de emergência policial.

---

## 📌 Contexto e Problema do Mundo Real

Em centros de comando e controle policial (como a Central 190 / COPOM de grandes metrópoles), ocorrem milhares de chamados simultâneos por dia. A cada minuto chegam novas ocorrências de gravidades variadas:
- Crimes violentos contra a vida (homicídios, roubos à mão armada, sequestros);
- Acidentes graves de trânsito;
- Delitos patrimoniais leves (furtos);
- Infrações de menor potencial ofensivo (perturbação do sossego).

As viaturas disponíveis são limitadas. Por isso, a fila de atendimento **precisa ser recalculada e priorizada dinamicamente em tempo real** para despachar a viatura certa para a vítima com maior risco à vida.

---

## 📂 Arquitetura do Projeto

```text
sistema-priorizacao-ocorrencias/
├── compilar.bat                    # Script de compilação Java UTF-8
├── executar.bat                    # Script para execução no console (CLI)
├── executar-web.bat                # Inicia o servidor e abre o Dashboard no navegador
├── README.md                       # Documentação completa
├── bin/                            # Bytecode compilado (.class)
├── frontend/                       # FRONTEND TYPESCRIPT & WEB UI
│   ├── index.html                  # Painel tático Dark Mode COPOM 190
│   ├── style.css                   # Glassmorphism, badges de urgência e KPIs
│   ├── package.json                # Configuração do projeto npm/vite
│   ├── tsconfig.json               # Configuração estrita de compilação TypeScript
│   └── src/
│       ├── types.ts                # Modelos, DTOs e tipos TypeScript
│       ├── sorting.ts              # Algoritmos QuickSort, MergeSort, HeapSort em TS
│       ├── api.ts                  # Cliente assíncrono com fallback offline
│       └── app.ts                  # Controlador de tela, gráficos Canvas e despacho
└── src/
    └── br/com/policia/
        ├── model/                  # Domínio de dados (Ocorrência, Critérios, Regiões)
        ├── sorting/                # QuickSort, MergeSort, HeapSort, InsertionSort
        ├── generator/              # Gerador de grandes massas de dados sintéticos
        ├── benchmark/              # Métricas de execução, vazão e validação
        └── app/
            ├── ApiServer.java      # Servidor HTTP REST e servidor de arquivos estáticos
            └── Main.java           # Menu interativo no console com simulação real
```

---

## 🎯 Critérios de Priorização Disponíveis

O sistema suporta ordenação por qualquer um dos critérios exigidos no escopo:

1. **Gravidade Crítica (Decrescente)**: Prioriza ocorrências de gravidade 10 a 1 (risco iminente à vida);
2. **Tempo de Atendimento (Crescente)**: Ocorrências de rápida resolução para desafogar a fila;
3. **Distância da Viatura (Crescente)**: Chamados mais próximos da viatura disponível para resposta rápida;
4. **Data e Hora (Cronológico / FIFO)**: Atende chamados mais antigos primeiro evitando que chamados fiquem esquecidos;
5. **Score Composto de Risco**: Fórmula tática policial: `(Gravidade * 15) + Proximidade + Espera`;
6. **Volume por Região**: Regiões com maior acúmulo de chamados recebem reforço prioritário.

---

## ⚡ Algoritmos Comparados e Complexidade

| Algoritmo | Complexidade Média | Pior Caso | Memória Auxiliar | Estabilidade |
| :--- | :---: | :---: | :---: | :---: |
| **QuickSort** (Mediana de 3) | $\mathcal{O}(N \log N)$ | $\mathcal{O}(N^2)$ *(mitigado)* | $\mathcal{O}(\log N)$ pilha | Não |
| **MergeSort** | $\mathcal{O}(N \log N)$ | $\mathcal{O}(N \log N)$ | $\mathcal{O}(N)$ vetor aux | **Sim** |
| **HeapSort** | $\mathcal{O}(N \log N)$ | $\mathcal{O}(N \log N)$ | $\mathcal{O}(1)$ in-place | Não |
| **Java Native (TimSort)** | $\mathcal{O}(N \log N)$ | $\mathcal{O}(N \log N)$ | $\mathcal{O}(N)$ | **Sim** |
| **InsertionSort** | $\mathcal{O}(N^2)$ | $\mathcal{O}(N^2)$ | $\mathcal{O}(1)$ | **Sim** |



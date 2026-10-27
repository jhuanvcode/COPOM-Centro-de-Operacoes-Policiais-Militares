package br.com.policia.app;

import br.com.policia.benchmark.BenchmarkResult;
import br.com.policia.benchmark.BenchmarkRunner;
import br.com.policia.generator.OcorrenciaGenerator;
import br.com.policia.model.CriterioOrdenacao;
import br.com.policia.model.Ocorrencia;
import br.com.policia.model.Regiao;
import br.com.policia.sorting.*;

import java.util.*;

/**
 * Ponto de entrada do Sistema de Priorização de Ocorrências Policiais.
 */
public class Main {

    private static final Scanner SCANNER = new Scanner(System.in);
    private static final List<SortAlgorithm> ALGORITMOS = List.of(
            new QuickSort(),
            new MergeSort(),
            new HeapSort(),
            new JavaNativeSort(),
            new InsertionSort()
    );

    private static boolean servidorWebIniciado = false;

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("   SISTEMA DE PRIORIZAÇÃO E DESPACHO DE OCORRÊNCIAS POLICIAIS - COPOM / 190     ");
        System.out.println("================================================================================");
        System.out.println("Inicializando subsistemas e aquecendo JIT Compiler...");
        BenchmarkRunner.warmup(ALGORITMOS, CriterioOrdenacao.GRAVIDADE_DECRESCENTE.getComparator());
        System.out.println("[OK] Motor de ordenação pronto!");

        // Inicializa o servidor Web e abre o frontend automaticamente junto com o Main
        iniciarServidorWebAutomatico();

        boolean executando = true;
        while (executando) {
            exibirMenuPrincipal();
            System.out.print("Escolha uma opção: ");
            String opcao = SCANNER.nextLine().trim();

            switch (opcao) {
                case "1" -> executarBenchmarkComparativoPadrao();
                case "2" -> simularDespachoViaturas();
                case "3" -> executarCargaCustomizada();
                case "4" -> exibirDiferencialPratico();
                case "5" -> abrirOuReabrirNavegador();
                case "0" -> {
                    System.out.println("\nEncerrando o sistema de triagem policial. Tenha um excelente serviço!");
                    executando = false;
                }
                default -> System.out.println("\n[!] Opção inválida. Tente novamente.\n");
            }
        }
    }

    private static void exibirMenuPrincipal() {
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println(" MENU PRINCIPAL (Console & Web ativos simultaneamente):");
        System.out.println(" [1] Executar Benchmark Comparativo de Algoritmos (5k, 20k e 100k ocorrências)");
        System.out.println(" [2] Simular Triagem e Despacho de Viaturas (Visualizar Fila de Prioridades)");
        System.out.println(" [3] Teste com Volume e Critério Customizados");
        System.out.println(" [4] Diferencial Prático: Por que Ordenação Rápida Salva Vidas?");
        System.out.println(" [5] Reabrir Dashboard Web no Navegador (http://localhost:8080)");
        System.out.println(" [0] Sair");
        System.out.println("--------------------------------------------------------------------------------");
    }

    private static void executarBenchmarkComparativoPadrao() {
        int[] volumes = { 5_000, 20_000, 100_000 };
        Comparator<Ocorrencia> criterio = CriterioOrdenacao.GRAVIDADE_DECRESCENTE.getComparator();

        System.out.println("\n>>> INICIANDO BATERIA COMPARATIVA PADRÃO (Critério: Gravidade Decrescente)");

        for (int vol : volumes) {
            System.out.printf("%n=== Gerando %d ocorrências sintéticas... ===%n", vol);
            Ocorrencia[] dados = OcorrenciaGenerator.gerarOcorrencias(vol);
            List<BenchmarkResult> resultados = BenchmarkRunner.runAll(ALGORITMOS, dados, criterio);
            BenchmarkRunner.printReport(resultados, "Gravidade Decrescente", vol);
        }
    }

    private static void simularDespachoViaturas() {
        System.out.println("\n--- SIMULAÇÃO DE TRIAGEM EM TEMPO REAL ---");
        System.out.println("Quantos chamados deseja simular na central? (ex: 500, 2000, 10000): ");
        System.out.print("> ");
        int total = lerInteiro(1000);

        Ocorrencia[] chamados = OcorrenciaGenerator.gerarOcorrencias(total, true);

        System.out.println("\nEscolha o critério de priorização para o despacho das viaturas:");
        System.out.println(" [1] Gravidade Crítica (Crimes violentos e risco iminente à vida primeiro)");
        System.out.println(" [2] Menor Tempo de Atendimento (Resolução rápida para desafogar a fila)");
        System.out.println(" [3] Distância (Viatura mais próxima do local primeiro)");
        System.out.println(" [4] Fila Cronológica / FIFO (Mais antigas primeiro)");
        System.out.println(" [5] Score de Risco Operacional (Fórmula: Gravidade + Proximidade + Espera)");
        System.out.println(" [6] Regiões Sobrecarregadas (Maior volume de chamados por região primeiro)");
        System.out.print("Opção [1-6]: ");
        String opc = SCANNER.nextLine().trim();

        Comparator<Ocorrencia> comparator;
        String nomeCriterio;

        switch (opc) {
            case "2" -> {
                comparator = CriterioOrdenacao.TEMPO_ATENDIMENTO_CRESCENTE.getComparator();
                nomeCriterio = CriterioOrdenacao.TEMPO_ATENDIMENTO_CRESCENTE.getDescricao();
            }
            case "3" -> {
                comparator = CriterioOrdenacao.DISTANCIA_CRESCENTE.getComparator();
                nomeCriterio = CriterioOrdenacao.DISTANCIA_CRESCENTE.getDescricao();
            }
            case "4" -> {
                comparator = CriterioOrdenacao.DATA_CRONOLOGICA.getComparator();
                nomeCriterio = CriterioOrdenacao.DATA_CRONOLOGICA.getDescricao();
            }
            case "5" -> {
                comparator = CriterioOrdenacao.SCORE_RISCO_TRIAGEM.getComparator();
                nomeCriterio = CriterioOrdenacao.SCORE_RISCO_TRIAGEM.getDescricao();
            }
            case "6" -> {
                Map<Regiao, Integer> mapa = OcorrenciaGenerator.contarPorRegiao(chamados);
                comparator = CriterioOrdenacao.porRegiaoComMaiorVolume(mapa);
                nomeCriterio = "Volume por Região (Áreas Críticas)";
                System.out.println("\nDistribuição de chamados por região:");
                mapa.forEach((reg, qtd) -> System.out.printf("  - %-35s: %d chamados%n", reg.getNomeCompleto(), qtd));
            }
            default -> {
                comparator = CriterioOrdenacao.GRAVIDADE_DECRESCENTE.getComparator();
                nomeCriterio = CriterioOrdenacao.GRAVIDADE_DECRESCENTE.getDescricao();
            }
        }

        QuickSort qs = new QuickSort();
        long inicio = System.nanoTime();
        qs.sort(chamados, comparator);
        long tempoTotalMs = (System.nanoTime() - inicio) / 1_000_000;

        System.out.printf("%n[OK] %d ocorrências ordenadas com sucesso usando %s em %d ms!%n",
                total, qs.getName(), tempoTotalMs);

        System.out.println("\n" + "=".repeat(110));
        System.out.printf(" TOP 10 OCORRÊNCIAS PRIORITÁRIAS PARA DESPACHO IMEDIATO DE VIATURAS (%s)%n", nomeCriterio);
        System.out.println("=".repeat(110));
        System.out.printf("| %-8s | %-32s | %-9s | %-16s | %-12s | %-10s | %-12s |%n",
                "ID", "TIPO DO CHAMADO", "GRAVIDADE", "DATA/HORA", "DURAÇÃO EST.", "DISTÂNCIA", "REGIÃO");
        System.out.println("-".repeat(110));

        int limiteExibicao = Math.min(10, chamados.length);
        for (int i = 0; i < limiteExibicao; i++) {
            System.out.println(chamados[i].toRowFormat());
        }
        System.out.println("=".repeat(110));
        System.out.printf("Total de chamados aguardando na fila restante: %d%n%n", total - limiteExibicao);
    }

    private static void executarCargaCustomizada() {
        System.out.print("\nInforme a quantidade de ocorrências a testar (ex: 15000): ");
        int qtd = lerInteiro(15000);

        System.out.println("Gerando base sintética...");
        Ocorrencia[] dados = OcorrenciaGenerator.gerarOcorrencias(qtd, true);

        System.out.println("Deseja incluir algoritmos quadráticos O(N^2) no teste? (s/n): ");
        String incluirQuad = SCANNER.nextLine().trim().toLowerCase();

        List<SortAlgorithm> selecionados = new ArrayList<>();
        selecionados.add(new QuickSort());
        selecionados.add(new MergeSort());
        selecionados.add(new HeapSort());
        selecionados.add(new JavaNativeSort());

        if (incluirQuad.startsWith("s")) {
            selecionados.add(new InsertionSort());
        }

        Comparator<Ocorrencia> criterio = CriterioOrdenacao.SCORE_RISCO_TRIAGEM.getComparator();
        List<BenchmarkResult> resultados = BenchmarkRunner.runAll(selecionados, dados, criterio);
        BenchmarkRunner.printReport(resultados, "Score de Risco Operacional", qtd);
    }

    private static void exibirDiferencialPratico() {
        System.out.println("\n" + "=".repeat(85));
        System.out.println(" DIFERENCIAL PRÁTICO: POR QUE ORDENAÇÃO RÁPIDA SALVA VIDAS NA POLÍCIA?");
        System.out.println("=".repeat(85));
        System.out.println("""
1. O CENÁRIO REAL DA CENTRAL 190 / COPOM:
   - Em grandes metrópoles, chegam milhares de chamadas de emergência a cada hora.
   - A fila de atendimento NÃO é estática: a cada segundo chegam novos chamados
     (homicídios em andamento, roubos com reféns, perturbações, acidentes).
   - O sistema precisa REORDENAR a fila em tempo real para despachar a viatura mais
     próxima para a ocorrência de maior risco à vida humana.

2. A MATEMÁTICA DO COLAPSO (O(N^2) vs O(N log N)):
   - Para uma fila com 50.000 chamados simultâneos:
     * Algoritmo Quadrático O(N^2) (ex: Insertion/Bubble Sort):
       -> Realiza aprox. 2.500.000.000 (2,5 bilhões) de operações.
       -> Tempo de execução: VÁRIOS MINUTOS de CPU travada a 100%.
       -> Consequência: Um policial do despacho aguarda a tela destravar enquanto
          uma vítima em perigo iminente não recebe a viatura a tempo.
     * Algoritmo Linearítmico O(N log N) (ex: QuickSort / MergeSort):
       -> Realiza aprox. 50.000 * 16 ≈ 800.000 operações.
       -> Tempo de execução: MENOS DE 15 MILISSEGUNDOS!
       -> Consequência: A triagem é instantânea e o socorro chega minutos mais rápido.

3. ESTABILIDADE E CONSUMO DE MEMÓRIA:
   - QuickSort: Extremamente rápido e in-place (baixo uso de RAM).
   - MergeSort: Garante tempo O(N log N) mesmo no pior caso absoluto e preserva a ordem
     cronológica de chamados de mesma gravidade (estabilidade).
   - HeapSort: Garante O(N log N) e não consome memória auxiliar (O(1) aux).
""");
        System.out.println("=".repeat(85) + "\n");
    }

    private static void iniciarDashboardWeb() {
        try {
            System.out.println("\nIniciando servidor web em segundo plano...");
            ApiServer.iniciarServidor(8080);
            System.out.println(">> Abra o navegador em: http://localhost:8080");
            try {
                if (java.awt.Desktop.isDesktopSupported() && java.awt.Desktop.getDesktop().isSupported(java.awt.Desktop.Action.BROWSE)) {
                    java.awt.Desktop.getDesktop().browse(new java.net.URI("http://localhost:8080"));
                }
            } catch (Exception ignored) {}
            System.out.println("Pressione ENTER para voltar ao menu principal...");
            SCANNER.nextLine();
        } catch (Exception e) {
            System.out.println("[!] Erro ao iniciar servidor web: " + e.getMessage());
        }
    }

    private static void iniciarServidorWebAutomatico() {
        if (servidorWebIniciado) return;
        try {
            ApiServer.iniciarServidor(8080);
            servidorWebIniciado = true;
            System.out.println("[OK] Servidor web iniciado em http://localhost:8080");

            // Abre o navegador automaticamente
            try {
                if (java.awt.Desktop.isDesktopSupported() && java.awt.Desktop.getDesktop().isSupported(java.awt.Desktop.Action.BROWSE)) {
                    java.awt.Desktop.getDesktop().browse(new java.net.URI("http://localhost:8080"));
                    System.out.println("[OK] Navegador aberto automaticamente!");
                }
            } catch (Exception e) {
                System.out.println("[!] Não foi possível abrir o navegador automaticamente.");
                System.out.println("    Acesse manualmente: http://localhost:8080");
            }
        } catch (Exception e) {
            System.out.println("[!] Erro ao iniciar servidor web: " + e.getMessage());
        }
    }

    private static void abrirOuReabrirNavegador() {
        if (!servidorWebIniciado) {
            iniciarServidorWebAutomatico();
            return;
        }
        try {
            if (java.awt.Desktop.isDesktopSupported() && java.awt.Desktop.getDesktop().isSupported(java.awt.Desktop.Action.BROWSE)) {
                java.awt.Desktop.getDesktop().browse(new java.net.URI("http://localhost:8080"));
                System.out.println("\n>> Navegador reaberto em http://localhost:8080\n");
            } else {
                System.out.println("\n>> Acesse manualmente: http://localhost:8080\n");
            }
        } catch (Exception e) {
            System.out.println("[!] Erro ao abrir navegador: " + e.getMessage());
            System.out.println("    Acesse manualmente: http://localhost:8080");
        }
    }

    private static int lerInteiro(int padrao) {
        try {
            String linha = SCANNER.nextLine().trim();
            if (linha.isEmpty()) return padrao;
            int v = Integer.parseInt(linha);
            return (v > 0) ? v : padrao;
        } catch (Exception e) {
            return padrao;
        }
    }
}

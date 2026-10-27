package br.com.policia.benchmark;

import br.com.policia.generator.OcorrenciaGenerator;
import br.com.policia.model.Ocorrencia;
import br.com.policia.sorting.SortAlgorithm;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Executor de testes de desempenho para comparação justa de algoritmos de ordenação.
 */
public class BenchmarkRunner {

    private static final int LIMITE_SEGURO_QUADRATICO = 30_000;

    public static boolean isSorted(Ocorrencia[] array, Comparator<Ocorrencia> comparator) {
        for (int i = 0; i < array.length - 1; i++) {
            if (comparator.compare(array[i], array[i + 1]) > 0) {
                return false;
            }
        }
        return true;
    }

    public static void warmup(List<SortAlgorithm> algorithms, Comparator<Ocorrencia> comparator) {
        Ocorrencia[] sample = OcorrenciaGenerator.gerarOcorrencias(1_000);
        for (SortAlgorithm algo : algorithms) {
            Ocorrencia[] clone = OcorrenciaGenerator.clonar(sample);
            algo.sort(clone, comparator);
        }
    }

    public static BenchmarkResult executeSingle(SortAlgorithm algo, Ocorrencia[] originalData, Comparator<Ocorrencia> comparator) {
        Ocorrencia[] copy = OcorrenciaGenerator.clonar(originalData);

        long start = System.nanoTime();
        algo.sort(copy, comparator);
        long elapsed = System.nanoTime() - start;

        boolean valid = isSorted(copy, comparator);
        return new BenchmarkResult(algo.getName(), algo.getComplexity(), originalData.length, elapsed, valid);
    }

    public static List<BenchmarkResult> runAll(List<SortAlgorithm> algorithms, Ocorrencia[] originalData, Comparator<Ocorrencia> comparator) {
        List<BenchmarkResult> results = new ArrayList<>();

        for (SortAlgorithm algo : algorithms) {
            if (algo.isQuadratic() && originalData.length > LIMITE_SEGURO_QUADRATICO) {
                System.out.printf("  [!] Pulando %s para N=%d (algoritmo O(N^2) levaria minutos/horas para concluir)%n",
                        algo.getName(), originalData.length);
                continue;
            }

            BenchmarkResult res = executeSingle(algo, originalData, comparator);
            results.add(res);
        }

        return results;
    }

    public static void printReport(List<BenchmarkResult> results, String criterioNome, int totalOcorrencias) {
        System.out.println("\n" + "=".repeat(95));
        System.out.printf(" RELATÓRIO DE DESEMPENHO - CENTRAL 190 | %d OCORRÊNCIAS%n", totalOcorrencias);
        System.out.printf(" Critério aplicado: %s%n", criterioNome);
        System.out.println("=".repeat(95));
        System.out.printf("| %-32s | %-24s | %-12s | %-13s | %-6s |%n",
                "Algoritmo", "Complexidade Big-O", "Tempo (ms)", "Vazão (itens/s)", "Status");
        System.out.println("-".repeat(95));

        BenchmarkResult baseline = null;
        for (BenchmarkResult r : results) {
            if (baseline == null || r.timeNanos() < baseline.timeNanos()) {
                baseline = r;
            }

            System.out.printf("| %-32s | %-24s | %10.3f ms | %11.0f it/s | %-6s |%n",
                    r.algorithmName(),
                    r.complexity(),
                    r.getTimeMillis(),
                    r.getThroughputItemsPerSec(),
                    r.sortedCorrectly() ? "OK" : "FALHA");
        }
        System.out.println("=".repeat(95));

        if (baseline != null) {
            System.out.printf(">> Algoritmo mais veloz nesta rodada: %s (%.3f ms)%n",
                    baseline.algorithmName(), baseline.getTimeMillis());
        }

        for (BenchmarkResult r : results) {
            if (r.algorithmName().contains("Insertion") && baseline != null && !baseline.equals(r)) {
                double speedup = (double) r.timeNanos() / baseline.timeNanos();
                System.out.printf(">> Diferencial prático: %s foi %.1fx mais rápido que o algoritmo quadrático!%n",
                        baseline.algorithmName(), speedup);
            }
        }
        System.out.println();
    }
}

package br.com.policia.benchmark;

/**
 * Registro com as métricas de desempenho de um algoritmo durante o benchmark.
 */
public record BenchmarkResult(
    String algorithmName,
    String complexity,
    int sampleSize,
    long timeNanos,
    boolean sortedCorrectly
) {
    public double getTimeMillis() {
        return timeNanos / 1_000_000.0;
    }

    public double getThroughputItemsPerSec() {
        if (timeNanos == 0) return 0.0;
        return (sampleSize / (timeNanos / 1_000_000_000.0));
    }
}

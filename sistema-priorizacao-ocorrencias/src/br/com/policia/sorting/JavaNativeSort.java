package br.com.policia.sorting;

import br.com.policia.model.Ocorrencia;
import java.util.Arrays;
import java.util.Comparator;

/**
 * Ordenação nativa da JVM (Arrays.sort - TimSort adaptativo).
 * Serve como baseline otimizado de referência do ecossistema Java.
 */
public class JavaNativeSort implements SortAlgorithm {

    @Override
    public String getName() {
        return "Java Arrays.sort (TimSort Baseline)";
    }

    @Override
    public String getComplexity() {
        return "O(N log N) adaptativo / hibrido";
    }

    @Override
    public void sort(Ocorrencia[] array, Comparator<Ocorrencia> comparator) {
        if (array == null || array.length <= 1) return;
        Arrays.sort(array, comparator);
    }
}

package br.com.policia.sorting;

import br.com.policia.model.Ocorrencia;
import java.util.Comparator;

/**
 * Implementação do InsertionSort.
 * Complexidade: O(N^2) no pior e médio caso | O(N) no melhor caso.
 * Usado didaticamente para demonstrar o colapso de performance com grandes volumes de dados.
 */
public class InsertionSort implements SortAlgorithm {

    @Override
    public String getName() {
        return "InsertionSort (Quadrático)";
    }

    @Override
    public String getComplexity() {
        return "O(N^2) médio/pior, O(1) aux";
    }

    @Override
    public boolean isQuadratic() {
        return true;
    }

    @Override
    public void sort(Ocorrencia[] array, Comparator<Ocorrencia> comparator) {
        if (array == null || array.length <= 1) return;
        int n = array.length;

        for (int i = 1; i < n; i++) {
            Ocorrencia key = array[i];
            int j = i - 1;

            while (j >= 0 && comparator.compare(array[j], key) > 0) {
                array[j + 1] = array[j];
                j--;
            }
            array[j + 1] = key;
        }
    }
}

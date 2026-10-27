package br.com.policia.sorting;

import br.com.policia.model.Ocorrencia;
import java.util.Comparator;

/**
 * Implementação do HeapSort.
 * Complexidade: O(N log N) no melhor, médio e pior caso | In-place (O(1) aux) | Não estável.
 */
public class HeapSort implements SortAlgorithm {

    @Override
    public String getName() {
        return "HeapSort (Binary Heap)";
    }

    @Override
    public String getComplexity() {
        return "O(N log N) garantido, O(1) aux";
    }

    @Override
    public void sort(Ocorrencia[] array, Comparator<Ocorrencia> comparator) {
        if (array == null || array.length <= 1) return;
        int n = array.length;

        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(array, n, i, comparator);
        }

        for (int i = n - 1; i > 0; i--) {
            Ocorrencia temp = array[0];
            array[0] = array[i];
            array[i] = temp;

            heapify(array, i, 0, comparator);
        }
    }

    private void heapify(Ocorrencia[] arr, int n, int i, Comparator<Ocorrencia> comp) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < n && comp.compare(arr[left], arr[largest]) > 0) {
            largest = left;
        }

        if (right < n && comp.compare(arr[right], arr[largest]) > 0) {
            largest = right;
        }

        if (largest != i) {
            Ocorrencia swap = arr[i];
            arr[i] = arr[largest];
            arr[largest] = swap;

            heapify(arr, n, largest, comp);
        }
    }
}

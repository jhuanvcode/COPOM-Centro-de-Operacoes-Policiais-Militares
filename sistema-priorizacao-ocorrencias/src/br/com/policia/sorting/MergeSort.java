package br.com.policia.sorting;

import br.com.policia.model.Ocorrencia;
import java.util.Comparator;

/**
 * Implementação do MergeSort.
 * Complexidade: O(N log N) garantido em todos os casos | Estável | O(N) espaço auxiliar.
 */
public class MergeSort implements SortAlgorithm {

    @Override
    public String getName() {
        return "MergeSort (Divisão e Conquista)";
    }

    @Override
    public String getComplexity() {
        return "O(N log N) garantido, O(N) aux";
    }

    @Override
    public void sort(Ocorrencia[] array, Comparator<Ocorrencia> comparator) {
        if (array == null || array.length <= 1) return;
        Ocorrencia[] aux = new Ocorrencia[array.length];
        mergeSort(array, aux, 0, array.length - 1, comparator);
    }

    private void mergeSort(Ocorrencia[] arr, Ocorrencia[] aux, int left, int right, Comparator<Ocorrencia> comp) {
        if (left >= right) return;

        int mid = left + (right - left) / 2;
        mergeSort(arr, aux, left, mid, comp);
        mergeSort(arr, aux, mid + 1, right, comp);
        merge(arr, aux, left, mid, right, comp);
    }

    private void merge(Ocorrencia[] arr, Ocorrencia[] aux, int left, int mid, int right, Comparator<Ocorrencia> comp) {
        System.arraycopy(arr, left, aux, left, right - left + 1);

        int i = left;
        int j = mid + 1;
        int k = left;

        while (i <= mid && j <= right) {
            if (comp.compare(aux[i], aux[j]) <= 0) {
                arr[k++] = aux[i++];
            } else {
                arr[k++] = aux[j++];
            }
        }

        while (i <= mid) {
            arr[k++] = aux[i++];
        }

        while (j <= right) {
            arr[k++] = aux[j++];
        }
    }
}

package br.com.policia.sorting;

import br.com.policia.model.Ocorrencia;
import java.util.Comparator;

/**
 * Implementação do QuickSort com escolha de pivô por mediana de três.
 * Complexidade média: O(N log N) | Pior caso: O(N^2) mitigado | In-place.
 */
public class QuickSort implements SortAlgorithm {

    @Override
    public String getName() {
        return "QuickSort (Mediana de 3)";
    }

    @Override
    public String getComplexity() {
        return "O(N log N) médio, O(1) aux";
    }

    @Override
    public void sort(Ocorrencia[] array, Comparator<Ocorrencia> comparator) {
        if (array == null || array.length <= 1) return;
        quickSort(array, 0, array.length - 1, comparator);
    }

    private void quickSort(Ocorrencia[] arr, int low, int high, Comparator<Ocorrencia> comp) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high, comp);
            quickSort(arr, low, pivotIndex, comp);
            quickSort(arr, pivotIndex + 1, high, comp);
        }
    }

    private int partition(Ocorrencia[] arr, int low, int high, Comparator<Ocorrencia> comp) {
        int mid = low + (high - low) / 2;
        if (comp.compare(arr[mid], arr[low]) < 0) swap(arr, low, mid);
        if (comp.compare(arr[high], arr[low]) < 0) swap(arr, low, high);
        if (comp.compare(arr[high], arr[mid]) < 0) swap(arr, mid, high);

        Ocorrencia pivot = arr[mid];

        int i = low - 1;
        int j = high + 1;

        while (true) {
            do {
                i++;
            } while (comp.compare(arr[i], pivot) < 0);

            do {
                j--;
            } while (comp.compare(arr[j], pivot) > 0);

            if (i >= j) {
                return j;
            }

            swap(arr, i, j);
        }
    }

    private void swap(Ocorrencia[] arr, int i, int j) {
        Ocorrencia temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

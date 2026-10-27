package br.com.policia.sorting;

import br.com.policia.model.Ocorrencia;
import java.util.Comparator;

/**
 * Interface comum para algoritmos de ordenação de ocorrências policiais.
 */
public interface SortAlgorithm {

    /**
     * Nome legível do algoritmo.
     */
    String getName();

    /**
     * Complexidade temporal média e no pior caso em notação Big-O.
     */
    String getComplexity();

    /**
     * Ordena o array in-place ou via buffer conforme o algoritmo.
     *
     * @param array      Array de ocorrências a ser ordenado
     * @param comparator Critério de comparação entre duas ocorrências
     */
    void sort(Ocorrencia[] array, Comparator<Ocorrencia> comparator);

    /**
     * Informa se este algoritmo é lento para grandes volumes (ex: O(N^2)).
     */
    default boolean isQuadratic() {
        return false;
    }
}

import { ISortAlgorithm } from './SortAlgorithm.js';
import { ComparatorFn } from '../types/index.js';

export class InsertionSort<T> implements ISortAlgorithm<T> {
  readonly name = 'InsertionSort (Quadrático)';
  readonly complexity = 'O(N^2) médio/pior, O(1) aux';
  readonly isQuadratic = true;

  sort(array: T[], comparator: ComparatorFn<T>): T[] {
    const copy = [...array];
    for (let i = 1; i < copy.length; i++) {
      const key = copy[i];
      let j = i - 1;
      while (j >= 0 && comparator(copy[j], key) > 0) {
        copy[j + 1] = copy[j];
        j--;
      }
      copy[j + 1] = key;
    }
    return copy;
  }
}

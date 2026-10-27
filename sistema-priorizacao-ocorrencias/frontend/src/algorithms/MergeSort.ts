import { ISortAlgorithm } from './SortAlgorithm.js';
import { ComparatorFn } from '../types/index.js';

export class MergeSort<T> implements ISortAlgorithm<T> {
  readonly name = 'MergeSort (Divisão e Conquista)';
  readonly complexity = 'O(N log N) garantido, O(N) aux';
  readonly isQuadratic = false;

  sort(array: T[], comparator: ComparatorFn<T>): T[] {
    if (array.length <= 1) return [...array];
    const mid = Math.floor(array.length / 2);
    const left = this.sort(array.slice(0, mid), comparator);
    const right = this.sort(array.slice(mid), comparator);
    return this.merge(left, right, comparator);
  }

  private merge(left: T[], right: T[], comp: ComparatorFn<T>): T[] {
    const result: T[] = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (comp(left[i], right[j]) <= 0) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
  }
}

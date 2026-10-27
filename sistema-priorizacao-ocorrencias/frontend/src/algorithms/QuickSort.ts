import { ISortAlgorithm } from './SortAlgorithm.js';
import { ComparatorFn } from '../types/index.js';

export class QuickSort<T> implements ISortAlgorithm<T> {
  readonly name = 'QuickSort (Mediana de 3)';
  readonly complexity = 'O(N log N) médio, O(1) aux';
  readonly isQuadratic = false;

  sort(array: T[], comparator: ComparatorFn<T>): T[] {
    const copy = [...array];
    this.quickSortHelper(copy, 0, copy.length - 1, comparator);
    return copy;
  }

  private quickSortHelper(arr: T[], low: number, high: number, comp: ComparatorFn<T>): void {
    if (low < high) {
      const p = this.partition(arr, low, high, comp);
      this.quickSortHelper(arr, low, p, comp);
      this.quickSortHelper(arr, p + 1, high, comp);
    }
  }

  private partition(arr: T[], low: number, high: number, comp: ComparatorFn<T>): number {
    const mid = Math.floor(low + (high - low) / 2);
    if (comp(arr[mid], arr[low]) < 0) this.swap(arr, low, mid);
    if (comp(arr[high], arr[low]) < 0) this.swap(arr, low, high);
    if (comp(arr[high], arr[mid]) < 0) this.swap(arr, mid, high);

    const pivot = arr[mid];
    let i = low - 1;
    let j = high + 1;

    while (true) {
      do { i++; } while (comp(arr[i], pivot) < 0);
      do { j--; } while (comp(arr[j], pivot) > 0);
      if (i >= j) return j;
      this.swap(arr, i, j);
    }
  }

  private swap(arr: T[], i: number, j: number): void {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

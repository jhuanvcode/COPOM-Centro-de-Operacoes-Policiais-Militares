export class QuickSort {
  name = 'QuickSort (Mediana de 3)';
  complexity = 'O(N log N) médio, O(1) aux';
  isQuadratic = false;

  sort(array, comparator) {
    const copy = [...array];
    this.quickSortHelper(copy, 0, copy.length - 1, comparator);
    return copy;
  }

  quickSortHelper(arr, low, high, comp) {
    if (low < high) {
      const p = this.partition(arr, low, high, comp);
      this.quickSortHelper(arr, low, p, comp);
      this.quickSortHelper(arr, p + 1, high, comp);
    }
  }

  partition(arr, low, high, comp) {
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

  swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

export class HeapSort {
  name = 'HeapSort (Binary Heap)';
  complexity = 'O(N log N) garantido, O(1) aux';
  isQuadratic = false;

  sort(array, comparator) {
    const copy = [...array];
    const n = copy.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapify(copy, n, i, comparator);
    }

    for (let i = n - 1; i > 0; i--) {
      this.swap(copy, 0, i);
      this.heapify(copy, i, 0, comparator);
    }

    return copy;
  }

  heapify(arr, n, i, comp) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && comp(arr[left], arr[largest]) > 0) largest = left;
    if (right < n && comp(arr[right], arr[largest]) > 0) largest = right;

    if (largest !== i) {
      this.swap(arr, i, largest);
      this.heapify(arr, n, largest, comp);
    }
  }

  swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

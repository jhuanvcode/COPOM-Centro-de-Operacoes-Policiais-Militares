export class InsertionSort {
  name = 'InsertionSort (Quadrático)';
  complexity = 'O(N^2) médio/pior, O(1) aux';
  isQuadratic = true;

  sort(array, comparator) {
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

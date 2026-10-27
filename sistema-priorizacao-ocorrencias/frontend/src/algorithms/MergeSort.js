export class MergeSort {
  name = 'MergeSort (Divisão e Conquista)';
  complexity = 'O(N log N) garantido, O(N) aux';
  isQuadratic = false;

  sort(array, comparator) {
    if (array.length <= 1) return [...array];
    const mid = Math.floor(array.length / 2);
    const left = this.sort(array.slice(0, mid), comparator);
    const right = this.sort(array.slice(mid), comparator);
    return this.merge(left, right, comparator);
  }

  merge(left, right, comp) {
    const result = [];
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

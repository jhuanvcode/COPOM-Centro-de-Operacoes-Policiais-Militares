/**
 * Módulo de Algoritmos de Ordenação em JavaScript/TypeScript.
 */
export class TypeScriptSorters {
  static quickSort(arr, comp) {
    const copia = [...arr];
    this.quickSortInternal(copia, 0, copia.length - 1, comp);
    return copia;
  }

  static quickSortInternal(arr, low, high, comp) {
    if (low < high) {
      const p = this.partition(arr, low, high, comp);
      this.quickSortInternal(arr, low, p, comp);
      this.quickSortInternal(arr, p + 1, high, comp);
    }
  }

  static partition(arr, low, high, comp) {
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

  static mergeSort(arr, comp) {
    if (arr.length <= 1) return [...arr];
    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid), comp);
    const right = this.mergeSort(arr.slice(mid), comp);
    return this.merge(left, right, comp);
  }

  static merge(left, right, comp) {
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

  static heapSort(arr, comp) {
    const copia = [...arr];
    const n = copia.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapify(copia, n, i, comp);
    }

    for (let i = n - 1; i > 0; i--) {
      this.swap(copia, 0, i);
      this.heapify(copia, i, 0, comp);
    }

    return copia;
  }

  static heapify(arr, n, i, comp) {
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

  static insertionSort(arr, comp) {
    const copia = [...arr];
    for (let i = 1; i < copia.length; i++) {
      const key = copia[i];
      let j = i - 1;
      while (j >= 0 && comp(copia[j], key) > 0) {
        copia[j + 1] = copia[j];
        j--;
      }
      copia[j + 1] = key;
    }
    return copia;
  }

  static swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  static obterComparador(criterio, volumePorRegiao) {
    switch (criterio) {
      case 'GRAVIDADE_DECRESCENTE':
        return (a, b) => b.gravidade - a.gravidade || a.dataHora.localeCompare(b.dataHora);

      case 'TEMPO_ATENDIMENTO_CRESCENTE':
        return (a, b) => a.tempoAtendimento - b.tempoAtendimento || b.gravidade - a.gravidade;

      case 'DISTANCIA_CRESCENTE':
        return (a, b) => a.distanciaKm - b.distanciaKm || b.gravidade - a.gravidade;

      case 'DATA_CRONOLOGICA':
        return (a, b) => a.dataHora.localeCompare(b.dataHora);

      case 'SCORE_RISCO_TRIAGEM':
        return (a, b) => b.scoreRisco - a.scoreRisco;

      case 'REGIAO_VOLUME':
        return (a, b) => {
          const vA = volumePorRegiao ? (volumePorRegiao.get(a.regiao) || 0) : 0;
          const vB = volumePorRegiao ? (volumePorRegiao.get(b.regiao) || 0) : 0;
          return vB - vA || b.gravidade - a.gravidade;
        };

      default:
        return (a, b) => b.gravidade - a.gravidade;
    }
  }
}

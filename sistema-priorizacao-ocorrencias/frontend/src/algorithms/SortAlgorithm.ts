import { ComparatorFn } from '../types/index.js';

/**
 * Interface genérica para algoritmos de ordenação em TypeScript.
 */
export interface ISortAlgorithm<T> {
  readonly name: string;
  readonly complexity: string;
  readonly isQuadratic: boolean;
  sort(array: T[], comparator: ComparatorFn<T>): T[];
}

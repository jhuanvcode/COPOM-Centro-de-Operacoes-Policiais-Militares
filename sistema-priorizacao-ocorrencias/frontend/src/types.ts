/**
 * Definições de Tipos e Interfaces do Sistema Policial de Triagem
 */

export type TipoOcorrencia =
  | 'HOMICIDIO'
  | 'SEQUESTRO'
  | 'ROUBO_A_MAO_ARMADA'
  | 'VIOLENCIA_DOMESTICA'
  | 'TRAFICO_DE_DROGAS'
  | 'ACIDENTE_GRAVE'
  | 'ROUBO'
  | 'FURTO_VEICULO'
  | 'AGRESSAO'
  | 'FURTO'
  | 'PERTURBACAO_SOSSEGO'
  | 'OUTROS';

export type Regiao =
  | 'CENTRO'
  | 'ZONA_NORTE'
  | 'ZONA_SUL'
  | 'ZONA_LESTE'
  | 'ZONA_OESTE'
  | 'METROPOLITANA';

export type CriterioOrdenacao =
  | 'GRAVIDADE_DECRESCENTE'
  | 'TEMPO_ATENDIMENTO_CRESCENTE'
  | 'DISTANCIA_CRESCENTE'
  | 'DATA_CRONOLOGICA'
  | 'SCORE_RISCO_TRIAGEM'
  | 'REGIAO_VOLUME';

export interface Ocorrencia {
  id: string;
  tipo: TipoOcorrencia;
  descricao: string;
  gravidade: number; // 1 a 10
  dataHora: string;
  tempoAtendimento: number; // minutos
  distanciaKm: number;
  regiao: Regiao;
  regiaoNome: string;
  scoreRisco: number;
}

export interface BenchmarkResult {
  nome: string;
  complexidade: string;
  tempoMs: number;
  tempoNanos: number;
  vazao: number; // itens por segundo
  valido: boolean;
}

export interface BenchmarkResponse {
  total: number;
  criterio: string;
  resultados: BenchmarkResult[];
}

export interface SortResponse {
  tempoMs: number;
  tempoNanos: number;
  algoritmo: string;
  criterio: string;
  total: number;
  ocorrencias: Ocorrencia[];
}

export type ComparatorFn<T> = (a: T, b: T) => number;

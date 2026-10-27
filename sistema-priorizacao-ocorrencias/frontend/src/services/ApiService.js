import { QuickSort } from '../algorithms/QuickSort.js';
import { MergeSort } from '../algorithms/MergeSort.js';
import { HeapSort } from '../algorithms/HeapSort.js';
import { InsertionSort } from '../algorithms/InsertionSort.js';

const API_BASE = window.location.origin.includes('8080') ? '' : 'http://localhost:8080';

export class ApiService {
  static quickSort = new QuickSort();
  static mergeSort = new MergeSort();
  static heapSort = new HeapSort();
  static insertionSort = new InsertionSort();

  static async getOcorrencias() {
    try {
      const resp = await fetch(`${API_BASE}/api/ocorrencias`);
      if (!resp.ok) throw new Error('Falha ao obter ocorrências');
      return await resp.json();
    } catch {
      console.warn('API backend offline. Gerando dados locais em TypeScript.');
      return this.gerarOcorrenciasLocais(1000);
    }
  }

  static async gerarNovaBase(quantidade) {
    try {
      const resp = await fetch(`${API_BASE}/api/gerar?qtd=${quantidade}`, { method: 'POST' });
      return resp.ok;
    } catch {
      return false;
    }
  }

  static async ordenar(criterio, algoritmo, fallbackData) {
    try {
      const resp = await fetch(`${API_BASE}/api/ordenar?criterio=${criterio}&algoritmo=${algoritmo}`, { method: 'POST' });
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      console.warn('Backend indisponível, executando ordenação local em TypeScript');
    }

    const dados = fallbackData || this.gerarOcorrenciasLocais(1000);
    const comp = this.obterComparador(criterio);

    const t0 = performance.now();
    let ordenadas;
    if (algoritmo.includes('Merge')) {
      ordenadas = this.mergeSort.sort(dados, comp);
    } else if (algoritmo.includes('Heap')) {
      ordenadas = this.heapSort.sort(dados, comp);
    } else if (algoritmo.includes('Insertion')) {
      ordenadas = this.insertionSort.sort(dados, comp);
    } else {
      ordenadas = this.quickSort.sort(dados, comp);
    }
    const t1 = performance.now();
    const tempoMs = t1 - t0;

    return {
      tempoMs,
      tempoNanos: Math.round(tempoMs * 1_000_000),
      algoritmo: `${algoritmo} (TypeScript Engine)`,
      criterio,
      total: ordenadas.length,
      ocorrencias: ordenadas
    };
  }

  static async rodarBenchmark(quantidade, criterio) {
    try {
      const resp = await fetch(`${API_BASE}/api/benchmark?qtd=${quantidade}&criterio=${criterio}`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      console.warn('Backend indisponível, executando benchmark comparativo em TypeScript');
    }

    const dados = this.gerarOcorrenciasLocais(Math.min(quantidade, 20_000));
    const comp = this.obterComparador(criterio);

    const algos = [
      { nome: this.quickSort.name, fn: (arr) => this.quickSort.sort(arr, comp), c: this.quickSort.complexity },
      { nome: this.mergeSort.name, fn: (arr) => this.mergeSort.sort(arr, comp), c: this.mergeSort.complexity },
      { nome: this.heapSort.name, fn: (arr) => this.heapSort.sort(arr, comp), c: this.heapSort.complexity },
      { nome: 'Array.prototype.sort (V8 TimSort)', fn: (arr) => [...arr].sort(comp), c: 'O(N log N)' }
    ];

    if (quantidade <= 20_000) {
      algos.push({
        nome: this.insertionSort.name,
        fn: (arr) => this.insertionSort.sort(arr, comp),
        c: this.insertionSort.complexity
      });
    }

    const resultados = algos.map(a => {
      const t0 = performance.now();
      a.fn(dados);
      const ms = performance.now() - t0;
      return {
        nome: a.nome,
        complexidade: a.c,
        tempoMs: ms,
        tempoNanos: Math.round(ms * 1_000_000),
        vazao: Math.round(dados.length / (ms / 1000)),
        valido: true
      };
    });

    return {
      total: dados.length,
      criterio,
      resultados
    };
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
          const vA = volumePorRegiao?.get(a.regiao) || 0;
          const vB = volumePorRegiao?.get(b.regiao) || 0;
          return vB - vA || b.gravidade - a.gravidade;
        };

      default:
        return (a, b) => b.gravidade - a.gravidade;
    }
  }

  static gerarOcorrenciasLocais(qtd) {
    const tipos = [
      { tipo: 'HOMICIDIO', desc: 'Homicídio / Tentativa de Homicídio', grav: 10 },
      { tipo: 'SEQUESTRO', desc: 'Sequestro e Cárcere Privado', grav: 9 },
      { tipo: 'ROUBO_A_MAO_ARMADA', desc: 'Roubo com Emprego de Arma de Fogo', grav: 9 },
      { tipo: 'VIOLENCIA_DOMESTICA', desc: 'Violência Doméstica (Lei Maria da Penha)', grav: 8 },
      { tipo: 'TRAFICO_DE_DROGAS', desc: 'Tráfico de Entorpecentes em Flagrante', grav: 7 },
      { tipo: 'ACIDENTE_GRAVE', desc: 'Acidente de Trânsito com Vítimas Graves', grav: 7 },
      { tipo: 'ROUBO', desc: 'Roubo / Assalto', grav: 6 },
      { tipo: 'FURTO_VEICULO', desc: 'Furto de Veículo', grav: 5 },
      { tipo: 'AGRESSAO', desc: 'Lesão Corporal / Vias de Fato', grav: 5 },
      { tipo: 'FURTO', desc: 'Furto Simples', grav: 3 },
      { tipo: 'PERTURBACAO_SOSSEGO', desc: 'Perturbação do Sossego / Desinteligência', grav: 2 }
    ];

    const regioes = [
      { id: 'CENTRO', nome: 'Região Central / Batalhão 1' },
      { id: 'ZONA_NORTE', nome: 'Zona Norte / Batalhão 2' },
      { id: 'ZONA_SUL', nome: 'Zona Sul / Batalhão 3' },
      { id: 'ZONA_LESTE', nome: 'Zona Leste / Batalhão 4' },
      { id: 'ZONA_OESTE', nome: 'Zona Oeste / Batalhão 5' },
      { id: 'METROPOLITANA', nome: 'Região Metropolitana / Batalhão 6' }
    ];

    const lista = [];
    const agora = Date.now();

    for (let i = 0; i < qtd; i++) {
      const t = tipos[Math.floor(Math.random() * tipos.length)];
      const r = regioes[Math.floor(Math.random() * regioes.length)];
      const id = `OC-${String(i + 1).padStart(6, '0')}`;
      const gravidade = Math.min(10, Math.max(1, t.grav + Math.floor(Math.random() * 3) - 1));
      const tempoAtendimento = 5 + Math.floor(Math.random() * 85);
      const distanciaKm = Math.round((0.5 + Math.random() * 29.5) * 10) / 10;
      const dataHoraDate = new Date(agora - Math.floor(Math.random() * 72 * 3600 * 1000));
      const dataHora = dataHoraDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      const scoreRisco = Math.round(((gravidade * 15) + Math.max(0.1, 50 - distanciaKm) + (tempoAtendimento * 0.5)) * 10) / 10;

      lista.push({
        id,
        tipo: t.tipo,
        descricao: t.desc,
        gravidade,
        dataHora,
        tempoAtendimento,
        distanciaKm,
        regiao: r.id,
        regiaoNome: r.nome,
        scoreRisco
      });
    }

    return lista;
  }
}

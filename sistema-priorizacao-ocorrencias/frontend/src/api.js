import { TypeScriptSorters } from './sorting.js';

const API_BASE = window.location.origin.includes('8080') ? '' : 'http://localhost:8080';

export class ApiService {
  static async getOcorrencias() {
    try {
      const resp = await fetch(`${API_BASE}/api/ocorrencias`);
      if (!resp.ok) throw new Error('Falha ao buscar ocorrências');
      return await resp.json();
    } catch (err) {
      console.warn('API backend offline. Gerando ocorrências locais para fallback.', err);
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
    } catch (err) {
      console.warn('Backend indisponível, usando ordenação TypeScript local', err);
    }

    const dados = fallbackData || this.gerarOcorrenciasLocais(1000);
    const comp = TypeScriptSorters.obterComparador(criterio);

    const t0 = performance.now();
    let ordenadas;
    if (algoritmo.includes('Merge')) {
      ordenadas = TypeScriptSorters.mergeSort(dados, comp);
    } else if (algoritmo.includes('Heap')) {
      ordenadas = TypeScriptSorters.heapSort(dados, comp);
    } else if (algoritmo.includes('Insertion')) {
      ordenadas = TypeScriptSorters.insertionSort(dados, comp);
    } else {
      ordenadas = TypeScriptSorters.quickSort(dados, comp);
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
    } catch (err) {
      console.warn('Erro ao conectar ao backend de benchmark, rodando benchmark local em TypeScript', err);
    }

    const dados = this.gerarOcorrenciasLocais(Math.min(quantidade, 20_000));
    const comp = TypeScriptSorters.obterComparador(criterio);

    const algos = [
      { nome: 'QuickSort (Mediana de 3 - TS)', fn: TypeScriptSorters.quickSort.bind(TypeScriptSorters), c: 'O(N log N)' },
      { nome: 'MergeSort (TS)', fn: TypeScriptSorters.mergeSort.bind(TypeScriptSorters), c: 'O(N log N)' },
      { nome: 'HeapSort (TS)', fn: TypeScriptSorters.heapSort.bind(TypeScriptSorters), c: 'O(N log N)' },
      { nome: 'Array.prototype.sort (V8 TimSort)', fn: (arr, c) => [...arr].sort(c), c: 'O(N log N)' }
    ];

    if (quantidade <= 20_000) {
      algos.push({ nome: 'InsertionSort (TS)', fn: TypeScriptSorters.insertionSort.bind(TypeScriptSorters), c: 'O(N^2)' });
    }

    const resultados = algos.map(a => {
      const t0 = performance.now();
      a.fn(dados, comp);
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

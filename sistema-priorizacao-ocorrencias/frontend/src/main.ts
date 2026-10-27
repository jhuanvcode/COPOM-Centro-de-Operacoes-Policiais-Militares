import { Ocorrencia, CriterioOrdenacao, BenchmarkResult } from './types/index.js';
import { ApiService } from './services/ApiService.js';
import { AudioService } from './services/AudioService.js';
import { ChartVisualizer } from './components/ChartVisualizer.js';
import { DispatchLog } from './components/DispatchLog.js';

export class AppController {
  private ocorrencias: Ocorrencia[] = [];
  private ocorrenciasFiltradas: Ocorrencia[] = [];
  private criterioAtual: CriterioOrdenacao = 'GRAVIDADE_DECRESCENTE';
  private algoritmoAtual: string = 'QuickSort';
  private visualizer: ChartVisualizer | null = null;
  private dispatchLog: DispatchLog | null = null;

  // Filtros
  private filtroTexto: string = '';
  private filtroGravidadeMin: number = 0;
  private filtroRegiao: string = 'TODAS';

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.visualizer = new ChartVisualizer('canvas-grafico');
    } catch (e) {
      console.warn('Canvas não inicializado imediatamente', e);
    }

    this.dispatchLog = new DispatchLog('lista-despachos');
    this.dispatchLog.render();

    this.initEventListeners();
    await this.carregarDadosIniciais();
  }

  private async carregarDadosIniciais(): Promise<void> {
    this.mostrarStatusCarregamento(true);
    this.ocorrencias = await ApiService.getOcorrencias();
    this.mostrarStatusCarregamento(false);
    this.aplicarFiltros();
  }

  private initEventListeners(): void {
    // Botões de critérios
    const btnCriterios = document.querySelectorAll<HTMLButtonElement>('.btn-criterio');
    btnCriterios.forEach(btn => {
      btn.addEventListener('click', async () => {
        btnCriterios.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.criterioAtual = (btn.dataset.criterio as CriterioOrdenacao) || 'GRAVIDADE_DECRESCENTE';
        await this.executarOrdenacao();
      });
    });

    // Seletor de algoritmo
    const selectAlgo = document.getElementById('select-algoritmo') as HTMLSelectElement | null;
    if (selectAlgo) {
      selectAlgo.addEventListener('change', async () => {
        this.algoritmoAtual = selectAlgo.value;
        await this.executarOrdenacao();
      });
    }

    // Botão Gerar Carga
    const btnGerar = document.getElementById('btn-gerar') as HTMLButtonElement | null;
    const inputQtd = document.getElementById('input-qtd') as HTMLInputElement | null;
    if (btnGerar && inputQtd) {
      btnGerar.addEventListener('click', async () => {
        const qtd = parseInt(inputQtd.value, 10) || 1000;
        this.mostrarStatusCarregamento(true);
        await ApiService.gerarNovaBase(qtd);
        this.ocorrencias = await ApiService.getOcorrencias();
        await this.executarOrdenacao();
        this.mostrarStatusCarregamento(false);
      });
    }

    // Botão Benchmark
    const btnBench = document.getElementById('btn-benchmark') as HTMLButtonElement | null;
    if (btnBench) {
      btnBench.addEventListener('click', async () => {
        await this.executarBenchmark();
      });
    }

    // Filtro de Texto
    const inputBusca = document.getElementById('input-busca') as HTMLInputElement | null;
    if (inputBusca) {
      inputBusca.addEventListener('input', () => {
        this.filtroTexto = inputBusca.value.trim().toLowerCase();
        this.aplicarFiltros();
      });
    }

    // Filtro por Gravidade
    const selectFiltroGrav = document.getElementById('filtro-gravidade') as HTMLSelectElement | null;
    if (selectFiltroGrav) {
      selectFiltroGrav.addEventListener('change', () => {
        this.filtroGravidadeMin = parseInt(selectFiltroGrav.value, 10) || 0;
        this.aplicarFiltros();
      });
    }

    // Toggle de Áudio
    const toggleAudio = document.getElementById('toggle-audio') as HTMLInputElement | null;
    if (toggleAudio) {
      toggleAudio.addEventListener('change', () => {
        AudioService.audioAtivo = toggleAudio.checked;
      });
    }
  }

  private async executarOrdenacao(): Promise<void> {
    const badgeTempo = document.getElementById('badge-tempo-execucao');
    if (badgeTempo) badgeTempo.textContent = 'Calculando...';

    const resp = await ApiService.ordenar(this.criterioAtual, this.algoritmoAtual, this.ocorrencias);
    this.ocorrencias = resp.ocorrencias;

    if (badgeTempo) {
      badgeTempo.textContent = `${resp.tempoMs.toFixed(3)} ms (${resp.algoritmo})`;
    }

    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.ocorrenciasFiltradas = this.ocorrencias.filter(o => {
      const matchTexto = !this.filtroTexto ||
        o.id.toLowerCase().includes(this.filtroTexto) ||
        o.descricao.toLowerCase().includes(this.filtroTexto) ||
        o.tipo.toLowerCase().includes(this.filtroTexto);

      const matchGrav = o.gravidade >= this.filtroGravidadeMin;
      return matchTexto && matchGrav;
    });

    this.atualizarEstatisticas();
    this.renderizarTabela();
  }

  private async executarBenchmark(): Promise<void> {
    const inputQtd = document.getElementById('input-qtd') as HTMLInputElement | null;
    const qtd = parseInt(inputQtd?.value || '10000', 10);

    const btnBench = document.getElementById('btn-benchmark') as HTMLButtonElement | null;
    if (btnBench) {
      btnBench.disabled = true;
      btnBench.textContent = '⏳ Executando Bateria...';
    }

    const resp = await ApiService.rodarBenchmark(qtd, this.criterioAtual);

    this.renderizarTabelaBenchmark(resp.resultados);
    if (this.visualizer) {
      this.visualizer.render(resp.resultados);
    }

    if (btnBench) {
      btnBench.disabled = false;
      btnBench.textContent = '⚡ Rodar Benchmark Científico';
    }
  }

  private atualizarEstatisticas(): void {
    const total = this.ocorrencias.length;
    const criticas = this.ocorrencias.filter(o => o.gravidade >= 8).length;
    const tempoMedio = total > 0 ? (this.ocorrencias.reduce((acc, o) => acc + o.tempoAtendimento, 0) / total).toFixed(0) : '0';
    const distMin = total > 0 ? Math.min(...this.ocorrencias.map(o => o.distanciaKm)).toFixed(1) : '0';

    this.setText('stat-total', total.toLocaleString('pt-BR'));
    this.setText('stat-criticas', criticas.toLocaleString('pt-BR'));
    this.setText('stat-tempo-medio', `${tempoMedio} min`);
    this.setText('stat-distancia-min', `${distMin} km`);
  }

  private renderizarTabela(): void {
    const tbody = document.getElementById('tabela-ocorrencias-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const limite = Math.min(25, this.ocorrenciasFiltradas.length);

    for (let i = 0; i < limite; i++) {
      const o = this.ocorrenciasFiltradas[i];
      const tr = document.createElement('tr');

      const badgeClass = o.gravidade >= 8 ? 'badge-critico' : o.gravidade >= 5 ? 'badge-medio' : 'badge-baixo';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: #64748b; font-size: 11px;">#${i + 1}</td>
        <td style="font-family: var(--font-mono); color: #38bdf8; font-weight: 700; font-size: 11px;">${o.id}</td>
        <td>
          <div style="font-weight: 600; color: #f8fafc; font-size: 13px;">${o.descricao}</div>
          <div style="font-size: 11px; color: #94a3b8; font-family: var(--font-mono);">${o.tipo}</div>
        </td>
        <td>
          <span class="badge-machined ${badgeClass}">
            <span class="badge-dot"></span>
            ${o.gravidade}/10
          </span>
        </td>
        <td style="color: #cbd5e1; font-size: 11px; font-family: var(--font-mono);">${o.dataHora}</td>
        <td style="color: #fde047; font-family: var(--font-mono); font-size: 11px;">${o.tempoAtendimento} min</td>
        <td style="color: #93c5fd; font-family: var(--font-mono); font-size: 11px;">${o.distanciaKm} km</td>
        <td style="color: #cbd5e1; font-size: 11px;">${o.regiaoNome}</td>
        <td style="color: #34d399; font-family: var(--font-mono); font-weight: 700; font-size: 12px;">${o.scoreRisco}</td>
        <td>
          <button class="btn-metal btn-metal-dispatch btn-despachar" data-id="${o.id}">
            <span>Despachar</span>
            <span>🚔</span>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    }

    tbody.querySelectorAll<HTMLButtonElement>('.btn-despachar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLButtonElement).dataset.id;
        this.despacharViatura(id || '');
      });
    });

    const infoFila = document.getElementById('info-fila');
    if (infoFila) {
      infoFila.textContent = `Exibindo TOP ${limite} de ${this.ocorrenciasFiltradas.length.toLocaleString('pt-BR')} filtrados (Total: ${this.ocorrencias.length.toLocaleString('pt-BR')})`;
    }
  }

  private despacharViatura(id: string): void {
    const index = this.ocorrencias.findIndex(o => o.id === id);
    if (index !== -1) {
      const removida = this.ocorrencias.splice(index, 1)[0];

      // Áudio e Notificação
      if (removida.gravidade >= 8) {
        AudioService.tocarAlertaCritico();
      } else {
        AudioService.tocarBipDespacho();
      }

      this.dispatchLog?.registrar({
        idOcorrencia: removida.id,
        descricao: removida.descricao,
        gravidade: removida.gravidade,
        regiao: removida.regiaoNome,
        horarioDespacho: new Date().toLocaleTimeString('pt-BR')
      });

      this.mostrarNotificacao(`Viatura despachada para ${removida.id} - ${removida.descricao}!`);
      this.aplicarFiltros();
    }
  }

  private renderizarTabelaBenchmark(resultados: BenchmarkResult[]): void {
    const tbody = document.getElementById('tabela-benchmark-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const maisRapido = [...resultados].sort((a, b) => a.tempoMs - b.tempoMs)[0];

    resultados.forEach(r => {
      const tr = document.createElement('tr');
      const isWinner = r.nome === maisRapido?.nome;
      const speedup = (r.tempoMs / maisRapido.tempoMs).toFixed(1);

      tr.innerHTML = `
        <td style="font-weight: 700; color: ${isWinner ? '#34d399' : '#f1f5f9'};">
          ${r.nome} ${isWinner ? '👑' : ''}
        </td>
        <td style="font-family: var(--font-mono); font-size: 11px; color: #94a3b8;">${r.complexidade}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: #38bdf8;">${r.tempoMs.toFixed(3)} ms</td>
        <td style="font-family: var(--font-mono); font-size: 11px; color: #cbd5e1;">${r.vazao.toLocaleString('pt-BR')} it/s</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: ${isWinner ? '#34d399' : '#f59e0b'};">${speedup}x</td>
        <td>
          <span class="badge-machined ${r.valido ? 'badge-ok' : 'badge-critico'}">
            <span class="badge-dot"></span>
            ${r.valido ? 'OK' : 'Erro'}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  private mostrarStatusCarregamento(ativo: boolean): void {
    const spinner = document.getElementById('loader-status');
    if (spinner) spinner.style.display = ativo ? 'inline-block' : 'none';
  }

  private mostrarNotificacao(msg: string): void {
    const toast = document.getElementById('toast-notificacao');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 3500);
    }
  }

  private setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AppController();
});

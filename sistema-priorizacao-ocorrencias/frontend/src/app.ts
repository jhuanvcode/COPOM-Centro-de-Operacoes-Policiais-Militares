import { Ocorrencia, CriterioOrdenacao, BenchmarkResult } from './types.js';
import { ApiService } from './api.js';

export class App {
  private ocorrencias: Ocorrencia[] = [];
  private criterioAtual: CriterioOrdenacao = 'GRAVIDADE_DECRESCENTE';
  private algoritmoAtual: string = 'QuickSort';
  private benchmarkResultados: BenchmarkResult[] = [];

  constructor() {
    this.initEventListeners();
    this.carregarDadosIniciais();
  }

  private async carregarDadosIniciais(): Promise<void> {
    this.mostrarStatusCarregamento(true);
    this.ocorrencias = await ApiService.getOcorrencias();
    this.mostrarStatusCarregamento(false);
    this.atualizarEstatisticas();
    this.renderizarTabela();
  }

  private initEventListeners(): void {
    const btnCriterios = document.querySelectorAll<HTMLButtonElement>('.btn-criterio');
    btnCriterios.forEach(btn => {
      btn.addEventListener('click', async () => {
        btnCriterios.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.criterioAtual = (btn.dataset.criterio as CriterioOrdenacao) || 'GRAVIDADE_DECRESCENTE';
        await this.executarOrdenacao();
      });
    });

    const selectAlgo = document.getElementById('select-algoritmo') as HTMLSelectElement | null;
    if (selectAlgo) {
      selectAlgo.addEventListener('change', async () => {
        this.algoritmoAtual = selectAlgo.value;
        await this.executarOrdenacao();
      });
    }

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

    const btnBench = document.getElementById('btn-benchmark') as HTMLButtonElement | null;
    if (btnBench) {
      btnBench.addEventListener('click', async () => {
        await this.executarBenchmark();
      });
    }
  }

  private async executarOrdenacao(): Promise<void> {
    const badgeTempo = document.getElementById('badge-tempo-execucao');
    if (badgeTempo) badgeTempo.textContent = 'Ordenando...';

    const resp = await ApiService.ordenar(this.criterioAtual, this.algoritmoAtual, this.ocorrencias);
    this.ocorrencias = resp.ocorrencias;

    if (badgeTempo) {
      badgeTempo.textContent = `${resp.tempoMs.toFixed(3)} ms (${resp.algoritmo})`;
    }

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
    this.benchmarkResultados = resp.resultados;

    this.renderizarTabelaBenchmark(resp.resultados);
    this.desenharGraficoBenchmark(resp.resultados);

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
    const limite = Math.min(25, this.ocorrencias.length);

    for (let i = 0; i < limite; i++) {
      const o = this.ocorrencias[i];
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
      infoFila.textContent = `Exibindo TOP ${limite} de ${this.ocorrencias.length.toLocaleString('pt-BR')} chamados`;
    }
  }

  private despacharViatura(id: string): void {
    const index = this.ocorrencias.findIndex(o => o.id === id);
    if (index !== -1) {
      const removida = this.ocorrencias.splice(index, 1)[0];
      this.mostrarNotificacao(`Viatura despachada para chamado ${removida.id} (${removida.descricao})!`);
      this.atualizarEstatisticas();
      this.renderizarTabela();
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

  private desenharGraficoBenchmark(resultados: BenchmarkResult[]): void {
    const canvas = document.getElementById('canvas-grafico') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (resultados.length === 0) return;

    const maxTempo = Math.max(...resultados.map(r => r.tempoMs), 1);
    const barWidth = 48;
    const espaco = (width - 80) / resultados.length;

    resultados.forEach((r, idx) => {
      const x = 50 + idx * espaco + (espaco - barWidth) / 2;
      const barHeight = Math.max(10, (r.tempoMs / maxTempo) * (height - 80));
      const y = height - 40 - barHeight;

      const gradient = ctx.createLinearGradient(0, y, 0, height - 40);
      if (r.nome.includes('Insertion')) {
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#991b1b');
      } else {
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(1, '#0e7490');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${r.tempoMs.toFixed(2)}ms`, x + barWidth / 2, y - 6);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      const label = r.nome.split(' ')[0];
      ctx.fillText(label, x + barWidth / 2, height - 20);
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
  new App();
});

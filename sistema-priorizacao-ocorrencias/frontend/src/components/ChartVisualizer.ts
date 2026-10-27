import { BenchmarkResult } from '../types/index.js';

export class ChartVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvasId: string) {
    const el = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!el) throw new Error(`Canvas #${canvasId} não encontrado.`);
    this.canvas = el;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível obter contexto 2D do Canvas.');
    this.ctx = context;
  }

  public render(resultados: BenchmarkResult[]): void {
    const width = (this.canvas.width = this.canvas.parentElement?.clientWidth || 450);
    const height = (this.canvas.height = 200);

    this.ctx.clearRect(0, 0, width, height);

    if (resultados.length === 0) return;

    // Gridlines sutis de telemetria CRT
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;
    for (let y = 30; y < height - 30; y += 35) {
      this.ctx.beginPath();
      this.ctx.moveTo(8, y);
      this.ctx.lineTo(width - 8, y);
      this.ctx.stroke();
    }

    const maxTempo = Math.max(...resultados.map(r => r.tempoMs), 0.1);
    const espaco = width / resultados.length;
    const barWidth = Math.min(48, espaco * 0.62);

    resultados.forEach((r, idx) => {
      const x = idx * espaco + (espaco - barWidth) / 2;
      const barHeight = Math.max(8, (r.tempoMs / maxTempo) * (height - 75));
      const y = height - 35 - barHeight;

      // Gradiente metálico Cult UI com destaque especular
      const gradient = this.ctx.createLinearGradient(0, y, 0, height - 35);
      if (r.nome.includes('Insertion')) {
        gradient.addColorStop(0, '#f87171');
        gradient.addColorStop(0.3, '#ef4444');
        gradient.addColorStop(1, '#7f1d1d');
      } else {
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(0.3, '#0284c7');
        gradient.addColorStop(1, '#0c4a6e');
      }

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
      this.ctx.fill();

      // Linha especular na crista da barra
      this.ctx.strokeStyle = r.nome.includes('Insertion') ? 'rgba(254, 202, 202, 0.8)' : 'rgba(186, 230, 253, 0.85)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 2, y + 1);
      this.ctx.lineTo(x + barWidth - 2, y + 1);
      this.ctx.stroke();

      // Rótulo do tempo no topo da barra
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = 'bold 11px "JetBrains Mono", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${r.tempoMs.toFixed(1)}ms`, x + barWidth / 2, y - 6);

      // Nome abreviado do algoritmo na base
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '600 10px "Inter", sans-serif';
      const label = r.nome.split(' ')[0];
      this.ctx.fillText(label, x + barWidth / 2, height - 14);
    });
  }
}

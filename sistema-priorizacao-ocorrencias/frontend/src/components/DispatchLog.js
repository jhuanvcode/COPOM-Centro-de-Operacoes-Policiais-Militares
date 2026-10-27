export class DispatchLog {
  constructor(elementId) {
    this.logElement = document.getElementById(elementId);
    this.historico = [];
  }

  registrar(despacho) {
    this.historico.unshift(despacho);
    if (this.historico.length > 8) {
      this.historico.pop();
    }
    this.render();
  }

  render() {
    if (!this.logElement) return;

    if (this.historico.length === 0) {
      this.logElement.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); text-align: center; padding: 16px;">
          AGUARDANDO DESPACHO DE VIATURAS NESTA SESSÃO...
        </div>
      `;
      return;
    }

    this.logElement.innerHTML = this.historico.map(v => `
      <div class="dispatch-item">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.8);"></span>
          <span style="font-family: var(--font-mono); color: #38bdf8; font-weight: 700; font-size: 11px;">${v.idOcorrencia}</span>
          <span style="color: #f1f5f9; font-weight: 600; font-size: 12px;">${v.descricao}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="color: var(--text-tertiary); font-size: 11px;">${v.regiao}</span>
          <span style="color: #34d399; font-family: var(--font-mono); font-size: 11px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); padding: 1px 6px; border-radius: 4px;">${v.horarioDespacho}</span>
        </div>
      </div>
    `).join('');
  }
}

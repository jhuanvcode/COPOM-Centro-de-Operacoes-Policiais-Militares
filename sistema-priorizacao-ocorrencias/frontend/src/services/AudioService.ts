/**
 * Serviço de áudio sintetizado para notificações policiais via Web Audio API.
 */
export class AudioService {
  private static ctx: AudioContext | null = null;
  public static audioAtivo: boolean = true;

  private static getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Toca um bip de rádio policial tático (dois tons rápidos).
   */
  public static tocarBipDespacho(): void {
    if (!this.audioAtivo) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1760, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {
      // Audio context policy em navegadores silenciosos
    }
  }

  /**
   * Toca alerta sonoro de alta gravidade (chamado crítico).
   */
  public static tocarAlertaCritico(): void {
    if (!this.audioAtivo) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.31);
    } catch (e) {
      // Ignora falhas em navegadores sem suporte
    }
  }
}

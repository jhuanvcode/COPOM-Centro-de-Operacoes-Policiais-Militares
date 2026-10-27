package br.com.policia.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Entidade central representando um chamado / ocorrência policial na central 190.
 */
public class Ocorrencia {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final String id;
    private final TipoOcorrencia tipo;
    private final int gravidade; // Escala 1 a 10
    private final LocalDateTime dataHora;
    private final int tempoAtendimentoMinutos; // Tempo estimado de atendimento / resposta
    private final double distanciaKm; // Distância até a viatura mais próxima
    private final Regiao regiao;

    public Ocorrencia(String id, TipoOcorrencia tipo, int gravidade, LocalDateTime dataHora,
                      int tempoAtendimentoMinutos, double distanciaKm, Regiao regiao) {
        this.id = id;
        this.tipo = tipo;
        this.gravidade = gravidade;
        this.dataHora = dataHora;
        this.tempoAtendimentoMinutos = tempoAtendimentoMinutos;
        this.distanciaKm = distanciaKm;
        this.regiao = regiao;
    }

    public String getId() {
        return id;
    }

    public TipoOcorrencia getTipo() {
        return tipo;
    }

    public int getGravidade() {
        return gravidade;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public int getTempoAtendimentoMinutos() {
        return tempoAtendimentoMinutos;
    }

    public double getDistanciaKm() {
        return distanciaKm;
    }

    public Regiao getRegiao() {
        return regiao;
    }

    /**
     * Fórmula de triagem operacional (Score de Risco):
     * - Gravidade tem peso preponderante (x 10).
     * - Proximidade da viatura garante resposta rápida (quanto menor a distância, maior a pontuação).
     * - Tempo de atendimento longo adiciona urgência por complexidade.
     */
    public double getScoreRisco() {
        double fatorDistancia = Math.max(0.1, 50.0 - distanciaKm);
        return (gravidade * 15.0) + fatorDistancia + (tempoAtendimentoMinutos * 0.5);
    }

    @Override
    public String toString() {
        return String.format("[%s] %-28s | Grav: %2d/10 | Data: %s | Tempo: %3d min | Dist: %5.1f km | %s",
                id,
                tipo.name().length() > 28 ? tipo.name().substring(0, 28) : tipo.name(),
                gravidade,
                dataHora.format(FORMATTER),
                tempoAtendimentoMinutos,
                distanciaKm,
                regiao.name());
    }

    public String toRowFormat() {
        return String.format("| %-8s | %-32s | %-9d | %s | %-12s | %-7.1f km | %-12s |",
                id,
                tipo.getDescricao(),
                gravidade,
                dataHora.format(FORMATTER),
                tempoAtendimentoMinutos + " min",
                distanciaKm,
                regiao.name());
    }
}

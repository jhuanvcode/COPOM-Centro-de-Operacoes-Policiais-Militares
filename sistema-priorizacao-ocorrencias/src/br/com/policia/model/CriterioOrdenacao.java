package br.com.policia.model;

import java.util.Comparator;
import java.util.Map;

/**
 * Critérios de ordenação e priorização de ocorrências policiais.
 */
public enum CriterioOrdenacao {

    GRAVIDADE_DECRESCENTE(
        "Gravidade (Maior para Menor - Urgência Crítica)",
        (o1, o2) -> {
            int comp = Integer.compare(o2.getGravidade(), o1.getGravidade());
            if (comp != 0) return comp;
            return o1.getDataHora().compareTo(o2.getDataHora()); // desempate por quem esperou mais
        }
    ),

    TEMPO_ATENDIMENTO_CRESCENTE(
        "Tempo de Atendimento (Menor para Maior - Resolução Rápida)",
        (o1, o2) -> {
            int comp = Integer.compare(o1.getTempoAtendimentoMinutos(), o2.getTempoAtendimentoMinutos());
            if (comp != 0) return comp;
            return Integer.compare(o2.getGravidade(), o1.getGravidade());
        }
    ),

    DISTANCIA_CRESCENTE(
        "Distância (Mais Próximo Primeiro - Resposta Imediata)",
        (o1, o2) -> {
            int comp = Double.compare(o1.getDistanciaKm(), o2.getDistanciaKm());
            if (comp != 0) return comp;
            return Integer.compare(o2.getGravidade(), o1.getGravidade());
        }
    ),

    DATA_CRONOLOGICA(
        "Data e Hora (Mais Antiga Primeiro - Fila FIFO)",
        (o1, o2) -> o1.getDataHora().compareTo(o2.getDataHora())
    ),

    SCORE_RISCO_TRIAGEM(
        "Score Composto de Risco (Gravidade + Proximidade + Espera)",
        (o1, o2) -> Double.compare(o2.getScoreRisco(), o1.getScoreRisco())
    );

    private final String descricao;
    private final Comparator<Ocorrencia> comparator;

    CriterioOrdenacao(String descricao, Comparator<Ocorrencia> comparator) {
        this.descricao = descricao;
        this.comparator = comparator;
    }

    public String getDescricao() {
        return descricao;
    }

    public Comparator<Ocorrencia> getComparator() {
        return comparator;
    }

    /**
     * Cria um critério dinâmico ordenando por regiões com maior volume de ocorrências.
     */
    public static Comparator<Ocorrencia> porRegiaoComMaiorVolume(Map<Regiao, Integer> contagemPorRegiao) {
        return (o1, o2) -> {
            int count1 = contagemPorRegiao.getOrDefault(o1.getRegiao(), 0);
            int count2 = contagemPorRegiao.getOrDefault(o2.getRegiao(), 0);
            int comp = Integer.compare(count2, count1); // Regiões mais sobrecarregadas primeiro
            if (comp != 0) return comp;
            return Integer.compare(o2.getGravidade(), o1.getGravidade());
        };
    }
}

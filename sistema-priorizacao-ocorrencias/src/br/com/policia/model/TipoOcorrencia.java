package br.com.policia.model;

/**
 * Representa os tipos de ocorrências policiais com seus níveis de severidade base.
 */
public enum TipoOcorrencia {
    HOMICIDIO("Homicídio / Tentativa de Homicídio", 10),
    SEQUESTRO("Sequestro e Cárcere Privado", 9),
    ROUBO_A_MAO_ARMADA("Roubo com Emprego de Arma de Fogo", 9),
    VIOLENCIA_DOMESTICA("Violência Doméstica (Lei Maria da Penha)", 8),
    TRAFICO_DE_DROGAS("Tráfico de Entorpecentes em Flagrante", 7),
    ACIDENTE_GRAVE("Acidente de Trânsito com Vítimas Graves", 7),
    ROUBO("Roubo / Assalto", 6),
    FURTO_VEICULO("Furto de Veículo", 5),
    AGRESSAO("Lesão Corporal / Vias de Fato", 5),
    FURTO("Furto Simples", 3),
    PERTURBACAO_SOSSEGO("Perturbação do Sossego / Desinteligência", 2),
    OUTROS("Ocorrência Geral", 3);

    private final String descricao;
    private final int gravidadeBase;

    TipoOcorrencia(String descricao, int gravidadeBase) {
        this.descricao = descricao;
        this.gravidadeBase = gravidadeBase;
    }

    public String getDescricao() {
        return descricao;
    }

    public int getGravidadeBase() {
        return gravidadeBase;
    }
}

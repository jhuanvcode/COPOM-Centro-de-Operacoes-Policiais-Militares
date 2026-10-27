package br.com.policia.model;

/**
 * Regiões de cobertura das viaturas policiais e batalhões.
 */
public enum Regiao {
    CENTRO("Região Central / Batalhão 1"),
    ZONA_NORTE("Zona Norte / Batalhão 2"),
    ZONA_SUL("Zona Sul / Batalhão 3"),
    ZONA_LESTE("Zona Leste / Batalhão 4"),
    ZONA_OESTE("Zona Oeste / Batalhão 5"),
    METROPOLITANA("Região Metropolitana / Batalhão 6");

    private final String nomeCompleto;

    Regiao(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }
}

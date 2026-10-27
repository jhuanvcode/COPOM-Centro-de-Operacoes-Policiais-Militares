package br.com.policia.generator;

import br.com.policia.model.Ocorrencia;
import br.com.policia.model.Regiao;
import br.com.policia.model.TipoOcorrencia;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Gerador de grandes volumes de dados sintéticos de ocorrências policiais.
 */
public class OcorrenciaGenerator {

    private static final Random RANDOM = new Random(42);

    public static Ocorrencia[] gerarOcorrencias(int quantidade) {
        return gerarOcorrencias(quantidade, false);
    }

    public static Ocorrencia[] gerarOcorrencias(int quantidade, boolean aleatorio) {
        Random rng = aleatorio ? new Random() : new Random(42);
        Ocorrencia[] lista = new Ocorrencia[quantidade];
        TipoOcorrencia[] tipos = TipoOcorrencia.values();
        Regiao[] regioes = Regiao.values();
        LocalDateTime agora = LocalDateTime.now();

        int[] pesos = { 2, 2, 8, 12, 10, 15, 18, 14, 15, 25, 30, 20 };

        for (int i = 0; i < quantidade; i++) {
            String id = String.format("OC-%06d", (i + 1));
            TipoOcorrencia tipo = selecionarTipoPonderado(tipos, pesos, rng);

            int variacao = rng.nextInt(3) - 1;
            int gravidade = Math.clamp(tipo.getGravidadeBase() + variacao, 1, 10);

            int minutosAtras = rng.nextInt(72 * 60);
            LocalDateTime dataHora = agora.minusMinutes(minutosAtras);

            int tempoAtendimento = 5 + rng.nextInt(85);
            double distanciaKm = Math.round((0.5 + (rng.nextDouble() * 29.5)) * 10.0) / 10.0;
            Regiao regiao = regioes[rng.nextInt(regioes.length)];

            lista[i] = new Ocorrencia(id, tipo, gravidade, dataHora, tempoAtendimento, distanciaKm, regiao);
        }

        return lista;
    }

    public static Ocorrencia[] clonar(Ocorrencia[] original) {
        Ocorrencia[] copia = new Ocorrencia[original.length];
        System.arraycopy(original, 0, copia, 0, original.length);
        return copia;
    }

    public static Map<Regiao, Integer> contarPorRegiao(Ocorrencia[] ocorrencias) {
        Map<Regiao, Integer> mapa = new EnumMap<>(Regiao.class);
        for (Ocorrencia o : ocorrencias) {
            mapa.put(o.getRegiao(), mapa.getOrDefault(o.getRegiao(), 0) + 1);
        }
        return mapa;
    }

    private static TipoOcorrencia selecionarTipoPonderado(TipoOcorrencia[] tipos, int[] pesos, Random rng) {
        int totalPeso = 0;
        for (int p : pesos) totalPeso += p;
        int r = rng.nextInt(totalPeso);
        int acumulado = 0;
        for (int i = 0; i < tipos.length; i++) {
            acumulado += pesos[i];
            if (r < acumulado) return tipos[i];
        }
        return tipos[tipos.length - 1];
    }
}

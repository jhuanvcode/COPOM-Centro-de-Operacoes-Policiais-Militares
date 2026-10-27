package br.com.policia.app;

import br.com.policia.benchmark.BenchmarkResult;
import br.com.policia.benchmark.BenchmarkRunner;
import br.com.policia.generator.OcorrenciaGenerator;
import br.com.policia.model.CriterioOrdenacao;
import br.com.policia.model.Ocorrencia;
import br.com.policia.model.Regiao;
import br.com.policia.sorting.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Servidor HTTP embutido para alimentar o frontend TypeScript e servir a interface web.
 */
public class ApiServer {

    private static final int PORT = 8080;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final List<SortAlgorithm> ALGORITMOS = List.of(
            new QuickSort(),
            new MergeSort(),
            new HeapSort(),
            new JavaNativeSort(),
            new InsertionSort()
    );

    private static Ocorrencia[] ocorrenciasAtuais = OcorrenciaGenerator.gerarOcorrencias(1_000, true);

    public static void main(String[] args) throws IOException {
        iniciarServidor(PORT);
    }

    public static void iniciarServidor(int porta) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(porta), 0);

        server.createContext("/api/ocorrencias", ApiServer::handleOcorrencias);
        server.createContext("/api/ordenar", ApiServer::handleOrdenar);
        server.createContext("/api/benchmark", ApiServer::handleBenchmark);
        server.createContext("/api/gerar", ApiServer::handleGerar);
        server.createContext("/", ApiServer::handleStaticFiles);

        server.setExecutor(java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor());
        server.start();

        System.out.println("================================================================================");
        System.out.printf("  SERVIDOR WEB & API INICIADO COM SUCESSO NA PORTA %d%n", porta);
        System.out.printf("  Painel COPOM / Frontend: http://localhost:%d%n", porta);
        System.out.println("================================================================================");
    }

    private static void handleOcorrencias(HttpExchange exchange) throws IOException {
        adicionarCors(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        String json = ocorrenciasToJson(ocorrenciasAtuais);
        enviarRespostaJson(exchange, 200, json);
    }

    private static void handleGerar(HttpExchange exchange) throws IOException {
        adicionarCors(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
        int qtd = 1_000;
        try {
            if (query.containsKey("qtd")) {
                qtd = Math.max(10, Math.min(200_000, Integer.parseInt(query.get("qtd"))));
            }
        } catch (NumberFormatException ignored) {}

        ocorrenciasAtuais = OcorrenciaGenerator.gerarOcorrencias(qtd, true);
        String json = String.format("{\"status\":\"ok\",\"total\":%d}", ocorrenciasAtuais.length);
        enviarRespostaJson(exchange, 200, json);
    }

    private static void handleOrdenar(HttpExchange exchange) throws IOException {
        adicionarCors(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
        String crit = query.getOrDefault("criterio", "GRAVIDADE_DECRESCENTE");
        String algoNome = query.getOrDefault("algoritmo", "QuickSort");

        Comparator<Ocorrencia> comparator = obterComparator(crit, ocorrenciasAtuais);
        SortAlgorithm algo = obterAlgoritmo(algoNome);

        Ocorrencia[] copia = OcorrenciaGenerator.clonar(ocorrenciasAtuais);
        long start = System.nanoTime();
        algo.sort(copia, comparator);
        long elapsedNanos = System.nanoTime() - start;

        ocorrenciasAtuais = copia;

        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"tempoMs\":").append(elapsedNanos / 1_000_000.0).append(",");
        sb.append("\"tempoNanos\":").append(elapsedNanos).append(",");
        sb.append("\"algoritmo\":\"").append(algo.getName()).append("\",");
        sb.append("\"criterio\":\"").append(crit).append("\",");
        sb.append("\"total\":").append(copia.length).append(",");
        sb.append("\"ocorrencias\":").append(ocorrenciasToJson(copia));
        sb.append("}");

        enviarRespostaJson(exchange, 200, sb.toString());
    }

    private static void handleBenchmark(HttpExchange exchange) throws IOException {
        adicionarCors(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
        String crit = query.getOrDefault("criterio", "GRAVIDADE_DECRESCENTE");
        int qtd = ocorrenciasAtuais.length;
        if (query.containsKey("qtd")) {
            try {
                qtd = Math.max(100, Math.min(100_000, Integer.parseInt(query.get("qtd"))));
            } catch (Exception ignored) {}
        }

        Ocorrencia[] base = (qtd == ocorrenciasAtuais.length) ? ocorrenciasAtuais : OcorrenciaGenerator.gerarOcorrencias(qtd, true);
        Comparator<Ocorrencia> comparator = obterComparator(crit, base);

        List<BenchmarkResult> resultados = BenchmarkRunner.runAll(ALGORITMOS, base, comparator);

        StringBuilder sb = new StringBuilder();
        sb.append("{\"total\":").append(qtd).append(",\"criterio\":\"").append(crit).append("\",\"resultados\":[");
        for (int i = 0; i < resultados.size(); i++) {
            BenchmarkResult r = resultados.get(i);
            if (i > 0) sb.append(",");
            sb.append("{");
            sb.append("\"nome\":\"").append(r.algorithmName()).append("\",");
            sb.append("\"complexidade\":\"").append(r.complexity()).append("\",");
            sb.append("\"tempoMs\":").append(r.getTimeMillis()).append(",");
            sb.append("\"tempoNanos\":").append(r.timeNanos()).append(",");
            sb.append("\"vazao\":").append(Math.round(r.getThroughputItemsPerSec())).append(",");
            sb.append("\"valido\":").append(r.sortedCorrectly());
            sb.append("}");
        }
        sb.append("]}");

        enviarRespostaJson(exchange, 200, sb.toString());
    }

    private static void handleStaticFiles(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        if ("/".equals(path) || path.isEmpty()) {
            path = "/index.html";
        }

        Path basePath = Paths.get("frontend");
        if (!Files.exists(basePath)) {
            Path alt1 = Paths.get("sistema-priorizacao-ocorrencias", "frontend");
            Path alt2 = Paths.get("..", "frontend");
            if (Files.exists(alt1)) {
                basePath = alt1;
            } else if (Files.exists(alt2)) {
                basePath = alt2;
            }
        }
        Path requestedFile = basePath.resolve(path.substring(1)).normalize();

        if (!requestedFile.startsWith(basePath) || !Files.exists(requestedFile) || Files.isDirectory(requestedFile)) {
            byte[] notFound = "<h1>404 - Arquivo não encontrado</h1>".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(404, notFound.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(notFound);
            }
            return;
        }

        String mime = obterMimeType(requestedFile.toString());
        byte[] bytes = Files.readAllBytes(requestedFile);

        exchange.getResponseHeaders().set("Content-Type", mime);
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String obterMimeType(String fileName) {
        if (fileName.endsWith(".html")) return "text/html; charset=UTF-8";
        if (fileName.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (fileName.endsWith(".ts")) return "application/typescript; charset=UTF-8";
        if (fileName.endsWith(".css")) return "text/css; charset=UTF-8";
        if (fileName.endsWith(".json")) return "application/json; charset=UTF-8";
        if (fileName.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private static void adicionarCors(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void enviarRespostaJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static Comparator<Ocorrencia> obterComparator(String crit, Ocorrencia[] base) {
        return switch (crit) {
            case "TEMPO_ATENDIMENTO_CRESCENTE" -> CriterioOrdenacao.TEMPO_ATENDIMENTO_CRESCENTE.getComparator();
            case "DISTANCIA_CRESCENTE" -> CriterioOrdenacao.DISTANCIA_CRESCENTE.getComparator();
            case "DATA_CRONOLOGICA" -> CriterioOrdenacao.DATA_CRONOLOGICA.getComparator();
            case "SCORE_RISCO_TRIAGEM" -> CriterioOrdenacao.SCORE_RISCO_TRIAGEM.getComparator();
            case "REGIAO_VOLUME" -> CriterioOrdenacao.porRegiaoComMaiorVolume(OcorrenciaGenerator.contarPorRegiao(base));
            default -> CriterioOrdenacao.GRAVIDADE_DECRESCENTE.getComparator();
        };
    }

    private static SortAlgorithm obterAlgoritmo(String algoNome) {
        for (SortAlgorithm a : ALGORITMOS) {
            if (a.getName().toLowerCase().contains(algoNome.toLowerCase())) {
                return a;
            }
        }
        return new QuickSort();
    }

    private static String ocorrenciasToJson(Ocorrencia[] array) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        int limite = Math.min(array.length, 500);
        for (int i = 0; i < limite; i++) {
            Ocorrencia o = array[i];
            if (i > 0) sb.append(",");
            sb.append("{");
            sb.append("\"id\":\"").append(o.getId()).append("\",");
            sb.append("\"tipo\":\"").append(o.getTipo().name()).append("\",");
            sb.append("\"descricao\":\"").append(o.getTipo().getDescricao()).append("\",");
            sb.append("\"gravidade\":").append(o.getGravidade()).append(",");
            sb.append("\"dataHora\":\"").append(o.getDataHora().format(FORMATTER)).append("\",");
            sb.append("\"tempoAtendimento\":").append(o.getTempoAtendimentoMinutos()).append(",");
            sb.append("\"distanciaKm\":").append(o.getDistanciaKm()).append(",");
            sb.append("\"regiao\":\"").append(o.getRegiao().name()).append("\",");
            sb.append("\"regiaoNome\":\"").append(o.getRegiao().getNomeCompleto()).append("\",");
            sb.append("\"scoreRisco\":").append(Math.round(o.getScoreRisco() * 10.0) / 10.0);
            sb.append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    private static Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isBlank()) return map;
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length == 2) {
                map.put(pair[0], pair[1]);
            }
        }
        return map;
    }
}

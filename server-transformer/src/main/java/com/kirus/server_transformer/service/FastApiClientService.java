package com.kirus.server_transformer.service;

import com.kirus.server_transformer.dtos.FastApiThermalRequest;
import com.kirus.server_transformer.dtos.FastApiThermalResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class FastApiClientService {

    private static final Logger logger = LoggerFactory.getLogger(FastApiClientService.class);

    @Value("${thermal.analysis.api.url:http://localhost:8000}")
    private String fastApiBaseUrl;

    @Value("${thermal.analysis.api.timeout:300000}")
    private int timeoutMs;

    @Value("${thermal.analysis.api.retry.max-attempts:3}")
    private int maxRetryAttempts;

    @Value("${thermal.analysis.api.retry.delay:1000}")
    private int retryDelayMs;

    @Autowired
    private WebClient thermalAnalysisWebClient;

    @Autowired
    @Qualifier("thermalAnalysisRestTemplate")
    private RestTemplate restTemplate;

    /**
     * Synchronous call to FastAPI thermal analysis endpoint using WebClient
     */
    public FastApiThermalResponse analyzeThermalImage(FastApiThermalRequest request) {
        String url = fastApiBaseUrl + "/analyze";

        try {
            logger.info("Calling FastAPI thermal analysis at: {}", url);
            logger.debug("Request payload: {}", request);

            long startTime = System.currentTimeMillis();

            // First, get the raw response as string to see what we're dealing with
            String rawResponse = thermalAnalysisWebClient
                    .post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .retryWhen(Retry.backoff(maxRetryAttempts, Duration.ofMillis(retryDelayMs))
                            .filter(throwable -> throwable instanceof WebClientException))
                    .block();

            logger.info("Raw FastAPI response: {}", rawResponse);

            // Try to parse the response
            FastApiThermalResponse response = parseResponse(rawResponse);

            long endTime = System.currentTimeMillis();
            logger.info("FastAPI call completed in {} ms", endTime - startTime);

            if (response != null) {
                response.setProcessingTimeMs((int) (endTime - startTime));
                return response;
            } else {
                throw new RuntimeException("FastAPI returned empty response");
            }

        } catch (Exception e) {
            logger.error("Error calling FastAPI thermal analysis", e);
            throw new RuntimeException("FastAPI thermal analysis failed: " + e.getMessage(), e);
        }
    }

    private FastApiThermalResponse parseResponse(String rawResponse) {
        try {
            // Try to parse as object first
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(rawResponse, FastApiThermalResponse.class);
        } catch (Exception e) {
            logger.warn("Failed to parse response as object, attempting alternative parsing: {}", e.getMessage());
            return parseAlternativeFormat(rawResponse);
        }
    }

    private FastApiThermalResponse parseAlternativeFormat(String rawResponse) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();

            // Check if it's an array response
            if (rawResponse.trim().startsWith("[")) {
                logger.info("Detected array response format, converting to expected object format");

                // Parse as generic array first to understand structure
                JsonNode arrayNode = objectMapper.readTree(rawResponse);

                // If it's an empty array, return a default response
                if (arrayNode.size() == 0) {
                    logger.warn("Received empty array from FastAPI");
                    FastApiThermalResponse emptyResponse = new FastApiThermalResponse();
                    emptyResponse.setOverallAssessment("normal");
                    emptyResponse.setAnomalyScore(0.0);
                    emptyResponse.setDetections(new ArrayList<>());
                    emptyResponse.setDetectionCount(0);
                    return emptyResponse;
                }

                // If array has items, try to convert first item to expected format
                JsonNode firstItem = arrayNode.get(0);

                // Check if the first item looks like our expected response
                if (firstItem.has("overall_assessment") || firstItem.has("detections")) {
                    return objectMapper.treeToValue(firstItem, FastApiThermalResponse.class);
                }

                // If array contains detection objects directly, wrap them
                FastApiThermalResponse response = new FastApiThermalResponse();
                response.setOverallAssessment("warning");
                response.setAnomalyScore(0.5);

                List<FastApiThermalResponse.FastApiDetection> detections = new ArrayList<>();
                for (JsonNode detectionNode : arrayNode) {
                    try {
                        FastApiThermalResponse.FastApiDetection detection =
                            objectMapper.treeToValue(detectionNode, FastApiThermalResponse.FastApiDetection.class);
                        detections.add(detection);
                    } catch (Exception e) {
                        logger.warn("Failed to parse detection from array item: {}", detectionNode, e);
                    }
                }

                response.setDetections(detections);
                response.setDetectionCount(detections.size());
                return response;
            }

            // If not an array, try parsing as a different object format
            JsonNode jsonNode = objectMapper.readTree(rawResponse);

            // Try to map common field variations
            FastApiThermalResponse response = new FastApiThermalResponse();

            // Map assessment field variations
            if (jsonNode.has("overall_assessment")) {
                response.setOverallAssessment(jsonNode.get("overall_assessment").asText());
            } else if (jsonNode.has("assessment")) {
                response.setOverallAssessment(jsonNode.get("assessment").asText());
            } else {
                response.setOverallAssessment("normal");
            }

            // Map anomaly score variations
            if (jsonNode.has("anomaly_score")) {
                response.setAnomalyScore(jsonNode.get("anomaly_score").asDouble());
            } else if (jsonNode.has("score")) {
                response.setAnomalyScore(jsonNode.get("score").asDouble());
            } else {
                response.setAnomalyScore(0.0);
            }

            // Handle detections
            List<FastApiThermalResponse.FastApiDetection> detections = new ArrayList<>();
            if (jsonNode.has("detections") && jsonNode.get("detections").isArray()) {
                for (JsonNode detectionNode : jsonNode.get("detections")) {
                    try {
                        FastApiThermalResponse.FastApiDetection detection =
                            objectMapper.treeToValue(detectionNode, FastApiThermalResponse.FastApiDetection.class);
                        detections.add(detection);
                    } catch (Exception e) {
                        logger.warn("Failed to parse detection: {}", detectionNode, e);
                    }
                }
            }

            response.setDetections(detections);
            response.setDetectionCount(detections.size());

            return response;

        } catch (Exception e) {
            logger.error("Failed to parse alternative response format", e);

            // Return a fallback response to prevent total failure
            FastApiThermalResponse fallbackResponse = new FastApiThermalResponse();
            fallbackResponse.setOverallAssessment("error");
            fallbackResponse.setAnomalyScore(0.0);
            fallbackResponse.setDetections(new ArrayList<>());
            fallbackResponse.setDetectionCount(0);
            fallbackResponse.setMessage("Failed to parse FastAPI response: " + e.getMessage());

            return fallbackResponse;
        }
    }

    /**
     * Fallback synchronous call using RestTemplate
     */
    public FastApiThermalResponse analyzeThermalImageWithRestTemplate(FastApiThermalRequest request) {
        String url = fastApiBaseUrl + "/analyze";

        try {
            logger.info("Calling FastAPI thermal analysis (RestTemplate fallback) at: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<FastApiThermalRequest> entity = new HttpEntity<>(request, headers);

            long startTime = System.currentTimeMillis();
            ResponseEntity<FastApiThermalResponse> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, FastApiThermalResponse.class);
            long endTime = System.currentTimeMillis();

            logger.info("FastAPI call (RestTemplate) completed in {} ms", endTime - startTime);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                FastApiThermalResponse apiResponse = response.getBody();
                apiResponse.setProcessingTimeMs((int) (endTime - startTime));
                return apiResponse;
            } else {
                throw new RuntimeException("FastAPI returned error status: " + response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            logger.error("Client error calling FastAPI: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("FastAPI client error: " + e.getMessage(), e);
        } catch (HttpServerErrorException e) {
            logger.error("Server error calling FastAPI: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("FastAPI server error: " + e.getMessage(), e);
        } catch (ResourceAccessException e) {
            logger.error("Connection error calling FastAPI: {}", e.getMessage());
            throw new RuntimeException("FastAPI connection error - ensure service is running at " + fastApiBaseUrl, e);
        } catch (Exception e) {
            logger.error("Unexpected error calling FastAPI", e);
            throw new RuntimeException("Unexpected error during thermal analysis: " + e.getMessage(), e);
        }
    }

    /**
     * Asynchronous call to FastAPI thermal analysis endpoint
     */
    public CompletableFuture<FastApiThermalResponse> analyzeThermalImageAsync(FastApiThermalRequest request) {
        String url = fastApiBaseUrl + "/analyze";

        return thermalAnalysisWebClient
                .post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(FastApiThermalResponse.class)
                .timeout(Duration.ofMillis(timeoutMs))
                .retryWhen(Retry.backoff(maxRetryAttempts, Duration.ofMillis(retryDelayMs)))
                .toFuture();
    }

    /**
     * Health check for FastAPI service
     */
    public boolean isServiceHealthy() {
        try {
            String healthUrl = fastApiBaseUrl + "/health";

            String response = thermalAnalysisWebClient
                    .get()
                    .uri(healthUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            return response != null;
        } catch (Exception e) {
            logger.warn("FastAPI health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get service info from FastAPI
     */
    public String getServiceInfo() {
        try {
            String infoUrl = fastApiBaseUrl + "/info";

            return thermalAnalysisWebClient
                    .get()
                    .uri(infoUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            logger.warn("Failed to get FastAPI service info: {}", e.getMessage());
            return "Service info unavailable: " + e.getMessage();
        }
    }
}

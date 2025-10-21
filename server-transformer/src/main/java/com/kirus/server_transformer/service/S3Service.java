package com.kirus.server_transformer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;

@Service
public class S3Service {

    @Value("${supabase.storage.url}")
    private String storageUrl;

    // Use Supabase S3 properties (public bucket)
    @Value("${supabase.s3.bucket}")
    private String bucketName;

    @Value("${supabase.service.key}")
    private String serviceKey;

    private final RestClient restClient;

    public S3Service() {
        this.restClient = RestClient.create();
    }

    public String uploadFile(MultipartFile file) {
        try {
            String original = file.getOriginalFilename();
            String safeName = (original == null || original.isBlank()) ? "file" : original.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = System.currentTimeMillis() + "_" + safeName;

            String uploadUrl = storageUrl + "/object/" + bucketName + "/" + fileName;

            restClient.post()
                    .uri(uploadUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                    .contentType(MediaType.parseMediaType(file.getContentType()))
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();

            return storageUrl + "/object/public/" + bucketName + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    // New helper: construct public URL for a given key or return input if already a URL
    public String buildPublicUrl(String keyOrUrl) {
        if (keyOrUrl == null || keyOrUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Key or URL cannot be null or empty");
        }

        String trimmed = keyOrUrl.trim();
        if (trimmed.startsWith("http")) {
            return trimmed;
        }

        return storageUrl + "/object/public/" + bucketName + "/" + trimmed;
    }

    public void deleteFile(String keyOrUrl) {
        String objectKey = extractObjectKey(keyOrUrl);
        String deleteUrl = storageUrl + "/object/" + bucketName + "/" + objectKey;

        restClient.delete()
                .uri(deleteUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                .retrieve()
                .toBodilessEntity();
    }

    // Helper to extract the object key from a Supabase public URL or return the provided key unchanged
    private String extractObjectKey(String keyOrUrl) {
        if (keyOrUrl == null) return "";
        String trimmed = keyOrUrl.trim();

        if (trimmed.startsWith("http")) {
            // Try to find '/object/public/{bucket}/' segment and return the substring after it
            String marker = "/object/public/" + bucketName + "/";
            int idx = trimmed.indexOf(marker);
            if (idx != -1) {
                return trimmed.substring(idx + marker.length());
            }

            // Fallback: return last path segment
            if (trimmed.contains("/")) {
                return trimmed.substring(trimmed.lastIndexOf("/") + 1);
            }
            return trimmed;
        } else {
            // Treat as a plain key (may include folders)
            return trimmed;
        }
    }
}

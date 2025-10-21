package com.kirus.server_transformer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    // Use Supabase S3 properties (public bucket)
    @Value("${supabase.s3.bucket}")
    private String bucketName;

    @Value("${supabase.s3.endpoint}")
    private String endpoint; // e.g. https://<project>.supabase.co/storage/v1/object

    public String uploadFile(MultipartFile file) {
        try {
            String original = file.getOriginalFilename();
            String safeName = (original == null || original.isBlank()) ? "file" : original.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = System.currentTimeMillis() + "_" + safeName;

            // Upload file to S3
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(fileName)
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));

            // Construct Supabase public object URL in the form:
            // {endpoint}/public/{bucket}/{fileName}
            // If endpoint already contains 'public', don't duplicate it.
            String base = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
            String publicSegment = base.contains("/public/") || base.endsWith("/public") ? "" : "/public";
            return base + publicSegment + "/" + bucketName + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
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

        // If key contains folders, keep them; Supabase public URL requires the object path after the bucket
        String base = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
        String publicSegment = base.contains("/public/") || base.endsWith("/public") ? "" : "/public";
        return base + publicSegment + "/" + bucketName + "/" + trimmed;
    }

    public void deleteFile(String keyOrUrl) {
        String objectKey = extractObjectKey(keyOrUrl);

        final String finalKey = objectKey; // Make it final for lambda

        s3Client.deleteObject(builder -> builder
                .bucket(bucketName)
                .key(finalKey)
                .build());
    }

    public boolean doesObjectExist(String keyOrUrl) {
        try {
            String objectKey = extractObjectKey(keyOrUrl);
            final String finalKey = objectKey; // Make it final for lambda

            s3Client.headObject(builder -> builder
                    .bucket(bucketName)
                    .key(finalKey)
                    .build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Helper to extract the object key from a Supabase public URL or return the provided key unchanged
    private String extractObjectKey(String keyOrUrl) {
        if (keyOrUrl == null) return "";
        String trimmed = keyOrUrl.trim();
        if (trimmed.startsWith("http")) {
            // Try to find '/public/{bucket}/' segment and return the substring after it
            String marker = "/public/" + bucketName + "/";
            int idx = trimmed.indexOf(marker);
            if (idx != -1) {
                return trimmed.substring(idx + marker.length());
            }

            // If endpoint was configured with /public already or different form, attempt to find the bucket name
            idx = trimmed.indexOf("/" + bucketName + "/");
            if (idx != -1) {
                return trimmed.substring(idx + ("/" + bucketName + "/").length());
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

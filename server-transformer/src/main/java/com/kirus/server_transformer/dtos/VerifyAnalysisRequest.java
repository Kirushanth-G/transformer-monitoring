package com.kirus.server_transformer.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for verifying a thermal analysis (marking it as VERIFIED)
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class VerifyAnalysisRequest {

    @NotBlank(message = "Reviewed by is required")
    private String reviewedBy;

    private String comments; // Optional review comments
}


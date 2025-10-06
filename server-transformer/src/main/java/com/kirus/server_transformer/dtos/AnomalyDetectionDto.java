package com.kirus.server_transformer.dtos;

import com.kirus.server_transformer.entities.AnomalyDetection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AnomalyDetectionDto {
    private Long id;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;
    private String label;
    private BigDecimal confidence;
    private Integer area;
    private Boolean isCritical;
    private AnomalyDetection.SeverityLevel severityLevel;
    private BigDecimal temperatureCelsius;
}

package com.kirus.server_transformer.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ElectricalReadingRequest {

    private String readingStage; // FIRST_INSPECTION or SECOND_INSPECTION

    // Voltage Readings (Volts)
    private BigDecimal voltsR;
    private BigDecimal voltsY;
    private BigDecimal voltsB;
    private BigDecimal voltsNeutral;

    // Current Readings (Amps)
    private BigDecimal ampsR;
    private BigDecimal ampsY;
    private BigDecimal ampsB;
    private BigDecimal ampsNeutral;
}

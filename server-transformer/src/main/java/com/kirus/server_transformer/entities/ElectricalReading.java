package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "electrical_readings")
public class ElectricalReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_record_id", nullable = false)
    private MaintenanceRecord maintenanceRecord;

    // Reading Stage: FIRST_INSPECTION or SECOND_INSPECTION
    @Column(name = "reading_stage", length = 20, nullable = false)
    private String readingStage;

    // Voltage Readings (Volts) - Three Phases + Neutral
    @Column(name = "volts_r", precision = 10, scale = 2)
    private BigDecimal voltsR;

    @Column(name = "volts_y", precision = 10, scale = 2)
    private BigDecimal voltsY;

    @Column(name = "volts_b", precision = 10, scale = 2)
    private BigDecimal voltsB;

    @Column(name = "volts_neutral", precision = 10, scale = 2)
    private BigDecimal voltsNeutral;

    // Current Readings (Amps) - Three Phases + Neutral
    @Column(name = "amps_r", precision = 10, scale = 2)
    private BigDecimal ampsR;

    @Column(name = "amps_y", precision = 10, scale = 2)
    private BigDecimal ampsY;

    @Column(name = "amps_b", precision = 10, scale = 2)
    private BigDecimal ampsB;

    @Column(name = "amps_neutral", precision = 10, scale = 2)
    private BigDecimal ampsNeutral;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

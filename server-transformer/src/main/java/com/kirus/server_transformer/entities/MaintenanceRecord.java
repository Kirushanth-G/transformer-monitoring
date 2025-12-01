package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    // Inspector Information (Page 2)
    @Column(name = "inspector_name", length = 100)
    private String inspectorName;

    @Column(name = "supervised_by", length = 100)
    private String supervisedBy;

    @Column(name = "job_started_at")
    private LocalDateTime jobStartedAt;

    @Column(name = "job_completed_at")
    private LocalDateTime jobCompletedAt;

    // Baseline Imaging Info (Page 1)
    @Column(name = "baseline_ir_no", length = 50)
    private String baselineIrNo;

    @Column(name = "baseline_condition", length = 50)
    private String baselineCondition;

    // Engineer Notes (Page 3)
    @Column(name = "findings_summary", columnDefinition = "TEXT")
    private String findingsSummary;

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    // Status
    @Column(name = "is_finalized")
    private Boolean isFinalized = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "maintenanceRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ElectricalReading> electricalReadings = new ArrayList<>();

    // Helper methods for managing bidirectional relationships
    public void addElectricalReading(ElectricalReading reading) {
        electricalReadings.add(reading);
        reading.setMaintenanceRecord(this);
    }

    public void removeElectricalReading(ElectricalReading reading) {
        electricalReadings.remove(reading);
        reading.setMaintenanceRecord(null);
    }
}


package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "inspections")
public class Inspection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "inspection_no", length = 50)
    private String inspectionNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transformer_id")
    private Transformer transformer;

    @Column(name = "inspected_at")
    private LocalDateTime inspectedAt;

    @Column(name = "maintenance_at")
    private LocalDateTime maintenanceAt;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "branch")
    private String branch;
}

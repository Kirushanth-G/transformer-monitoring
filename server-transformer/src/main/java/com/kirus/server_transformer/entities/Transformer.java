package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "transformers")
public class Transformer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "transformer_id", unique = true, length = 50)
    private String transformerId;

    @Column(name = "location")
    private String location;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, length = 20)
    private String type; // Should be 'Bulk' or 'Distribution'

    @Column(name = "pole_no", length = 50)
    private String poleNo;

    @OneToMany(mappedBy = "transformer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images;
}

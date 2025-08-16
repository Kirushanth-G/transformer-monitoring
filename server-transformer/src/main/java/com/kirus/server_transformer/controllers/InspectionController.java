package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.InspectionCreateRequest;
import com.kirus.server_transformer.entities.Inspection;
import com.kirus.server_transformer.entities.Transformer;
import com.kirus.server_transformer.mappers.InspectionMapper;
import com.kirus.server_transformer.repositories.InspectionRepository;
import com.kirus.server_transformer.repositories.TransformerRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@RestController
@RequestMapping("/inspections")
public class InspectionController {

    private final InspectionRepository inspectionRepository;
    private final InspectionMapper inspectionMapper;
    private final TransformerRepository transformerRepository;

    @GetMapping
    public List<Inspection> getAllInspections() {
        return inspectionRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Inspection> createInspection(@RequestBody InspectionCreateRequest request) {
        Inspection inspection = inspectionMapper.toEntity(request);


        Transformer transformer = transformerRepository.findByTransformerId(request.getTransformerId()).orElse(null);
        if (transformer == null) {
            return ResponseEntity.notFound().build();
        }
        inspection.setTransformer(transformer);

        int count = inspectionRepository.countByTransformerId(inspection.getTransformer().getId());
        String inspectionNo = String.format("INSP-%03d", count + 1);
        inspection.setInspectionNo(inspectionNo);

        inspection.setStatus("Pending"); // or "In Progress" or "Completed" as needed

        inspectionRepository.save(inspection);
        return ResponseEntity.ok().build();
    }
}

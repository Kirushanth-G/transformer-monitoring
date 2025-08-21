package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.InspectionCreateRequest;
import com.kirus.server_transformer.dtos.InspectionDto;
import com.kirus.server_transformer.entities.Inspection;
import com.kirus.server_transformer.entities.Transformer;
import com.kirus.server_transformer.mappers.InspectionMapper;
import com.kirus.server_transformer.repositories.InspectionRepository;
import com.kirus.server_transformer.repositories.TransformerRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
@RestController
@RequestMapping("/inspections")
public class InspectionController {

  private final InspectionRepository inspectionRepository;
  private final InspectionMapper inspectionMapper;
  private final TransformerRepository transformerRepository;

  @GetMapping
  public List<InspectionDto> getAllInspections() {
    List<Inspection> inspections = inspectionRepository.findAll();
    return inspections.stream()
        .map(inspectionMapper::toDto)
        .toList();
  }

  @GetMapping("/{id}")
    public ResponseEntity<InspectionDto> getInspectionById(@PathVariable Long id) {
        Inspection inspection = inspectionRepository.findById(id).orElse(null);
        if (inspection == null) {
          return ResponseEntity.notFound().build();
        }
        InspectionDto inspectionDto = inspectionMapper.toDto(inspection);
        return ResponseEntity.ok(inspectionDto);
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

  @PutMapping("/{id}")
  public ResponseEntity<InspectionDto> updateInspection(@PathVariable Long id, @RequestBody InspectionCreateRequest request) {
    Inspection existingInspection = inspectionRepository.findById(id).orElse(null);
    if (existingInspection == null) {
      return ResponseEntity.notFound().build();
    }

    Inspection updatedInspection = inspectionMapper.toEntity(request);
    updatedInspection.setId(existingInspection.getId());

    Transformer transformer = transformerRepository.findByTransformerId(request.getTransformerId()).orElse(null);
    if (transformer == null) {
      return ResponseEntity.notFound().build();
    }
    updatedInspection.setTransformer(transformer);
    Inspection savedInspection = inspectionRepository.save(updatedInspection);
    InspectionDto inspectionDto = inspectionMapper.toDto(savedInspection);
    return ResponseEntity.ok(inspectionDto);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteInspection(@RequestParam Long id) {
    Inspection inspection = inspectionRepository.findById(id).orElse(null);
    if (inspection == null) {
      return ResponseEntity.notFound().build();
    }
    inspectionRepository.delete(inspection);
    return ResponseEntity.noContent().build();
  }
}

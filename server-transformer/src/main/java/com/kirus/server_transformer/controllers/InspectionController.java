package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.InspectionCreateRequest;
import com.kirus.server_transformer.dtos.InspectionDto;
import com.kirus.server_transformer.dtos.InspectionUpdateRequest;
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

    int maxRetries = 5;
    for (int i = 0; i < maxRetries; i++) {
      Integer maxNo = inspectionRepository.findMaxInspectionNoByTransformerId(transformer.getId());
      int nextNo = (maxNo == null ? 1 : maxNo + 1);
      String inspectionNo = String.format("INSP-%03d", nextNo);
      inspection.setInspectionNo(inspectionNo);
      inspection.setStatus("Pending");

      try {
        inspectionRepository.save(inspection);
        return ResponseEntity.ok().build();
      } catch (org.springframework.dao.DataIntegrityViolationException e) {
        // Duplicate key, try again
      }
    }
    return ResponseEntity.status(409).build(); // Conflict
  }

  @PutMapping("/{id}")
  public ResponseEntity<InspectionDto> updateInspection(@PathVariable Long id, @RequestBody InspectionUpdateRequest request) {
    Inspection existingInspection = inspectionRepository.findById(id).orElse(null);
    if (existingInspection == null) {
      return ResponseEntity.notFound().build();
    }

    Transformer transformer = transformerRepository.findByTransformerId(request.getTransformerId()).orElse(null);
    if (transformer == null) {
      return ResponseEntity.notFound().build();
    }

    existingInspection.setInspectionNo(request.getInspectionNo());
    existingInspection.setTransformer(transformer);
    existingInspection.setBranch(request.getBranch());
    existingInspection.setInspectedAt(request.getInspectedAt());
    existingInspection.setMaintenanceAt(request.getMaintenanceAt());
    existingInspection.setStatus(request.getStatus());

    Inspection savedInspection = inspectionRepository.save(existingInspection);
    InspectionDto inspectionDto = inspectionMapper.toDto(savedInspection);
    return ResponseEntity.ok(inspectionDto);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteInspection(@PathVariable Long id) {
    Inspection inspection = inspectionRepository.findById(id).orElse(null);
    if (inspection == null) {
      return ResponseEntity.notFound().build();
    }
    inspectionRepository.delete(inspection);
    return ResponseEntity.noContent().build();
  }
}

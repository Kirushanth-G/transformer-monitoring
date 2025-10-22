package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.InspectionCreateRequest;
import com.kirus.server_transformer.dtos.InspectionDto;
import com.kirus.server_transformer.dtos.InspectionUpdateRequest;
import com.kirus.server_transformer.dtos.PagedResponse;
import com.kirus.server_transformer.entities.Inspection;
import com.kirus.server_transformer.entities.Transformer;
import com.kirus.server_transformer.mappers.InspectionMapper;
import com.kirus.server_transformer.repositories.InspectionRepository;
import com.kirus.server_transformer.repositories.TransformerRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(
  origins = {"http://localhost:5173" , "http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com"},
  allowedHeaders = {"*"},
  methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS },
  maxAge = 3600
)
@AllArgsConstructor
@RestController
@RequestMapping("/inspections")
public class InspectionController {

  private final InspectionRepository inspectionRepository;
  private final InspectionMapper inspectionMapper;
  private final TransformerRepository transformerRepository;

  @GetMapping
  public ResponseEntity<PagedResponse<InspectionDto>> getAllInspections(
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "10") int size) {

    Pageable pageable = PageRequest.of(page, size);
    Page<Inspection> inspectionPage = inspectionRepository.findAll(pageable);

    Page<InspectionDto> inspectionDtoPage = inspectionPage.map(inspectionMapper::toDto);
    PagedResponse<InspectionDto> response = PagedResponse.of(inspectionDtoPage);

    return ResponseEntity.ok(response);
  }

  @GetMapping("/transformer/{transformerId}")
  public ResponseEntity<PagedResponse<InspectionDto>> getInspectionsByTransformer(
          @PathVariable String transformerId,
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "10") int size) {

    Transformer transformer = transformerRepository.findByTransformerId(transformerId).orElse(null);
    if (transformer == null) {
      return ResponseEntity.notFound().build();
    }

    Pageable pageable = PageRequest.of(page, size);
    Page<Inspection> inspectionPage = inspectionRepository.findByTransformerId(transformer.getId(), pageable);

    Page<InspectionDto> inspectionDtoPage = inspectionPage.map(inspectionMapper::toDto);
    PagedResponse<InspectionDto> response = PagedResponse.of(inspectionDtoPage);

    return ResponseEntity.ok(response);
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

  // Save/override annotations for an inspection image
  @PostMapping("/{id}/annotations")
  public ResponseEntity<Map<String, Object>> saveAnnotations(
      @PathVariable Long id,
      @RequestBody Map<String, Object> payload
  ) {
    // Optional: validate inspection exists
    if (!inspectionRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    // Extract count for client UI feedback
    int count = 0;
    Object feedback = payload.get("feedback");
    if (feedback instanceof Map) {
      Object annotations = ((Map<?, ?>) feedback).get("annotations");
      if (annotations instanceof List) {
        count = ((List<?>) annotations).size();
      }
    }

    // TODO: persist annotations as needed
    return ResponseEntity.ok(Map.of("saved", true, "count", count));
  }

  // Reset/delete annotations for a given inspection image
  @DeleteMapping("/{id}/annotations/{imageId}")
  public ResponseEntity<Void> resetAnnotations(
      @PathVariable Long id,
      @PathVariable String imageId
  ) {
    if (!inspectionRepository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    // TODO: delete/reset annotations for the given imageId if persisted
    return ResponseEntity.noContent().build();
  }
}
